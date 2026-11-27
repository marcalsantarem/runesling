import { describe, expect, it } from 'vitest';
import { Rng } from '../../src/match/rng';
import {
  hitFlashFrames,
  particleCount,
  REDUCED_SQUASH,
  Shake,
  SHAKE_CAP,
  SHAKE_DECAY,
  SHAKE_PX,
  SHAKE_STACK,
  shakeFor,
  SQUASH_KICK,
  SQUASH_MAX,
  SQUASH_PEAK,
  SQUASH_RETURN,
  SQUASH_Y,
  squashScale,
  SquashSpring,
  stackShake,
} from '../../src/scenes/fx/fxMath';

describe('fx — hit-flash e squash', () => {
  it('hit-flash de 50 ms = 3 frames lógicos de 60 Hz', () => {
    expect(hitFlashFrames()).toBe(3);
    expect(hitFlashFrames(100)).toBe(6);
    expect(hitFlashFrames(1)).toBe(1);
  });

  it('squash exponencial: pico mais forte que o 1.18× do slice e volta a 1 em < 25 frames', () => {
    expect(SQUASH_PEAK).toBeGreaterThan(1.18);
    expect(squashScale(SQUASH_PEAK, 1)).toBeCloseTo(1 + (SQUASH_PEAK - 1) * (1 - SQUASH_RETURN));
    expect(squashScale(squashScale(SQUASH_PEAK, 2), 2)).toBeCloseTo(squashScale(SQUASH_PEAK, 4));
    let s = SQUASH_PEAK;
    let n = 0;
    while (s !== 1 && n < 100) {
      const prev = s;
      s = squashScale(s, 1);
      expect(s).toBeLessThan(prev);
      n++;
    }
    expect(n).toBeLessThan(25);
    expect(squashScale(SQUASH_PEAK, 0)).toBe(SQUASH_PEAK);
    expect(squashScale(0.9, 1)).toBe(1);
  });

  it('mola elástica: passa do ponto (oscila), assenta exatamente em 1 e o crítico deforma mais', () => {
    const sp = new SquashSpring();
    sp.kick(SQUASH_KICK.hit);
    expect(sp.scaleX).toBeCloseTo(1 + SQUASH_KICK.hit);
    expect(sp.scaleY).toBeCloseTo(1 - SQUASH_KICK.hit * SQUASH_Y);
    let min = 0;
    let n = 0;
    while (sp.active && n < 200) {
      sp.step(1);
      min = Math.min(min, sp.s);
      expect(Math.abs(sp.s)).toBeLessThanOrEqual(SQUASH_KICK.hit + 1e-9);
      n++;
    }
    expect(min).toBeLessThan(-0.02); // overshoot visível
    expect(n).toBeLessThan(45); // assenta em < 0,75 s
    expect(sp.scaleX).toBe(1);
    expect(sp.scaleY).toBe(1);
    expect(SQUASH_KICK.crit).toBeGreaterThan(SQUASH_KICK.hit);
  });

  it('mola: golpes somam até o teto; passo múltiplo = passos simples; frames 0 congela', () => {
    const a = new SquashSpring();
    for (let i = 0; i < 10; i++) a.kick(SQUASH_KICK.crit);
    expect(a.s).toBe(SQUASH_MAX);
    const b = new SquashSpring();
    a.reset();
    a.kick(0.3);
    b.kick(0.3);
    a.step(3);
    for (let i = 0; i < 3; i++) b.step(1);
    expect(a.s).toBeCloseTo(b.s, 10);
    const s = a.s;
    a.step(0);
    expect(a.s).toBe(s);
  });

  it('mola com movimento reduzido deforma bem menos', () => {
    const sp = new SquashSpring();
    sp.reduced = true;
    sp.kick(SQUASH_KICK.crit);
    expect(sp.s).toBeCloseTo(SQUASH_KICK.crit * REDUCED_SQUASH);
  });
});

describe('fx — tremida de tela', () => {
  it('proporcional ao golpe: dano 0 < crítico < explosão de morte < tiro < barreira < morte de chefe ≤ teto', () => {
    expect(shakeFor('damage', 'orb')).toBe(0);
    expect(shakeFor('damage', 'orb', true)).toBe(SHAKE_PX.crit);
    expect(shakeFor('explosion', 'splash')).toBe(SHAKE_PX.splash);
    expect(shakeFor('explosion', 'golem')).toBe(SHAKE_PX.explosion);
    expect(shakeFor('explosion', 'supernova')).toBe(SHAKE_PX.explosion);
    expect(shakeFor('kill', 'none')).toBe(SHAKE_PX.kill);
    expect(shakeFor('kill', 'none', false, true)).toBe(SHAKE_PX.bossKill);
    expect(shakeFor('heal', 'enemy')).toBe(0);
    const order = [0, SHAKE_PX.crit, SHAKE_PX.explosion, SHAKE_PX.shot, SHAKE_PX.barrierHit, SHAKE_PX.bossKill];
    for (let i = 1; i < order.length; i++) expect(order[i]).toBeGreaterThan(order[i - 1]!);
    expect(SHAKE_PX.bossKill).toBeLessThanOrEqual(SHAKE_CAP);
    // Mais forte que o slice (explosão 7, barreira 12).
    expect(SHAKE_PX.explosion).toBeGreaterThan(7);
    expect(SHAKE_PX.barrierHit).toBeGreaterThan(12);
  });

  it('golpes se acumulam (max + fração do menor) com teto', () => {
    expect(stackShake(0, 10)).toBe(10);
    expect(stackShake(10, 4)).toBeCloseTo(10 + SHAKE_STACK * 4);
    expect(stackShake(4, 10)).toBeCloseTo(10 + SHAKE_STACK * 4);
    expect(stackShake(5, 0)).toBe(5);
    let a = 0;
    for (let i = 0; i < 50; i++) a = stackShake(a, SHAKE_PX.bossKill);
    expect(a).toBe(SHAKE_CAP);
  });

  it('decai exponencialmente e zera; deslocamento dentro de ±amp/2; pausa congela', () => {
    const sh = new Shake();
    const rng = new Rng(7);
    sh.add(12);
    sh.step(1, rng);
    expect(Math.abs(sh.ox)).toBeLessThanOrEqual(6);
    expect(Math.abs(sh.oy)).toBeLessThanOrEqual(6);
    expect(sh.amp).toBeCloseTo(12 * SHAKE_DECAY);
    const ox = sh.ox;
    sh.step(0, rng);
    expect(sh.ox).toBe(ox);
    let n = 0;
    while (sh.active && n < 200) {
      sh.step(1, rng);
      n++;
    }
    expect(n).toBeLessThan(30); // < 0,5 s
    expect(sh.amp).toBe(0);
    expect(sh.ox).toBe(0);
  });

  it('o teto vale mesmo somando muitos eventos fortes', () => {
    const sh = new Shake();
    for (let i = 0; i < 100; i++) sh.add(SHAKE_PX.barrierHit);
    expect(sh.amp).toBe(SHAKE_CAP);
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

  it('movimento reduzido: não treme', () => {
    const sh = new Shake();
    sh.reduced = true;
    sh.add(SHAKE_PX.bossKill);
    sh.step(1, new Rng(1));
    expect(sh.amp).toBe(0);
    expect(sh.active).toBe(false);
  });
});

describe('fx — quantidade de partículas', () => {
  it('movimento reduzido corta a rajada mas mantém pelo menos 1', () => {
    expect(particleCount(10, false)).toBe(10);
    expect(particleCount(10, true)).toBe(4);
    expect(particleCount(1, true)).toBe(1);
    expect(particleCount(0, true)).toBe(0);
    expect(particleCount(-3, false)).toBe(0);
  });
});
