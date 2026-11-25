import { describe, expect, it } from 'vitest';
import { CombatResolver, type CombatEvent } from '../../src/core/CombatResolver';
import { PhysicsEngine } from '../../src/core/PhysicsEngine';
import { loadGameData, type PerkId } from '../../src/data/types';
import { enemyHp } from '../../src/meta/formulas';
import type { PhysicsEvent } from '../../src/match/physicsTypes';
import { Rng, type RandomSource } from '../../src/match/rng';
import { addEnemy, createRunState, finalGold, talentBonuses, type EnemyState, type RunState } from '../../src/match/RunState';

const data = loadGameData();
const chapter = data.chapters['chapter_1']!;
const LAUNCH_X = 180;
const BARRIER_Y = 436;

/** RNG roteirizado: devolve os valores em sequência e depois `rest`. */
function seq(values: number[], rest = 0.99): RandomSource {
  let i = 0;
  return { next: () => (i < values.length ? values[i++]! : rest) };
}

function setup(rng: RandomSource = seq([]), perks: PerkId[] = []): { s: RunState; c: CombatResolver } {
  const s = createRunState(data);
  const c = new CombatResolver(s, data, chapter, rng);
  for (const p of perks) c.acquirePerk(p);
  return { s, c };
}

function hitEvent(enemyId: number, opts: Partial<PhysicsEvent> = {}): PhysicsEvent {
  return { type: 'enemyHit', ballId: 0, index: -1, enemyId, cloneId: -1, blocked: false, x: 0, y: 0, bounced: false, temp: false, ...opts };
}

/** Motor falso: só entrega a lista de eventos e a arena. */
function fakeEngine(events: PhysicsEvent[], bumpers: { x: number; y: number; r: number }[] = []): PhysicsEngine {
  return {
    eventsCount: events.length,
    getEvent: (i: number) => events[i]!,
    getArena: () => ({ bumpers, pillars: [], rings: [], enemies: [] as EnemyState[] }),
  } as unknown as PhysicsEngine;
}

function outEvents(c: CombatResolver): CombatEvent[] {
  return Array.from({ length: c.eventsCount }, (_, i) => ({ ...c.getEvent(i) }));
}

function damageTo(c: CombatResolver, id: number): number {
  return outEvents(c).filter((e) => e.type === 'damage' && e.enemyId === id).reduce((a, e) => a + e.amount, 0);
}

describe('Fórmula de dano (GDD §4.5)', () => {
  it('base: ATK sem multiplicadores', () => {
    const { s, c } = setup();
    const g = addEnemy(s, data, 'goblin', 100, 100);
    c.processPhysics(fakeEngine([hitEvent(g.id)]));
    expect(damageTo(c, g.id)).toBe(3);
    expect(g.hp).toBe(g.maxHp - 3);
  });

  it('tabela 2× só com ricochet_crit e orbe que já quicou', () => {
    const { s, c } = setup(seq([]), ['ricochet_crit']);
    const g = addEnemy(s, data, 'goblin', 100, 100);
    c.processPhysics(fakeEngine([hitEvent(g.id, { bounced: false }), hitEvent(g.id, { bounced: true })]));
    expect(outEvents(c).filter((e) => e.type === 'damage').map((e) => e.amount)).toEqual([3, 6]);
  });

  it('clone temporário 0.7×, crítico 1.75× e mínimo 1', () => {
    const a = setup();
    const g = addEnemy(a.s, data, 'goblin', 100, 100);
    a.c.processPhysics(fakeEngine([hitEvent(g.id, { temp: true })]));
    expect(damageTo(a.c, g.id)).toBe(2); // round(2.1)

    const b = setup(seq([0]));
    const g2 = addEnemy(b.s, data, 'goblin', 100, 100);
    b.c.processPhysics(fakeEngine([hitEvent(g2.id)]));
    const ev = outEvents(b.c).find((e) => e.type === 'damage')!;
    expect(ev.amount).toBe(5); // round(5.25)
    expect(ev.crit).toBe(true);

    const m = setup();
    m.s.atk = 0.2;
    const g3 = addEnemy(m.s, data, 'goblin', 100, 100);
    m.c.processPhysics(fakeEngine([hitEvent(g3.id)]));
    expect(damageTo(m.c, g3.id)).toBe(1);
  });

  it('choque 1.35× só com static_crit e alvo em Choque', () => {
    const { s, c } = setup(seq([]), ['static_crit']);
    const g = addEnemy(s, data, 'goblin', 100, 100);
    g.shocked = true;
    c.processPhysics(fakeEngine([hitEvent(g.id)]));
    expect(damageTo(c, g.id)).toBe(4); // round(4.05)
    const n = setup();
    const g2 = addEnemy(n.s, data, 'goblin', 100, 100);
    g2.shocked = true;
    n.c.processPhysics(fakeEngine([hitEvent(g2.id)]));
    expect(damageTo(n.c, g2.id)).toBe(3);
  });

  it('escudo bloqueado não causa dano e emite blocked', () => {
    const { s, c } = setup();
    const k = addEnemy(s, data, 'shield', 100, 100);
    c.processPhysics(fakeEngine([hitEvent(k.id, { blocked: true })]));
    expect(k.hp).toBe(k.maxHp);
    expect(outEvents(c).map((e) => e.type)).toEqual(['blocked']);
  });
});

describe('Perks', () => {
  it('chain_lightning: 45% de raio no 1º inimigo em 155 px (75% ATK, Choque)', () => {
    const { s, c } = setup(seq([0.99, 0.3]), ['chain_lightning']);
    const a = addEnemy(s, data, 'goblin', 100, 100);
    const far = addEnemy(s, data, 'goblin', 300, 300);
    const b = addEnemy(s, data, 'goblin', 200, 100);
    c.processPhysics(fakeEngine([hitEvent(a.id)]));
    expect(damageTo(c, b.id)).toBe(2); // round(2.25)
    expect(b.shocked).toBe(true);
    expect(far.hp).toBe(far.maxHp);
    expect(outEvents(c).some((e) => e.type === 'chain' && e.enemyId === b.id)).toBe(true);

    const miss = setup(seq([0.99, 0.5]), ['chain_lightning']);
    const a2 = addEnemy(miss.s, data, 'goblin', 100, 100);
    const b2 = addEnemy(miss.s, data, 'goblin', 200, 100);
    miss.c.processPhysics(fakeEngine([hitEvent(a2.id)]));
    expect(b2.hp).toBe(b2.maxHp);
  });

  it('storm_orb: +1 orbe e +15% de chance do raio', () => {
    const { s, c } = setup(seq([0.99, 0.5]), ['chain_lightning', 'storm_orb']);
    expect(s.orbs).toBe(3);
    const a = addEnemy(s, data, 'goblin', 100, 100);
    const b = addEnemy(s, data, 'goblin', 200, 100);
    c.processPhysics(fakeEngine([hitEvent(a.id)]));
    expect(b.hp).toBeLessThan(b.maxHp);
  });

  it('bumper_shock: onda de 92 px (85% ATK) com Choque', () => {
    const { s, c } = setup(seq([]), ['bumper_shock']);
    const near = addEnemy(s, data, 'goblin', 76, 200);
    const far = addEnemy(s, data, 'goblin', 300, 100);
    c.processPhysics(fakeEngine([{ ...hitEvent(-1), type: 'bumperHit', index: 0 }], [{ x: 76, y: 282, r: 17 }]));
    expect(damageTo(c, near.id)).toBe(3); // round(2.55)
    expect(near.shocked).toBe(true);
    expect(far.hp).toBe(far.maxHp);
  });

  it('fire_splash: 45% ATK em 60 px; 76 px com molten_core', () => {
    const { s, c } = setup(seq([]), ['fire_splash']);
    const a = addEnemy(s, data, 'goblin', 100, 100);
    const b = addEnemy(s, data, 'goblin', 170, 100); // 70 < 60+17
    const out = addEnemy(s, data, 'goblin', 190, 100); // 90 ≥ 77
    c.processPhysics(fakeEngine([hitEvent(a.id)]));
    expect(damageTo(c, b.id)).toBe(1); // round(1.35)
    expect(out.hp).toBe(out.maxHp);

    const m = setup(seq([]), ['fire_splash', 'molten_core']);
    expect(m.s.atk).toBe(6);
    const a2 = addEnemy(m.s, data, 'goblin', 100, 100);
    const b2 = addEnemy(m.s, data, 'goblin', 190, 100); // 90 < 76+17
    m.c.processPhysics(fakeEngine([hitEvent(a2.id)]));
    expect(damageTo(m.c, b2.id)).toBe(3); // round(2.7)
  });

  it('ignite: inimigo atingido por orbe queima no fim do turno (100% ATK)', () => {
    const { s, c } = setup(seq([]), ['ignite']);
    s.wave = 5;
    const a = addEnemy(s, data, 'goblin', 100, 100);
    const b = addEnemy(s, data, 'goblin', 250, 100);
    c.processPhysics(fakeEngine([hitEvent(a.id)]));
    expect(a.burning).toBe(true);
    c.clearEvents();
    c.endTurn(LAUNCH_X, BARRIER_Y);
    expect(damageTo(c, a.id)).toBe(3);
    expect(b.hp).toBe(b.maxHp);
    expect(a.burning).toBe(false);
  });

  it('supernova: abate explode em 74 px (1.5× ATK); molten_core amplia 25%', () => {
    const { s, c } = setup(seq([]), ['supernova']);
    const a = addEnemy(s, data, 'goblin', 100, 100);
    const b = addEnemy(s, data, 'goblin', 180, 100); // 80 < 74+17
    a.hp = 1;
    c.processPhysics(fakeEngine([hitEvent(a.id)]));
    expect(damageTo(c, b.id)).toBe(5); // round(4.5)
    const fx = outEvents(c).find((e) => e.type === 'explosion')!;
    expect(fx.source).toBe('supernova');
    expect(fx.radius).toBe(74);

    const m = setup(seq([]), ['supernova', 'molten_core']);
    const a2 = addEnemy(m.s, data, 'goblin', 100, 100);
    a2.hp = 1;
    m.c.processPhysics(fakeEngine([hitEvent(a2.id)]));
    expect(outEvents(m.c).find((e) => e.type === 'explosion')!.radius).toBeCloseTo(92.5);
  });

  it('ghost_ball e wall_clone: configurados no motor no lançamento', () => {
    const { c, s } = setup(seq([]), ['ghost_ball', 'wall_clone']);
    const e = new PhysicsEngine({ bumpers: [], pillars: [], rings: [], enemies: s.enemies }, new Rng(1), { antiLoopNudge: 0 });
    e.launch(180, 30, -Math.PI / 2, 10, 2);
    c.beginTurn(e);
    expect(e.getBall(0).pierce).toBe(true);
    expect(e.getBall(1).pierce).toBe(false);
    for (let i = 0; i < 4; i++) e.step();
    expect(e.activeCount).toBe(4); // 2 orbes + 2 clones do teto
    expect(e.getBall(2).temp).toBe(true);
  });

  it('onAcquire: arcane_sight, extra_orb (repetível), power_surge, bastion_heal', () => {
    const { s, c } = setup();
    s.hp = 10;
    c.acquirePerk('arcane_sight');
    c.acquirePerk('extra_orb');
    c.acquirePerk('extra_orb');
    c.acquirePerk('power_surge');
    c.acquirePerk('bastion_heal');
    expect(s.critChance).toBeCloseTo(0.25);
    expect(s.previewBounces).toBe(2);
    expect(s.orbs).toBe(4);
    expect(s.atk).toBe(5);
    expect(s.maxHp).toBe(14);
    expect(s.hp).toBe(14); // min(14, 10+5)
    expect(s.perks.extra_orb).toBe(2);
  });
});

describe('Cadeia de mortes', () => {
  it('explosão do Golem → explosão de outro Golem → goblin', () => {
    const { s, c } = setup();
    const g1 = addEnemy(s, data, 'bomb', 100, 100);
    const g2 = addEnemy(s, data, 'bomb', 180, 100);
    const gob = addEnemy(s, data, 'goblin', 260, 100);
    g1.hp = 1;
    c.processPhysics(fakeEngine([hitEvent(g1.id)]));
    expect(s.enemies.length).toBe(0);
    expect(s.kills).toBe(3);
    const ex = outEvents(c).filter((e) => e.type === 'explosion');
    expect(ex.map((e) => e.source)).toEqual(['golem', 'golem']);
    expect(ex[0]!.radius).toBe(92);
    expect(damageTo(c, gob.id)).toBe(8); // 2.5 × 3
    expect(s.gold).toBe(3 + 3 + 2);
    expect(outEvents(c).filter((e) => e.type === 'goldGain').length).toBe(3);
    expect(g2.dead).toBe(true);
  });

  it('Espectro se divide em 2 mini (±20 px, presos à margem)', () => {
    const { s, c } = setup();
    s.wave = 6;
    const sp = addEnemy(s, data, 'splitter', 30, 120);
    sp.hp = 1;
    c.processPhysics(fakeEngine([hitEvent(sp.id)]));
    expect(s.enemies.map((e) => e.typeId)).toEqual(['mini', 'mini']);
    expect(s.enemies.map((e) => e.x)).toEqual([24, 50]);
    expect(s.enemies[0]!.hp).toBe(enemyHp('mini', 6, data));
  });

  it('decisão 17: ouro final = round(ouro × Cobiça) + 60 fixo na vitória', () => {
    const s = createRunState(data, talentBonuses({ gold: 2, atk: 3, hp: 1 }, data));
    expect(s.goldMult).toBeCloseTo(1.3);
    expect(s.atk).toBe(6);
    expect(s.maxHp).toBe(14);
    s.gold = 10;
    expect(finalGold(s, data)).toBe(13);
    s.phase = 'won';
    expect(finalGold(s, data)).toBe(Math.round(10 * 1.3) + 60);
  });
});

describe('Fim de turno', () => {
  it('cura do Clérigo: 22% do HP máx (mín. 2) de 1 aliado ferido em 130 px', () => {
    const { s, c } = setup();
    s.wave = 10;
    const h = addEnemy(s, data, 'healer', 100, 100);
    const a = addEnemy(s, data, 'goblin', 200, 100);
    const far = addEnemy(s, data, 'goblin', 300, 100);
    a.hp = 1;
    far.hp = 1;
    c.endTurn(LAUNCH_X, BARRIER_Y);
    expect(a.hp).toBe(1 + Math.round(a.maxHp * 0.22));
    expect(far.hp).toBe(1);
    expect(outEvents(c).filter((e) => e.type === 'heal').length).toBe(1);
    expect(h.hp).toBe(h.maxHp);
  });

  it('avanço, tiro do atirador a cada 2 turnos e invasão da barreira', () => {
    const { s, c } = setup();
    const sh = addEnemy(s, data, 'shooter', 100, 100);
    const inv = addEnemy(s, data, 'goblin', 200, BARRIER_Y - 17 - 30);
    c.endTurn(LAUNCH_X, BARRIER_Y);
    expect(sh.y).toBe(136);
    expect(s.hp).toBe(12 - 2); // invasão
    expect(s.enemies.includes(inv)).toBe(false);
    c.endTurn(LAUNCH_X, BARRIER_Y);
    expect(s.hp).toBe(12 - 2 - 1); // tiro
    expect(outEvents(c).map((e) => e.type)).toEqual(['barrierHit', 'shot']);
  });

  it('chefe causa dano e recua; mini-chefe invoca a cada 2 turnos', () => {
    const { s, c } = setup(seq([], 0.7));
    s.wave = 7;
    const boss = addEnemy(s, data, 'miniboss_iron', 180, BARRIER_Y - 31 - 10);
    c.endTurn(LAUNCH_X, BARRIER_Y);
    expect(s.hp).toBe(12 - 4);
    expect(boss.y).toBe(BARRIER_Y - 41 + 22 - 72);
    expect(s.enemies.length).toBe(1);
    c.endTurn(LAUNCH_X, BARRIER_Y);
    expect(s.enemies.map((e) => e.typeId)).toEqual(['miniboss_iron', 'goblin']);
    expect(s.enemies[1]!.x).toBe(180 + 52);
  });

  it('vitória com onda 15 limpa; derrota com HP ≤ 0', () => {
    const w = setup();
    w.s.wave = 15;
    expect(w.c.endTurn(LAUNCH_X, BARRIER_Y)).toBe('won');
    expect(w.s.phase).toBe('won');

    const notYet = setup();
    notYet.s.wave = 14;
    expect(notYet.c.endTurn(LAUNCH_X, BARRIER_Y)).toBe('continue');

    const l = setup();
    l.s.hp = 1;
    addEnemy(l.s, data, 'goblin', 100, BARRIER_Y - 20);
    expect(l.c.endTurn(LAUNCH_X, BARRIER_Y)).toBe('lost');
    expect(l.s.hp).toBe(0);
  });
});
