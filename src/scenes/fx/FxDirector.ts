/**
 * Traduz os eventos de saída do CombatResolver (e o ×2 do anel) em efeitos: partículas, ondas,
 * feixes, números flutuantes, tremida e pedidos de flash/squash ao medalhão. Lógica pura (sem Phaser).
 * Base do vertical slice v0.1, reforçada pela decisão 41 (brilho aditivo, squash e tremida mais fortes).
 */
import type { CombatEvent } from '../../core/CombatResolver';
import type { RandomSource } from '../../match/rng';
import { t as str } from '../../ui/strings';
import { COLOR } from '../views/palette';
import {
  PARTICLE_LIVE_MAX,
  PARTICLE_LIVE_REDUCED,
  particleCount,
  Shake,
  shakeFor,
  SQUASH_KICK,
} from './fxMath';
import { BeamPool, FloatTextPool, PART, ParticlePool, type PartKind, WavePool } from './pools';

/** O que o diretor precisa saber/acionar nos inimigos (implementado pela cena). */
export interface FxTargets {
  /** Raio do inimigo vivo (ou 0 se não houver view). */
  radius(enemyId: number): number;
  /** Hit-flash; `squash` também aplica o squash do acerto. */
  hit(enemyId: number, squash: boolean): void;
  /** Cor do aro do medalhão do tipo (partículas de morte). */
  rimColor(typeId: string): number;
  /** Opcional: squash elástico com força (SquashSpring.kick). Sem ele, só `hit`. */
  impact?(enemyId: number, strength: number): void;
  /** Opcional: o tipo é chefe? Sem ele, usa o raio (≥ BOSS_RADIUS). */
  isBoss?(typeId: string): boolean;
}

/** Capacidade dos pools; partículas vivas limitadas a PARTICLE_LIVE_MAX (ou menos com movimento reduzido). */
export const FX_CAPACITY = { particles: PARTICLE_LIVE_MAX, waves: 24, beams: 32, floats: 48 } as const;

const DEFAULT_RADIUS = 14;
/** Raio a partir do qual um inimigo morto conta como chefe (miniboss 31, chefe 36; comuns ≤ 19). */
export const BOSS_RADIUS = 28;
/** Faíscas elétricas ao longo de cada salto do Raio em Cadeia. */
const CHAIN_SPARKS = 4;

export class FxDirector {
  readonly particles = new ParticlePool(FX_CAPACITY.particles);
  readonly waves = new WavePool(FX_CAPACITY.waves);
  readonly beams = new BeamPool(FX_CAPACITY.beams);
  readonly floats = new FloatTextPool(FX_CAPACITY.floats);
  readonly shake = new Shake();
  private readonly rng: RandomSource;
  private reduced = false;

  constructor(rng: RandomSource) {
    this.rng = rng;
  }

  /** "Reduzir movimento" (decisão 42): sem tremida e menos partículas. Ligada pela T-049. */
  setReducedMotion(on: boolean): void {
    this.reduced = on;
    this.shake.reduced = on;
    if (on) this.shake.reset();
    this.particles.limit = on ? PARTICLE_LIVE_REDUCED : PARTICLE_LIVE_MAX;
  }

  get reducedMotion(): boolean {
    return this.reduced;
  }

  private burst(x: number, y: number, color: number, n: number, speed: number, kind: PartKind): void {
    this.particles.burst(x, y, color, particleCount(n, this.reduced), speed, this.rng, kind);
  }

  onCombat(ev: CombatEvent, t: FxTargets): void {
    switch (ev.type) {
      case 'damage': {
        this.shake.add(shakeFor('damage', ev.source, ev.crit));
        t.hit(ev.enemyId, true);
        const crit = ev.crit;
        t.impact?.(ev.enemyId, crit ? SQUASH_KICK.crit : ev.source === 'orb' ? SQUASH_KICK.hit : SQUASH_KICK.explosion);
        const r = t.radius(ev.enemyId) || DEFAULT_RADIUS;
        const tint = sourceColor(ev.source);
        const n = Math.round(ev.amount);
        const txt = crit ? `-${n}!` : `-${n}`;
        const col = tint !== 0 ? tint : crit ? COLOR.gold : COLOR.white;
        this.floats.spawn(ev.x + (this.rng.next() * 14 - 7), ev.y - r, txt, col, crit ? 15 : 12);
        const kind = sourceKind(ev.source);
        const pc = tint !== 0 ? tint : crit ? COLOR.gold : COLOR.crimson;
        this.burst(ev.x, ev.y, pc, crit ? 10 : 6, crit ? 7 : 5, kind);
        if (crit) this.burst(ev.x, ev.y, COLOR.white, 3, 4, PART.spark);
        break;
      }
      case 'blocked': {
        t.hit(ev.enemyId, false);
        const r = t.radius(ev.enemyId) || DEFAULT_RADIUS;
        this.floats.spawn(ev.x, ev.y + r + 6, str('fx.blocked'), COLOR.cyan, 10);
        this.burst(ev.x, ev.y, COLOR.cyan, 3, 3, PART.spark);
        break;
      }
      case 'kill': {
        const r = t.radius(ev.enemyId);
        const boss = t.isBoss ? t.isBoss(ev.typeId) : r >= BOSS_RADIUS;
        this.shake.add(shakeFor('kill', ev.source, false, boss));
        const rim = t.rimColor(ev.typeId);
        this.burst(ev.x, ev.y, rim, boss ? 34 : 14, boss ? 9 : 6, PART.death);
        this.burst(ev.x, ev.y, COLOR.white, boss ? 8 : 3, boss ? 6 : 4, PART.spark);
        this.waves.spawn(ev.x, ev.y, (r || DEFAULT_RADIUS) * 0.6, (r || DEFAULT_RADIUS) * (boss ? 4 : 2.2), boss ? 22 : 12, rim);
        break;
      }
      case 'explosion': {
        this.shake.add(shakeFor('explosion', ev.source));
        const shock = ev.source === 'shock';
        const death = ev.source === 'golem' || ev.source === 'supernova';
        const col = shock ? COLOR.cyan : COLOR.magma;
        this.waves.spawn(ev.x, ev.y, shock ? 16 : death ? 10 : 8, ev.radius, shock ? 14 : death ? 16 : 12, col);
        if (shock) this.burst(ev.x, ev.y, COLOR.cyan, 6, 6, PART.electric);
        else if (death) {
          this.burst(ev.x, ev.y, COLOR.magma, 16, 7, PART.fire);
          this.burst(ev.x, ev.y, COLOR.gold, 8, 5, PART.fire);
          this.burst(ev.x, ev.y, COLOR.white, 4, 8, PART.spark);
        } else this.burst(ev.x, ev.y, COLOR.magma, 5, 4, PART.fire);
        break;
      }
      case 'chain': {
        this.beams.spawn(ev.x, ev.y, ev.x2, ev.y2, 11, COLOR.cyan, true);
        const n = particleCount(CHAIN_SPARKS, this.reduced);
        for (let k = 0; k < n; k++) {
          const f = (k + 0.5) / n;
          const px = ev.x + (ev.x2 - ev.x) * f;
          const py = ev.y + (ev.y2 - ev.y) * f;
          this.particles.burst(px, py, COLOR.cyan, 1, 3, this.rng, PART.electric);
        }
        break;
      }
      case 'shot':
        this.shake.add(shakeFor('shot', ev.source));
        this.beams.spawn(ev.x, ev.y, ev.x2, ev.y2, 18, COLOR.crimson, false);
        this.floats.spawn(ev.x2, ev.y2 - 12, `-${Math.round(ev.amount)} HP`, COLOR.crimson, 14);
        this.burst(ev.x2, ev.y2, COLOR.crimson, 6, 4, PART.spark);
        break;
      case 'barrierHit':
        this.shake.add(shakeFor('barrierHit', ev.source));
        this.floats.spawn(ev.x, ev.y - 10, `-${Math.round(ev.amount)} BARREIRA!`, COLOR.crimson, 13);
        this.burst(ev.x, ev.y, COLOR.crimson, 12, 6, PART.spark);
        break;
      case 'heal': {
        if (ev.amount <= 0) break;
        const r = t.radius(ev.enemyId) || DEFAULT_RADIUS;
        this.beams.spawn(ev.x, ev.y, ev.x2, ev.y2, 16, COLOR.emerald, false);
        this.floats.spawn(ev.x2, ev.y2 - r, `+${Math.round(ev.amount)}`, COLOR.emerald, 12);
        break;
      }
      case 'goldGain':
        break;
    }
  }

  /** Orbe cruzou o anel multiplicador. */
  onRingPass(x: number, y: number): void {
    this.floats.spawn(x, y - 20, str('fx.ring'), COLOR.gold, 13);
    this.burst(x, y, COLOR.gold, 5, 3, PART.spark);
  }

  /** Efeito espectral (violeta): orbe fantasma atravessando, clone do Eco do Teto. Gancho para a cena. */
  onSpectral(x: number, y: number): void {
    this.burst(x, y, COLOR.violet, 8, 3, PART.spectral);
  }

  step(frames: number): void {
    if (frames <= 0) return;
    this.particles.step(frames);
    this.waves.step(frames);
    this.beams.step(frames);
    this.floats.step(frames);
    this.shake.step(frames, this.rng);
  }

  clear(): void {
    this.particles.clear();
    this.waves.clear();
    this.beams.clear();
    this.floats.clear();
    this.shake.reset();
  }
}

/** Tipo de partícula do acerto pela fonte (fogo, elétrico ou faísca). */
function sourceKind(source: CombatEvent['source']): PartKind {
  switch (source) {
    case 'splash':
    case 'golem':
    case 'supernova':
    case 'ignite':
      return PART.fire;
    case 'chain':
    case 'shock':
      return PART.electric;
    default:
      return PART.spark;
  }
}

/** Cor do dano por fonte (0 = padrão do acerto do orbe). */
function sourceColor(source: CombatEvent['source']): number {
  switch (source) {
    case 'splash':
    case 'golem':
    case 'supernova':
    case 'ignite':
      return COLOR.magma;
    case 'chain':
    case 'shock':
      return COLOR.cyan;
    default:
      return 0;
  }
}
