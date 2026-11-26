import { describe, expect, it } from 'vitest';
import type { CombatEvent } from '../../src/core/CombatResolver';
import { Rng } from '../../src/match/rng';
import { FX_CAPACITY, FxDirector, type FxTargets } from '../../src/scenes/fx/FxDirector';
import {
  hitFlashFrames,
  Shake,
  SHAKE_DECAY,
  SHAKE_PX,
  shakeFor,
  SQUASH_PEAK,
  SQUASH_RETURN,
  squashScale,
} from '../../src/scenes/fx/fxMath';
import { BeamPool, FloatTextPool, ParticlePool, WavePool } from '../../src/scenes/fx/pools';
import { COLOR } from '../../src/scenes/views/palette';

function ev(p: Partial<CombatEvent>): CombatEvent {
  return { type: 'damage', enemyId: 1, typeId: '', amount: 0, crit: false, source: 'orb', x: 100, y: 100, x2: 0, y2: 0, radius: 0, ...p };
}

function targets() {
  const hits: [number, boolean][] = [];
  const t: FxTargets = {
    radius: (id) => (id === 1 ? 16 : 0),
    hit: (id, squash) => void hits.push([id, squash]),
    rimColor: () => 0x123456,
  };
  return { t, hits };
}

describe('Game feel — hit-flash e squash (GDD §6.3)', () => {
  it('hit-flash de 50 ms = 3 frames lógicos de 60 Hz', () => {
    expect(hitFlashFrames()).toBe(3);
    expect(hitFlashFrames(100)).toBe(6);
    expect(hitFlashFrames(1)).toBe(1);
  });

  it('squash parte de 1.18× e volta exponencialmente a 1', () => {
    expect(SQUASH_PEAK).toBe(1.18);
    const s1 = squashScale(SQUASH_PEAK, 1);
    expect(s1).toBeCloseTo(1 + 0.18 * (1 - SQUASH_RETURN));
    // Passos separados = passo único (curva exponencial).
    expect(squashScale(squashScale(SQUASH_PEAK, 2), 2)).toBeCloseTo(squashScale(SQUASH_PEAK, 4));
    let s = SQUASH_PEAK;
    let prev = s;
    let n = 0;
    while (s !== 1 && n < 100) {
      s = squashScale(s, 1);
      expect(s).toBeLessThan(prev);
      prev = s;
      n++;
    }
    expect(s).toBe(1);
    expect(n).toBeLessThan(25); // assenta em < 0.4 s
    expect(squashScale(SQUASH_PEAK, 0)).toBe(SQUASH_PEAK);
    expect(squashScale(0.9, 1)).toBe(1);
  });
});

describe('Game feel — tremida de tela', () => {
  it('intensidade por evento: dano 0, explosão de morte 7, barreira 12', () => {
    expect(shakeFor('damage', 'orb')).toBe(0);
    expect(shakeFor('damage', 'chain')).toBe(0);
    expect(shakeFor('explosion', 'golem')).toBe(7);
    expect(shakeFor('explosion', 'supernova')).toBe(7);
    expect(shakeFor('explosion', 'splash')).toBe(0);
    expect(shakeFor('explosion', 'shock')).toBe(0);
    expect(shakeFor('barrierHit', 'enemy')).toBe(12);
    expect(shakeFor('shot', 'enemy')).toBe(SHAKE_PX.shot);
    expect(shakeFor('kill', 'none')).toBe(0);
  });

  it('a maior amplitude vence, decai e zera; deslocamento dentro de ±amp/2', () => {
    const sh = new Shake();
    const rng = new Rng(7);
    sh.add(7);
    sh.add(12);
    sh.add(3);
    expect(sh.amp).toBe(12);
    sh.step(1, rng);
    expect(Math.abs(sh.ox)).toBeLessThanOrEqual(6);
    expect(Math.abs(sh.oy)).toBeLessThanOrEqual(6);
    expect(sh.amp).toBeCloseTo(12 * SHAKE_DECAY);
    const ox = sh.ox;
    sh.step(0, rng); // pausa: congela
    expect(sh.ox).toBe(ox);
    for (let i = 0; i < 40; i++) sh.step(1, rng);
    expect(sh.amp).toBe(0);
    expect(sh.ox).toBe(0);
    expect(sh.active).toBe(false);
  });

  it('é determinística com a mesma semente', () => {
    const a = new Shake();
    const b = new Shake();
    const ra = new Rng(42);
    const rb = new Rng(42);
    a.add(12);
    b.add(12);
    for (let i = 0; i < 5; i++) {
      a.step(1, ra);
      b.step(1, rb);
      expect(a.ox).toBe(b.ox);
      expect(a.oy).toBe(b.oy);
    }
  });
});

describe('Game feel — pools sem alocação', () => {
  it('partículas: rajada, movimento, morte por vida e remoção densa', () => {
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
    }
    const x0 = p.x[0]! + p.vx[0]! * 2;
    p.step(2);
    expect(p.x[0]).toBeCloseTo(x0, 4);
    p.step(30);
    expect(p.count).toBe(0);
  });

  it('pool cheio sobrescreve em rodízio e nunca passa da capacidade', () => {
    const p = new ParticlePool(8);
    const xs = p.x;
    const rng = new Rng(3);
    for (let i = 0; i < 50; i++) p.burst(i, 0, 1, 3, 2, rng);
    expect(p.count).toBe(8);
    expect(p.x).toBe(xs); // mesmo buffer
    const f = new FloatTextPool(4);
    for (let i = 0; i < 10; i++) f.spawn(0, 0, `-${i}`, 0xffffff, 12);
    expect(f.active).toBe(4);
    expect(f.text.length).toBe(4);
  });

  it('números flutuantes sobem 0.9 px/frame e somem em 28 frames; slot reaproveitado muda a versão', () => {
    const f = new FloatTextPool(4);
    const i = f.spawn(50, 100, '-7', 0xffffff, 12);
    const v = f.version[i]!;
    f.step(10);
    expect(f.y[i]).toBeCloseTo(91);
    expect(f.alive(i)).toBe(true);
    f.step(18);
    expect(f.alive(i)).toBe(false);
    expect(f.active).toBe(0);
    const j = f.spawn(0, 0, '-8', 0xffffff, 12);
    expect(f.version[j]).toBeGreaterThan(j === i ? v : 0);
  });

  it('onda cresce exponencialmente até o raio máximo; feixe some pela vida', () => {
    const w = new WavePool(4);
    w.spawn(0, 0, 10, 90, 16, 1);
    w.step(1);
    expect(w.r[0]).toBeCloseTo(10 + 80 * 0.25);
    w.step(14);
    expect(w.r[0]).toBeLessThan(90);
    expect(w.r[0]).toBeGreaterThan(88);
    w.step(1);
    expect(w.count).toBe(0);
    const b = new BeamPool(2);
    b.spawn(0, 0, 10, 10, 11, 1, true);
    b.step(10);
    expect(b.count).toBe(1);
    expect(b.alpha(0)).toBeCloseTo(0.1);
    b.step(1);
    expect(b.count).toBe(0);
  });
});

describe('Game feel — eventos do CombatResolver → efeitos', () => {
  it('dano: flash + squash, número branco e faíscas; crítico em dourado e maior', () => {
    const fx = new FxDirector(new Rng(5));
    const { t, hits } = targets();
    fx.onCombat(ev({ amount: 12 }), t);
    fx.onCombat(ev({ amount: 21, crit: true }), t);
    expect(hits).toEqual([
      [1, true],
      [1, true],
    ]);
    const live: { text: string; color: number; size: number; y: number }[] = [];
    for (let i = 0; i < fx.floats.capacity; i++)
      if (fx.floats.alive(i)) live.push({ text: fx.floats.text[i]!, color: fx.floats.color[i]!, size: fx.floats.size[i]!, y: fx.floats.y[i]! });
    expect(live).toContainEqual({ text: '-12', color: COLOR.white, size: 12, y: 84 });
    expect(live).toContainEqual({ text: '-21!', color: COLOR.gold, size: 15, y: 84 });
    expect(fx.particles.count).toBe(5 + 8);
    expect(fx.shake.amp).toBe(0);
  });

  it('escudo: só flash; morte: partículas na cor do aro; explosão de morte treme 7 px', () => {
    const fx = new FxDirector(new Rng(5));
    const { t, hits } = targets();
    fx.onCombat(ev({ type: 'blocked' }), t);
    expect(hits).toEqual([[1, false]]);
    fx.onCombat(ev({ type: 'kill', typeId: 'goblin' }), t);
    expect(fx.particles.count).toBe(12);
    expect(fx.particles.color[0]).toBe(0x123456);
    fx.onCombat(ev({ type: 'explosion', source: 'golem', radius: 92 }), t);
    expect(fx.waves.count).toBe(1);
    expect(fx.waves.color[0]).toBe(COLOR.magma);
    expect(fx.shake.amp).toBe(7);
    fx.onCombat(ev({ type: 'barrierHit', source: 'enemy', amount: 2 }), t);
    expect(fx.shake.amp).toBe(12);
  });

  it('Raio em Cadeia e tiro do atirador viram feixes; cura sem ganho não desenha', () => {
    const fx = new FxDirector(new Rng(5));
    const { t } = targets();
    fx.onCombat(ev({ type: 'chain', source: 'none', x2: 200, y2: 150 }), t);
    fx.onCombat(ev({ type: 'shot', source: 'enemy', amount: 3, x2: 180, y2: 440 }), t);
    fx.onCombat(ev({ type: 'heal', amount: 0 }), t);
    expect(fx.beams.count).toBe(2);
    expect(fx.beams.zig[0]).toBe(1);
    expect(fx.beams.color[0]).toBe(COLOR.cyan);
    expect(fx.beams.zig[1]).toBe(0);
    expect(fx.beams.color[1]).toBe(COLOR.crimson);
    expect(fx.shake.amp).toBe(SHAKE_PX.shot);
  });

  it('combo pesado respeita as capacidades e limpa tudo depois', () => {
    const fx = new FxDirector(new Rng(9));
    const { t } = targets();
    for (let i = 0; i < 2000; i++) {
      fx.onCombat(ev({ amount: i, crit: i % 3 === 0 }), t);
      fx.onCombat(ev({ type: 'explosion', source: 'supernova', radius: 74 }), t);
      fx.onCombat(ev({ type: 'chain', x2: 1, y2: 1 }), t);
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
