/**
 * CombatResolver (GDD §2.1 passo 5, §3.3, §4, §4.5). TS puro, sem Phaser, RNG injetado.
 * Consome os PhysicsEvent do step(), aplica dano/perks/mortes e o fim de turno, e escreve
 * eventos de saída num buffer reutilizado (sem alocação em regime).
 */
import type { ChapterDef, GameData, PerkId, PerkParamsById } from '../data/types';
import type { PhysicsEngine } from './PhysicsEngine';
import type { RandomSource } from '../match/rng';
import { addEnemy, hasPerk, type EnemyState, type RunState } from '../match/RunState';

export type CombatEventType =
  | 'damage'
  | 'blocked'
  | 'kill'
  | 'explosion'
  | 'chain'
  | 'barrierHit'
  | 'shot'
  | 'heal'
  | 'goldGain';

export type CombatSource = 'orb' | 'splash' | 'chain' | 'shock' | 'golem' | 'supernova' | 'ignite' | 'enemy' | 'none';

/**
 * Evento de saída (objeto reutilizado: copie antes da próxima limpeza do buffer).
 * - damage: enemyId, amount, crit, source, x/y do alvo.
 * - blocked: enemyId (escudo frontal), x/y.
 * - kill: enemyId, typeId, x/y.
 * - explosion: x/y, radius, source (golem/supernova/splash/shock).
 * - chain: enemyId (alvo), x/y → x2/y2.
 * - barrierHit: enemyId, amount (dano na barreira), x/y.
 * - shot: enemyId (atirador), amount, x/y → x2/y2 (ponto de lançamento).
 * - heal: enemyId (aliado), amount, x/y (clérigo) → x2/y2 (aliado).
 * - goldGain: enemyId, amount (ouro bruto), x/y.
 */
export interface CombatEvent {
  type: CombatEventType;
  enemyId: number;
  typeId: string;
  amount: number;
  crit: boolean;
  source: CombatSource;
  x: number;
  y: number;
  x2: number;
  y2: number;
  radius: number;
}

export type TurnOutcome = 'continue' | 'won' | 'lost';

function makeEvent(): CombatEvent {
  return { type: 'damage', enemyId: -1, typeId: '', amount: 0, crit: false, source: 'none', x: 0, y: 0, x2: 0, y2: 0, radius: 0 };
}

const INITIAL_EVENTS = 128;

export class CombatResolver {
  readonly state: RunState;
  private readonly data: GameData;
  private readonly chapter: ChapterDef;
  private readonly rng: RandomSource;
  private readonly events: CombatEvent[] = [];
  private eventCount = 0;
  /** Buffer de inimigos gerados durante a cadeia de mortes (reutilizado). */
  private readonly pendingSpawns: { typeId: string; x: number; y: number }[] = [];
  private pendingCount = 0;

  constructor(state: RunState, data: GameData, chapter: ChapterDef, rng: RandomSource) {
    this.state = state;
    this.data = data;
    this.chapter = chapter;
    this.rng = rng;
    for (let i = 0; i < INITIAL_EVENTS; i++) this.events.push(makeEvent());
  }

  // ---------- Buffer de saída ----------
  get eventsCount(): number {
    return this.eventCount;
  }

  getEvent(i: number): CombatEvent {
    return this.events[i]!;
  }

  clearEvents(): void {
    this.eventCount = 0;
  }

  private emit(type: CombatEventType, x: number, y: number): CombatEvent {
    if (this.eventCount >= this.events.length) {
      const n = this.events.length;
      for (let i = 0; i < n; i++) this.events.push(makeEvent());
    }
    const e = this.events[this.eventCount++]!;
    e.type = type;
    e.enemyId = -1;
    e.typeId = '';
    e.amount = 0;
    e.crit = false;
    e.source = 'none';
    e.x = x;
    e.y = y;
    e.x2 = x;
    e.y2 = y;
    e.radius = 0;
    return e;
  }

  private params<K extends PerkId>(id: K): Readonly<PerkParamsById[K]> {
    return this.data.perks[id].params;
  }

  findEnemy(id: number): EnemyState | null {
    const list = this.state.enemies;
    for (let i = 0; i < list.length; i++) if (list[i]!.id === id) return list[i]!;
    return null;
  }

  // ---------- Perks: onAcquire ----------
  /** Registra a runa e aplica efeitos onAcquire. */
  acquirePerk(id: PerkId): void {
    const s = this.state;
    s.perks[id] = (s.perks[id] ?? 0) + 1;
    s.perkOrder.push(id);
    switch (id) {
      case 'storm_orb': {
        const p = this.params('storm_orb');
        s.orbs += p.orbBonus;
        s.chainChanceBonus += p.chainChanceBonus;
        break;
      }
      case 'molten_core':
        s.atk += this.params('molten_core').atkBonus;
        break;
      case 'arcane_sight': {
        const p = this.params('arcane_sight');
        s.critChance += p.critChanceBonus;
        s.previewBounces = Math.max(s.previewBounces, p.previewBounces);
        break;
      }
      case 'extra_orb':
        s.orbs += this.params('extra_orb').orbBonus;
        break;
      case 'power_surge':
        s.atk += this.params('power_surge').atkBonus;
        break;
      case 'bastion_heal': {
        const p = this.params('bastion_heal');
        s.maxHp += p.maxHpBonus;
        s.hp = Math.min(s.maxHp, s.hp + p.healHp);
        break;
      }
      default:
        break;
    }
  }

  // ---------- Lançamento (onLaunch) ----------
  /** Início do voo: zera combo e Choque; configura ghost_ball e wall_clone no motor. */
  beginTurn(engine: PhysicsEngine): void {
    const s = this.state;
    s.turnCombo = 0;
    for (const en of s.enemies) en.shocked = false;
    if (hasPerk(s, 'ghost_ball')) {
      const p = this.params('ghost_ball');
      if (p.orbIndex < engine.activeCount) engine.getBall(p.orbIndex).pierce = true;
    }
    if (hasPerk(s, 'wall_clone')) {
      const p = this.params('wall_clone');
      engine.setWallClone({ radius: p.cloneRadius, vxMult: p.cloneVxMult, offsetY: p.cloneOffsetYPx });
    } else engine.setWallClone(null);
  }

  // ---------- Eventos de física ----------
  /** Consome os eventos do último engine.step() em ordem, depois resolve mortes. */
  processPhysics(engine: PhysicsEngine): void {
    const n = engine.eventsCount;
    const dmg = this.data.rules.damage;
    for (let i = 0; i < n; i++) {
      const ev = engine.getEvent(i);
      if (ev.type === 'enemyHit') {
        const en = this.findEnemy(ev.enemyId);
        if (!en || en.hp <= 0) continue;
        if (ev.blocked) {
          const b = this.emit('blocked', en.x, en.y);
          b.enemyId = en.id;
          continue;
        }
        const table = hasPerk(this.state, 'ricochet_crit') && ev.bounced ? dmg.ricochetMult : 1;
        const temp = ev.temp ? dmg.tempCloneMult : 1;
        this.applyDamage(en, this.state.atk * table * temp, 'orb');
      } else if (ev.type === 'bumperHit' && hasPerk(this.state, 'bumper_shock')) {
        const bp = engine.getArena().bumpers[ev.index];
        if (bp) this.bumperShock(bp.x, bp.y);
      }
    }
    this.processDeaths();
    this.syncArena(engine);
  }

  private bumperShock(x: number, y: number): void {
    const p = this.params('bumper_shock');
    const fx = this.emit('explosion', x, y);
    fx.radius = p.radiusPx;
    fx.source = 'shock';
    const list = this.state.enemies;
    const n = list.length;
    for (let i = 0; i < n; i++) {
      const en = list[i]!;
      if (en.hp > 0 && Math.hypot(en.x - x, en.y - y) < p.radiusPx + en.r) {
        en.shocked = true;
        this.applyDamage(en, this.state.atk * p.damageRatio, 'shock');
      }
    }
  }

  /**
   * GDD §4.5: Dano = max(1, round(raw · M_crit · M_choque)), com raw já contendo ATK · M_tabela · M_temp.
   * Crítico só em acerto direto de orbe (slice). Efeitos onEnemyHit (splash, cadeia, ignite) só de orbe.
   */
  applyDamage(en: EnemyState, raw: number, source: CombatSource): number {
    if (en.hp <= 0) return 0;
    const s = this.state;
    const R = this.data.rules.damage;
    const fromOrb = source === 'orb';
    let d = raw;
    let crit = false;
    if (fromOrb && this.rng.next() < s.critChance) {
      d *= R.critMult;
      crit = true;
    }
    if (en.shocked && hasPerk(s, 'static_crit')) d *= R.shockMult;
    const dealt = Math.max(R.minDamage, Math.round(d));
    en.hp -= dealt;
    const e = this.emit('damage', en.x, en.y);
    e.enemyId = en.id;
    e.amount = dealt;
    e.crit = crit;
    e.source = source;

    if (!fromOrb) return dealt;
    s.turnCombo++;
    if (s.turnCombo > s.bestCombo) s.bestCombo = s.turnCombo;
    if (hasPerk(s, 'ignite')) en.burning = true;

    if (hasPerk(s, 'fire_splash')) {
      const p = this.params('fire_splash');
      const rad = hasPerk(s, 'molten_core') ? p.radiusPxWithMoltenCore : p.radiusPx;
      const fx = this.emit('explosion', en.x, en.y);
      fx.radius = rad;
      fx.source = 'splash';
      const list = s.enemies;
      const n = list.length;
      for (let i = 0; i < n; i++) {
        const o = list[i]!;
        if (o !== en && o.hp > 0 && Math.hypot(o.x - en.x, o.y - en.y) < rad + o.r) {
          this.applyDamage(o, s.atk * p.damageRatio, 'splash');
        }
      }
    }

    if (hasPerk(s, 'chain_lightning')) {
      const p = this.params('chain_lightning');
      if (this.rng.next() < p.chance + s.chainChanceBonus) {
        const list = s.enemies;
        for (let i = 0; i < list.length; i++) {
          const o = list[i]!;
          if (o === en || o.hp <= 0 || Math.hypot(o.x - en.x, o.y - en.y) >= p.rangePx) continue;
          o.shocked = true;
          const c = this.emit('chain', en.x, en.y);
          c.enemyId = o.id;
          c.x2 = o.x;
          c.y2 = o.y;
          this.applyDamage(o, s.atk * p.damageRatio, 'chain');
          break;
        }
      }
    }
    return dealt;
  }

  /** Cadeia de mortes: ouro, explosão do Golem / supernova (recursiva) e divisão do Espectro. */
  processDeaths(): void {
    const s = this.state;
    const W = this.data.rules.world.width;
    const fireMult = hasPerk(s, 'molten_core') ? this.params('molten_core').fireRadiusMult : 1;
    let changed = true;
    while (changed) {
      changed = false;
      this.pendingCount = 0;
      const list = s.enemies;
      for (let i = 0; i < list.length; i++) {
        const en = list[i]!;
        if (en.hp > 0 || en.dead) continue;
        changed = true;
        en.dead = true;
        const def = en.def;
        s.kills++;
        const gold = def.gold;
        s.gold += gold;
        const k = this.emit('kill', en.x, en.y);
        k.enemyId = en.id;
        k.typeId = en.typeId;
        const g = this.emit('goldGain', en.x, en.y);
        g.enemyId = en.id;
        g.amount = gold;

        const golem = def.explode;
        if (golem || hasPerk(s, 'supernova')) {
          const sn = this.params('supernova');
          const rad = (golem ? golem.radiusPx : sn.radiusPx) * fireMult;
          const ratio = golem ? golem.atkRatio : sn.damageRatio;
          const src: CombatSource = golem ? 'golem' : 'supernova';
          const fx = this.emit('explosion', en.x, en.y);
          fx.radius = rad;
          fx.source = src;
          for (let j = 0; j < list.length; j++) {
            const o = list[j]!;
            if (o.hp > 0 && Math.hypot(o.x - en.x, o.y - en.y) < rad + o.r) this.applyDamage(o, s.atk * ratio, src);
          }
        }
        const sp = def.split;
        if (sp) {
          for (const ox of sp.offsetsXPx) {
            const nx = Math.max(sp.edgeMarginPx, Math.min(W - sp.edgeMarginPx, en.x + ox));
            this.queueSpawn(sp.spawnId, nx, en.y);
          }
        }
      }
      this.removeDead();
      for (let i = 0; i < this.pendingCount; i++) {
        const p = this.pendingSpawns[i]!;
        addEnemy(s, this.data, p.typeId, p.x, p.y);
      }
    }
  }

  private queueSpawn(typeId: string, x: number, y: number): void {
    if (this.pendingCount >= this.pendingSpawns.length) this.pendingSpawns.push({ typeId, x, y });
    else {
      const p = this.pendingSpawns[this.pendingCount]!;
      p.typeId = typeId;
      p.x = x;
      p.y = y;
    }
    this.pendingCount++;
  }

  /** Remove mortos de state.enemies, preservando a ordem (in place). */
  private removeDead(): void {
    const list = this.state.enemies;
    let w = 0;
    for (let r = 0; r < list.length; r++) {
      const en = list[r]!;
      if (!en.dead) list[w++] = en;
    }
    list.length = w;
  }

  /** A física usa a mesma lista de inimigos do estado. */
  syncArena(engine: PhysicsEngine): void {
    const arena = engine.getArena();
    if (arena.enemies !== this.state.enemies) arena.enemies = this.state.enemies;
  }

  // ---------- Fim de turno (GDD §2.1 passo 5) ----------
  endTurn(launchX: number, barrierY: number, rng: RandomSource = this.rng): TurnOutcome {
    const s = this.state;
    const list = s.enemies;
    const W = this.data.rules.world.width;

    // 1. Ignite
    if (hasPerk(s, 'ignite')) {
      const ratio = this.params('ignite').damageRatio;
      for (let i = 0; i < list.length; i++) {
        const en = list[i]!;
        if (en.burning && en.hp > 0) this.applyDamage(en, s.atk * ratio, 'ignite');
      }
    }
    for (const en of list) en.burning = false;
    this.processDeaths();

    // 2. Cura do Clérigo
    for (let i = 0; i < list.length; i++) {
      const h = list[i]!;
      const heal = h.def.heal;
      if (!heal || h.hp <= 0) continue;
      let healed = 0;
      for (let j = 0; j < list.length && healed < heal.targets; j++) {
        const o = list[j]!;
        if (o === h || o.hp <= 0 || o.hp >= o.maxHp || Math.hypot(o.x - h.x, o.y - h.y) >= heal.rangePx) continue;
        const amount = Math.max(heal.minHeal, Math.round(o.maxHp * heal.maxHpRatio));
        const before = o.hp;
        o.hp = Math.min(o.maxHp, o.hp + amount);
        const e = this.emit('heal', h.x, h.y);
        e.enemyId = o.id;
        e.amount = o.hp - before;
        e.x2 = o.x;
        e.y2 = o.y;
        healed++;
      }
    }

    // 3. Invocações
    const L = this.chapter.spawnLayout;
    const startCount = list.length;
    let summoned = 0;
    for (let i = 0; i < startCount; i++) {
      const en = list[i]!;
      const sm = en.def.summon;
      if (!sm || en.hp <= 0) continue;
      en.summonCd--;
      if (en.summonCd <= 0 && startCount + summoned < sm.maxArenaCount) {
        en.summonCd = sm.cooldown;
        const dx = rng.next() > 0.5 ? sm.offsetXPx : -sm.offsetXPx;
        const sx = Math.max(L.minX, Math.min(Math.min(L.maxX, W), en.x + dx));
        addEnemy(s, this.data, sm.spawnId, sx, en.y + sm.offsetYPx);
        summoned++;
      }
    }

    // 4. Avanço
    for (const en of list) en.y += en.def.advancePx;

    // 5. Tiros
    for (const en of list) {
      const sh = en.def.shoot;
      if (!sh) continue;
      en.shootCd--;
      if (en.shootCd <= 0) {
        en.shootCd = sh.cooldown;
        s.hp -= sh.damage;
        const e = this.emit('shot', en.x, en.y);
        e.enemyId = en.id;
        e.amount = sh.damage;
        e.x2 = launchX;
        e.y2 = barrierY;
      }
    }

    // 6. Invasão da barreira (chefe recua)
    let w = 0;
    for (let r = 0; r < list.length; r++) {
      const en = list[r]!;
      if (en.y + en.r >= barrierY) {
        s.hp -= en.def.barrierDmg;
        const e = this.emit('barrierHit', en.x, barrierY);
        e.enemyId = en.id;
        e.amount = en.def.barrierDmg;
        if (en.def.isBoss) en.y -= en.def.barrierRecoilPx ?? 0;
        else continue;
      }
      list[w++] = en;
    }
    list.length = w;

    // 7. Derrota / vitória
    if (s.hp <= 0) {
      s.hp = 0;
      s.phase = 'lost';
      return 'lost';
    }
    if (this.isFinalWaveCleared()) {
      s.phase = 'won';
      return 'won';
    }
    return 'continue';
  }

  isFinalWaveCleared(): boolean {
    return this.state.wave >= this.chapter.totalWaves && this.state.enemies.length === 0;
  }
}
