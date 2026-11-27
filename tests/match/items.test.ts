import { describe, expect, it } from 'vitest';
import { CombatResolver, type CombatEvent } from '../../src/core/CombatResolver';
import { EventBus } from '../../src/core/EventBus';
import type { GameEvents, ItemDrop } from '../../src/core/events';
import type { PhysicsEngine } from '../../src/core/PhysicsEngine';
import { loadGameData, type ItemRarity, type PerkId } from '../../src/data/types';
import { emptyItems, runLoadout, type Equipped } from '../../src/meta/items';
import { emptyRunItems, itemStatBonus, LEGENDARY_EFFECT_IDS, mergeBonus, runItemsFrom, type LegendaryEffectId, type RunItems } from '../../src/match/loadout';
import { Match } from '../../src/match/Match';
import type { PhysicsEvent } from '../../src/match/physicsTypes';
import { Rng, type RandomSource } from '../../src/match/rng';
import { RunController } from '../../src/match/RunController';
import { addEnemy, createRunState, type EnemyState, type RunState } from '../../src/match/RunState';
import { rollDraft } from '../../src/match/waves';

const data = loadGameData();
const chapter = data.chapters['chapter_1']!;
const LAUNCH_X = 180;
const BARRIER_Y = 436;

function seq(values: number[], rest = 0.99): RandomSource {
  let i = 0;
  return { next: () => (i < values.length ? values[i++]! : rest) };
}

/** Params do Lendário pelo effectId, direto do items.json. */
function legendaryParams(id: LegendaryEffectId) {
  const it = Object.values(data.items.items).find((x) => x.legendary.effectId === id)!;
  return it.legendary.params;
}

function items(legendary: LegendaryEffectId[] = [], extra: Partial<RunItems> = {}): RunItems {
  const lg: RunItems['legendary'] = {};
  for (const id of legendary) (lg as Record<string, unknown>)[id] = legendaryParams(id);
  return { ...emptyRunItems(), legendary: lg, ...extra };
}

function setup(it: RunItems, rng: RandomSource = seq([]), perks: PerkId[] = []): { s: RunState; c: CombatResolver } {
  const s = createRunState(data);
  const c = new CombatResolver(s, data, chapter, rng, it);
  for (const p of perks) c.acquirePerk(p);
  return { s, c };
}

function ev(type: PhysicsEvent['type'], opts: Partial<PhysicsEvent> = {}): PhysicsEvent {
  return { type, ballId: 0, index: 0, enemyId: -1, cloneId: -1, blocked: false, x: 0, y: 0, bounced: false, temp: false, ...opts };
}
const hit = (enemyId: number, opts: Partial<PhysicsEvent> = {}) => ev('enemyHit', { enemyId, ...opts });

function fakeEngine(events: PhysicsEvent[], bumpers = [{ x: 300, y: 300, r: 10 }]): PhysicsEngine {
  return {
    eventsCount: events.length,
    getEvent: (i: number) => events[i]!,
    getArena: () => ({ bumpers, pillars: [], rings: [], enemies: [] as EnemyState[] }),
  } as unknown as PhysicsEngine;
}

function out(c: CombatResolver): CombatEvent[] {
  return Array.from({ length: c.eventsCount }, (_, i) => ({ ...c.getEvent(i) }));
}
const dmg = (c: CombatResolver, id: number) => out(c).filter((e) => e.type === 'damage' && e.enemyId === id).map((e) => e.amount);

function tank(s: RunState, type: string, x: number, y: number, hp = 1000): EnemyState {
  const en = addEnemy(s, data, type, x, y);
  en.hp = en.maxHp = hp;
  return en;
}

describe('loadout → run (T-078)', () => {
  const eq = (refs: [string, ItemRarity][]): Equipped => {
    const e = { ...emptyItems().equipped } as Record<string, unknown>;
    for (const [id, rarity] of refs) e[data.items.items[id]!.slot] = { itemId: id, rarity };
    return e as Equipped;
  };

  it('stats somam aos talentos; schoolDamage por escola; épico/lendário dão runa; lendário dá effectId', () => {
    const equipped = eq([
      ['staff_lightning', 'legendary'],
      ['orb_fire', 'rare'],
      ['cloak_spectral', 'epic'],
    ]);
    const lo = runLoadout(equipped, data);
    const ri = runItemsFrom(lo, equipped, data);
    expect(ri.schoolDamage).toEqual({ fire: 0.2 });
    expect(ri.shotBlockChance).toBeCloseTo(0.35);
    expect(ri.startRunes).toEqual(['chain_lightning', 'ghost_ball']);
    expect(Object.keys(ri.legendary)).toEqual(['kill_bolt']);
    expect(mergeBonus({ atk: 2, orbs: 1 }, itemStatBonus(lo))).toEqual({ atk: 5, orbs: 1 });
    expect(runItemsFrom(null, null, data)).toEqual(emptyRunItems());
  });

  it('todos os effectId de items.json são conhecidos', () => {
    const ids = Object.values(data.items.items).map((x) => x.legendary.effectId);
    expect([...ids].sort()).toEqual([...LEGENDARY_EFFECT_IDS].sort());
  });
});

describe('stats novos', () => {
  it('schoolDamage: +fração no dano das runas da escola, não no orbe', () => {
    const { s, c } = setup(items([], { schoolDamage: { fire: 0.2, lightning: 0.2 } }), seq([]), ['fire_splash', 'bumper_shock']);
    s.atk = 100;
    const a = tank(s, 'goblin', 100, 100);
    const b = tank(s, 'goblin', 130, 100);
    const far = tank(s, 'goblin', 300, 300);
    c.processPhysics(fakeEngine([hit(a.id)]));
    expect(dmg(c, a.id)).toEqual([100]);
    expect(dmg(c, b.id)).toEqual([54]); // 45% × 1,2
    c.clearEvents();
    c.processPhysics(fakeEngine([ev('bumperHit', { index: 0 })]));
    expect(dmg(c, far.id)).toEqual([102]); // 85% × 1,2
  });

  it('shotBlockChance: anula o tiro (RNG da run) e emite blocked na barreira', () => {
    for (const [chance, hpLoss] of [[1, 0], [0, 1]] as const) {
      const { s, c } = setup(items([], { shotBlockChance: chance }));
      const sh = tank(s, 'shooter', 100, 100);
      sh.shootCd = 1;
      const hp = s.hp;
      c.endTurn(LAUNCH_X, BARRIER_Y, seq([0.5]));
      expect(hp - s.hp).toBe(hpLoss);
      expect(out(c).some((e) => e.type === 'blocked' && e.enemyId === -1)).toBe(chance === 1);
    }
  });
});

describe('runas iniciais (Épico)', () => {
  it('adquiridas antes da onda 1, na faixa de runas e fora do draft', () => {
    const m = new Match(data, 'chapter_1', new Rng(3), {}, items([], { startRunes: ['fire_splash', 'storm_orb'] }));
    expect(m.state.perkOrder).toEqual(['fire_splash', 'storm_orb']);
    expect(m.state.orbs).toBe(data.rules.runStart.orbs + 1); // onAcquire do storm_orb
    expect(m.state.wave).toBe(1);
    const rng = new Rng(9);
    for (let i = 0; i < 50; i++) {
      const d = rollDraft(m.state, data, chapter, rng);
      expect(d).not.toContain('fire_splash');
      expect(d).not.toContain('storm_orb');
    }
  });
});

describe('drops (onda 7 e chefe)', () => {
  function killBoss(m: Match, typeId: string): void {
    const en = addEnemy(m.state, data, typeId, 100, 100);
    en.hp = 1;
    m.combat.applyDamage(en, 10, 'splash');
    m.combat.processDeaths();
  }

  it('mini-chefe abatido → 1 drop; chefe final não conta como mini-chefe', () => {
    const m = new Match(data, 'chapter_1', new Rng(5));
    killBoss(m, 'boss_obsidian');
    expect(m.state.minibossDefeated).toBe(false);
    killBoss(m, 'miniboss_iron');
    expect(m.state.minibossDefeated).toBe(true);
    expect(m.launch(-Math.PI / 2, 10)).toBe(true);
    m.recall();
    const d = m.takeDrops();
    expect(d.length).toBe(1);
    expect(d[0]!.source).toBe('miniboss');
    expect(d[0]!.items.length).toBe(1);
    expect(data.items.items[d[0]!.items[0]!.itemId]).toBeDefined();
    expect(m.takeDrops()).toEqual([]);
    expect(m.itemDrops).toEqual(d[0]!.items);
  });

  function setupRun(seed: number) {
    const bus = new EventBus<GameEvents>();
    const drops: GameEvents['run:itemDrop'][] = [];
    const ended: GameEvents['run:ended'][] = [];
    const added: ItemDrop[][] = [];
    const calls: string[] = [];
    bus.on('run:itemDrop', (p) => drops.push(p));
    bus.on('run:ended', (p) => ended.push(p));
    const run = new RunController({
      data,
      chapterId: 'chapter_1',
      rng: new Rng(seed),
      bus,
      recordRun: async () => {
        calls.push('record');
      },
      addItems: async (it) => {
        calls.push('items');
        added.push(it);
      },
    });
    return { run, drops, ended, added, calls };
  }

  it('derrota depois da onda 7 mantém o item: run:itemDrop, run:ended.items e addItems', async () => {
    const { run, drops, ended, added, calls } = setupRun(11);
    killBoss(run.match, 'miniboss_iron');
    expect(run.launch(-Math.PI / 2, 10)).toBe(true);
    run.recall();
    expect(drops.length).toBe(1);
    expect(drops[0]!.source).toBe('miniboss');
    run.state.hp = 0;
    expect(run.launch(-Math.PI / 2, 10)).toBe(true);
    run.recall();
    expect(run.state.phase).toBe('lost');
    await run.ended;
    expect(ended[0]!.items).toEqual(drops[0]!.items);
    expect(added).toEqual([drops[0]!.items]);
    expect(calls).toEqual(['record', 'items']);
  });

  it('vitória: drop do chefe (1–2) antes de run:ended', async () => {
    const { run, drops, ended } = setupRun(4);
    run.state.wave = chapter.totalWaves;
    run.state.enemies.length = 0;
    expect(run.launch(-1.2, 10)).toBe(true);
    run.frame();
    await run.ended;
    expect(drops.map((d) => d.source)).toEqual(['boss']);
    const n = drops[0]!.items.length;
    expect(n >= 1 && n <= 2).toBe(true);
    expect(ended[0]!.items).toEqual(drops[0]!.items);
  });

  it('sem drop: run:ended.items vazio e addItems não é chamado', async () => {
    const { run, ended, calls } = setupRun(2);
    run.state.hp = 0;
    expect(run.launch(-Math.PI / 2, 10)).toBe(true);
    run.recall();
    await run.ended;
    expect(ended[0]!.items).toEqual([]);
    expect(calls).toEqual(['record']);
  });
});

describe('Lendários (um caso por effectId)', () => {
  it('kill_bolt: abate tem chance de raio no inimigo mais próximo (Choque)', () => {
    const { s, c } = setup(items(['kill_bolt']), seq([0.99, 0.1]));
    const a = tank(s, 'goblin', 100, 100, 1);
    const near = tank(s, 'goblin', 150, 100);
    const far = tank(s, 'goblin', 330, 400);
    c.processPhysics(fakeEngine([hit(a.id)]));
    expect(out(c).some((e) => e.type === 'chain' && e.enemyId === near.id)).toBe(true);
    expect(dmg(c, near.id)).toEqual([3]);
    expect(near.shocked).toBe(true);
    expect(dmg(c, far.id)).toEqual([]);
  });

  it('first_hit_mult: 1º impacto de cada orbe 1,5×', () => {
    const { s, c } = setup(items(['first_hit_mult']));
    s.atk = 10;
    const a = tank(s, 'goblin', 100, 100);
    c.processPhysics(fakeEngine([hit(a.id), hit(a.id), hit(a.id, { ballId: 1 })]));
    expect(dmg(c, a.id)).toEqual([15, 10, 15]);
  });

  it('bounce_mult: +10% por quique (máx. +50%)', () => {
    const { s, c } = setup(items(['bounce_mult']));
    s.atk = 10;
    const a = tank(s, 'goblin', 100, 100);
    const walls = (n: number, ballId: number) => Array.from({ length: n }, () => ev('wallHit', { ballId }));
    c.processPhysics(fakeEngine([...walls(3, 0), hit(a.id, { bounced: true }), ...walls(10, 1), hit(a.id, { ballId: 1, bounced: true })]));
    expect(dmg(c, a.id)).toEqual([13, 15]);
  });

  it('first_hit_shock: 1º impacto de cada orbe aplica Choque', () => {
    const { s, c } = setup(items(['first_hit_shock']));
    const a = tank(s, 'goblin', 100, 100);
    const b = tank(s, 'goblin', 200, 100);
    c.processPhysics(fakeEngine([hit(a.id), hit(b.id)]));
    expect([a.shocked, b.shocked]).toEqual([true, false]);
  });

  it('hit_burn: atingidos queimam no fim do turno (50% ATK), soma com ignite', () => {
    for (const [perks, burn] of [[[], 5], [['ignite'], 15]] as [PerkId[], number][]) {
      const { s, c } = setup(items(['hit_burn']), seq([]), perks);
      s.atk = 10;
      const a = tank(s, 'goblin', 100, 100);
      c.processPhysics(fakeEngine([hit(a.id)]));
      c.clearEvents();
      c.endTurn(LAUNCH_X, BARRIER_Y);
      expect(out(c).filter((e) => e.type === 'damage' && e.source === 'ignite').map((e) => e.amount)).toEqual([burn]);
    }
  });

  it('launch_extra_orb: 25% de chance de +1 orbe; sem o item não consome RNG', () => {
    expect(setup(items(['launch_extra_orb']), seq([0.1])).c.launchBonusOrbs()).toBe(1);
    expect(setup(items(['launch_extra_orb']), seq([0.5])).c.launchBonusOrbs()).toBe(0);
    let calls = 0;
    expect(setup(items(), { next: () => (calls++, 0) }).c.launchBonusOrbs()).toBe(0);
    expect(calls).toBe(0);
  });

  it('shock_crit: +15% de crítico contra inimigo em Choque', () => {
    const { s, c } = setup(items(['shock_crit']), seq([0.15, 0.15]));
    const a = tank(s, 'goblin', 100, 100);
    const b = tank(s, 'goblin', 200, 100);
    a.shocked = true;
    c.processPhysics(fakeEngine([hit(a.id), hit(b.id)]));
    const crits = out(c).filter((e) => e.type === 'damage').map((e) => e.crit);
    expect(crits).toEqual([true, false]);
  });

  it('crit_splash: crítico explode em área (50% ATK, 60 px)', () => {
    const { s, c } = setup(items(['crit_splash']), seq([0]));
    s.atk = 10;
    const a = tank(s, 'goblin', 100, 100);
    const b = tank(s, 'goblin', 140, 100);
    const far = tank(s, 'goblin', 300, 300);
    c.processPhysics(fakeEngine([hit(a.id)]));
    expect(out(c).some((e) => e.type === 'explosion' && e.radius === 60)).toBe(true);
    expect(dmg(c, b.id)).toEqual([5]);
    expect(dmg(c, far.id)).toEqual([]);
  });

  it('bounce_crit: orbe que já quicou tem +15% de crítico', () => {
    const { s, c } = setup(items(['bounce_crit']), seq([0.15, 0.15]));
    const a = tank(s, 'goblin', 100, 100);
    c.processPhysics(fakeEngine([ev('wallHit'), hit(a.id, { bounced: true }), hit(a.id, { ballId: 1 })]));
    expect(out(c).filter((e) => e.type === 'damage').map((e) => e.crit)).toEqual([true, false]);
  });

  it('bumper_heal: bumper cura 1 HP (até 2 por turno)', () => {
    const { s, c } = setup(items(['bumper_heal']));
    s.hp = 5;
    c.processPhysics(fakeEngine([ev('bumperHit'), ev('bumperHit'), ev('bumperHit')]));
    expect(s.hp).toBe(7);
  });

  it('combo_heal: 3+ abates no turno curam 1 HP', () => {
    for (const [kills, hp] of [[3, 6], [2, 5]] as const) {
      const { s, c } = setup(items(['combo_heal']));
      s.hp = 5;
      const list = Array.from({ length: kills }, (_, i) => tank(s, 'goblin', 60 + i * 80, 100, 1));
      tank(s, 'goblin', 300, 50);
      c.processPhysics(fakeEngine(list.map((e) => hit(e.id))));
      c.endTurn(LAUNCH_X, BARRIER_Y);
      expect(s.hp).toBe(hp);
    }
  });

  it('ceiling_heal: teto cura 1 HP (até 1 por turno)', () => {
    const { s, c } = setup(items(['ceiling_heal']));
    s.hp = 5;
    c.processPhysics(fakeEngine([ev('ceilingHit'), ev('ceilingHit')]));
    expect(s.hp).toBe(6);
  });

  it('turn_end_bolt_shooter: fim do turno, raio no atirador mais próximo da barreira (Choque)', () => {
    const { s, c } = setup(items(['turn_end_bolt_shooter']));
    s.atk = 10;
    const g = tank(s, 'goblin', 100, 300);
    const back = tank(s, 'shooter', 100, 100);
    const front = tank(s, 'shooter', 200, 200);
    c.endTurn(LAUNCH_X, BARRIER_Y);
    expect(out(c).some((e) => e.type === 'chain' && e.enemyId === front.id)).toBe(true);
    expect(dmg(c, front.id)).toEqual([10]);
    expect(front.shocked).toBe(true);
    expect(dmg(c, back.id)).toEqual([]);
    expect(dmg(c, g.id)).toEqual([]);
  });

  it('shooter_mult: atiradores sofrem 1,5×', () => {
    const { s, c } = setup(items(['shooter_mult']));
    s.atk = 10;
    const sh = tank(s, 'shooter', 100, 100);
    const g = tank(s, 'goblin', 200, 100);
    c.processPhysics(fakeEngine([hit(sh.id), hit(g.id)]));
    expect([dmg(c, sh.id), dmg(c, g.id)]).toEqual([[15], [10]]);
  });

  it('shooter_kill_heal: abater atirador cura 1 HP', () => {
    const { s, c } = setup(items(['shooter_kill_heal']));
    s.hp = 5;
    const sh = tank(s, 'shooter', 100, 100, 1);
    const g = tank(s, 'goblin', 200, 100, 1);
    c.processPhysics(fakeEngine([hit(g.id)]));
    expect(s.hp).toBe(5);
    c.processPhysics(fakeEngine([hit(sh.id)]));
    expect(s.hp).toBe(6);
  });

  it('shock_kill_gold: abatido em Choque dá +1 ouro', () => {
    const { s, c } = setup(items(['shock_kill_gold']));
    const a = tank(s, 'goblin', 100, 100, 1);
    const b = tank(s, 'goblin', 200, 100, 1);
    a.shocked = true;
    c.processPhysics(fakeEngine([hit(a.id), hit(b.id)]));
    expect(s.gold).toBe(data.enemies['goblin']!.gold * 2 + 1);
  });

  it('combo_gold: +1 ouro a cada 5 de combo no turno', () => {
    const { s, c } = setup(items(['combo_gold']));
    tank(s, 'goblin', 100, 50);
    s.turnCombo = 11;
    c.endTurn(LAUNCH_X, BARRIER_Y);
    expect(s.gold).toBe(2);
  });

  it('bounce_kill_gold: abate por orbe que quicou 3+ vezes dá +1 ouro', () => {
    const { s, c } = setup(items(['bounce_kill_gold']));
    const a = tank(s, 'goblin', 100, 100, 1);
    const b = tank(s, 'goblin', 200, 100, 1);
    const w = (ballId: number) => ev('wallHit', { ballId });
    c.processPhysics(fakeEngine([w(0), w(0), w(0), hit(a.id, { bounced: true }), w(1), w(1), hit(b.id, { ballId: 1, bounced: true })]));
    expect(s.gold).toBe(data.enemies['goblin']!.gold * 2 + 1);
  });
});
