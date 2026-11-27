import { describe, expect, it } from 'vitest';
import type { CombatEvent } from '../../src/core/CombatResolver';
import { Rng } from '../../src/match/rng';
import { BOSS_RADIUS, FX_CAPACITY, FxDirector, type FxTargets } from '../../src/scenes/fx/FxDirector';
import { PARTICLE_LIVE_MAX, PARTICLE_LIVE_REDUCED, SHAKE_PX, SQUASH_KICK } from '../../src/scenes/fx/fxMath';
import { BeamPool, FloatTextPool, PART, PART_SPEC, ParticlePool, WavePool } from '../../src/scenes/fx/pools';
import { COLOR } from '../../src/scenes/views/palette';

function ev(p: Partial<CombatEvent>): CombatEvent {
  return { type: 'damage', enemyId: 1, typeId: '', amount: 0, crit: false, source: 'orb', x: 100, y: 100, x2: 0, y2: 0, radius: 0, ...p };
}

function targets(radius = 16) {
  const hits: [number, boolean][] = [];
  const impacts: [number, number][] = [];
  const t: FxTargets = {
    radius: (id) => (id === 1 ? radius : 0),
    hit: (id, squash) => void hits.push([id, squash]),
    rimColor: () => 0x123456,
    impact: (id, s) => void impacts.push([id, s]),
  };
  return { t, hits, impacts };
}

describe('fx — pools sem alocação', () => {
  it('partículas: rajada, arrasto/gravidade por tipo, morte por vida e remoção densa', () => {
    const p = new ParticlePool(64);
    const rng = new Rng(1);
    p.burst(10, 20, 0xff0000, 6, 5, rng);
    expect(p.count).toBe(6);
    for (let i = 0; i < p.count; i++) {
      const v = Math.hypot(p.vx[i]!, p.vy[i]!);
      expect(v).toBeGreaterThanOrEqual(1 - 1e-5);
      expect(v).toBeLessThan(6);
      expect(p.life[i]).toBeGreaterThanOrEqual(14);
      expect(p.life[i]).toBeLessThan(24);
      expect(p.kind[i]).toBe(PART.spark);
    }
    const k = PART_SPEC[PART.spark]!;
    const x0 = p.x[0]! + p.vx[0]! + p.vx[0]! * k.drag;
    p.step(2);
    expect(p.x[0]).toBeCloseTo(x0, 4);
    p.step(40);
    expect(p.count).toBe(0);
  });

  it('fogo sobe e encolhimento só nos tipos que encolhem', () => {
    const p = new ParticlePool(4);
    p.spawn(0, 0, 0, 0, 30, 1, PART.fire, 5);
    p.spawn(0, 0, 0, 0, 30, 1, PART.spark, 5);
    p.step(10);
    expect(p.y[0]).toBeLessThan(0);
    expect(p.y[1]).toBeGreaterThan(0);
    expect(p.drawSize(0)).toBe(5);
    expect(p.drawSize(1)).toBeLessThan(5);
    expect(p.drawSize(1)).toBeGreaterThan(5 * 0.35);
  });

  it('pool cheio sobrescreve em rodízio; o teto de vivas (limit) vale e não troca o buffer', () => {
    const p = new ParticlePool(8);
    const xs = p.x;
    const rng = new Rng(3);
    for (let i = 0; i < 50; i++) p.burst(i, 0, 1, 3, 2, rng);
    expect(p.count).toBe(8);
    expect(p.x).toBe(xs);
    p.limit = 3;
    expect(p.count).toBe(3);
    for (let i = 0; i < 20; i++) p.burst(i, 0, 1, 3, 2, rng);
    expect(p.count).toBe(3);
    p.limit = 100;
    expect(p.limit).toBe(8);
    const f = new FloatTextPool(4);
    for (let i = 0; i < 10; i++) f.spawn(0, 0, `-${i}`, 0xffffff, 12);
    expect(f.active).toBe(4);
    expect(f.text.length).toBe(4);
  });

  it('números flutuantes sobem 0.9 px/frame e somem em 28 frames', () => {
    const f = new FloatTextPool(4);
    const i = f.spawn(50, 100, '-7', 0xffffff, 12);
    const v = f.version[i]!;
    f.step(10);
    expect(f.y[i]).toBeCloseTo(91);
    f.step(18);
    expect(f.alive(i)).toBe(false);
    const j = f.spawn(0, 0, '-8', 0xffffff, 12);
    expect(f.version[j]).toBeGreaterThan(j === i ? v : 0);
  });

  it('onda cresce até o raio máximo; feixe some pela vida', () => {
    const w = new WavePool(4);
    w.spawn(0, 0, 10, 90, 16, 1);
    w.step(1);
    expect(w.r[0]).toBeCloseTo(10 + 80 * 0.25);
    w.step(15);
    expect(w.count).toBe(0);
    const b = new BeamPool(2);
    b.spawn(0, 0, 10, 10, 11, 1, true);
    b.step(10);
    expect(b.alpha(0)).toBeCloseTo(0.1);
    b.step(1);
    expect(b.count).toBe(0);
  });
});

describe('fx — eventos do CombatResolver → efeitos', () => {
  it('dano: flash + squash elástico, número e faíscas; crítico dourado, maior, treme e deforma mais', () => {
    const fx = new FxDirector(new Rng(5));
    const { t, hits, impacts } = targets();
    fx.onCombat(ev({ amount: 12 }), t);
    expect(fx.shake.amp).toBe(0);
    const normal = fx.particles.count;
    fx.onCombat(ev({ amount: 21, crit: true }), t);
    expect(hits).toEqual([
      [1, true],
      [1, true],
    ]);
    expect(impacts).toEqual([
      [1, SQUASH_KICK.hit],
      [1, SQUASH_KICK.crit],
    ]);
    const live: { text: string; color: number; size: number }[] = [];
    for (let i = 0; i < fx.floats.capacity; i++)
      if (fx.floats.alive(i)) live.push({ text: fx.floats.text[i]!, color: fx.floats.color[i]!, size: fx.floats.size[i]! });
    expect(live).toContainEqual({ text: '-12', color: COLOR.white, size: 12 });
    expect(live).toContainEqual({ text: '-21!', color: COLOR.gold, size: 15 });
    expect(fx.particles.count - normal).toBeGreaterThan(normal);
    expect(fx.shake.amp).toBe(SHAKE_PX.crit);
  });

  it('cor e tipo da sinergia: fogo magma, raio ciano elétrico, espectral violeta', () => {
    const fx = new FxDirector(new Rng(5));
    const { t } = targets();
    fx.onCombat(ev({ amount: 5, source: 'splash' }), t);
    expect(fx.particles.kind[0]).toBe(PART.fire);
    expect(fx.particles.color[0]).toBe(COLOR.magma);
    fx.clear();
    fx.onCombat(ev({ type: 'chain', source: 'none', x2: 200, y2: 150 }), t);
    expect(fx.beams.count).toBe(1);
    expect(fx.beams.zig[0]).toBe(1);
    expect(fx.particles.count).toBeGreaterThan(0);
    for (let i = 0; i < fx.particles.count; i++) {
      expect(fx.particles.kind[i]).toBe(PART.electric);
      expect(fx.particles.color[i]).toBe(COLOR.cyan);
    }
    fx.clear();
    fx.onSpectral(50, 50);
    expect(fx.particles.kind[0]).toBe(PART.spectral);
    expect(fx.particles.color[0]).toBe(COLOR.violet);
  });

  it('morte: partículas na cor do aro + onda; chefe (raio ≥ BOSS_RADIUS ou isBoss) treme o máximo', () => {
    const fx = new FxDirector(new Rng(5));
    const { t } = targets();
    fx.onCombat(ev({ type: 'kill', typeId: 'goblin' }), t);
    expect(fx.particles.color[0]).toBe(0x123456);
    expect(fx.particles.kind[0]).toBe(PART.death);
    expect(fx.waves.count).toBe(1);
    expect(fx.shake.amp).toBe(SHAKE_PX.kill);
    const normalParts = fx.particles.count;

    const boss = new FxDirector(new Rng(5));
    boss.onCombat(ev({ type: 'kill', typeId: 'boss_obsidian' }), targets(BOSS_RADIUS + 8).t);
    expect(boss.shake.amp).toBe(SHAKE_PX.bossKill);
    expect(boss.particles.count).toBeGreaterThan(normalParts * 2);

    const viaFlag = new FxDirector(new Rng(5));
    const tt = { ...targets().t, isBoss: (id: string) => id === 'miniboss_iron' };
    viaFlag.onCombat(ev({ type: 'kill', typeId: 'miniboss_iron' }), tt);
    expect(viaFlag.shake.amp).toBe(SHAKE_PX.bossKill);
  });

  it('explosão de morte: fogo + onda magma e tremida forte; tiro e barreira tremem', () => {
    const fx = new FxDirector(new Rng(5));
    const { t, hits } = targets();
    fx.onCombat(ev({ type: 'blocked' }), t);
    expect(hits).toEqual([[1, false]]);
    fx.clear();
    fx.onCombat(ev({ type: 'explosion', source: 'golem', radius: 92 }), t);
    expect(fx.waves.color[0]).toBe(COLOR.magma);
    expect(fx.shake.amp).toBe(SHAKE_PX.explosion);
    let fire = 0;
    for (let i = 0; i < fx.particles.count; i++) if (fx.particles.kind[i] === PART.fire) fire++;
    expect(fire).toBeGreaterThanOrEqual(16);
    const s = new FxDirector(new Rng(5));
    s.onCombat(ev({ type: 'shot', source: 'enemy', amount: 3, x2: 180, y2: 440 }), t);
    expect(s.beams.color[0]).toBe(COLOR.crimson);
    expect(s.shake.amp).toBe(SHAKE_PX.shot);
    s.onCombat(ev({ type: 'heal', amount: 0 }), t);
    expect(s.beams.count).toBe(1);
  });

  it('movimento reduzido: sem tremida e menos partículas, com teto menor de vivas', () => {
    const a = new FxDirector(new Rng(5));
    const b = new FxDirector(new Rng(5));
    b.setReducedMotion(true);
    expect(b.reducedMotion).toBe(true);
    const { t } = targets(40);
    for (const fx of [a, b]) {
      fx.onCombat(ev({ type: 'kill', typeId: 'boss' }), t);
      fx.onCombat(ev({ type: 'explosion', source: 'supernova', radius: 74 }), t);
      fx.onCombat(ev({ amount: 9, crit: true }), t);
    }
    expect(a.shake.amp).toBeGreaterThan(0);
    expect(b.shake.amp).toBe(0);
    expect(b.particles.count).toBeLessThan(a.particles.count * 0.5);
    for (let i = 0; i < 500; i++) b.onCombat(ev({ type: 'kill', typeId: 'x' }), t);
    expect(b.particles.count).toBe(PARTICLE_LIVE_REDUCED);
    b.setReducedMotion(false);
    for (let i = 0; i < 500; i++) b.onCombat(ev({ type: 'kill', typeId: 'x' }), t);
    expect(b.particles.count).toBe(PARTICLE_LIVE_MAX);
  });

  it('combo pesado respeita as capacidades e limpa tudo depois', () => {
    const fx = new FxDirector(new Rng(9));
    const { t } = targets();
    for (let i = 0; i < 2000; i++) {
      fx.onCombat(ev({ amount: i, crit: i % 3 === 0 }), t);
      fx.onCombat(ev({ type: 'explosion', source: 'supernova', radius: 74 }), t);
      fx.onCombat(ev({ type: 'chain', x2: 1, y2: 1 }), t);
      fx.onCombat(ev({ type: 'kill', typeId: 'x' }), t);
    }
    expect(fx.particles.count).toBe(FX_CAPACITY.particles);
    expect(fx.waves.count).toBe(FX_CAPACITY.waves);
    expect(fx.beams.count).toBe(FX_CAPACITY.beams);
    expect(fx.floats.active).toBe(FX_CAPACITY.floats);
    for (let i = 0; i < 60; i++) fx.step(1);
    expect(fx.particles.count + fx.waves.count + fx.beams.count + fx.floats.active).toBe(0);
    expect(fx.shake.active).toBe(false);
  });
});
