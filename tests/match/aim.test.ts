import { describe, expect, it } from 'vitest';
import { aimAngle, aimPower, clampAimAngle, fanAngle, predictTrajectory } from '../../src/match/aim';

describe('Mira — travas', () => {
  it('mantém θ em [−π + 0.14, −0.14]', () => {
    expect(clampAimAngle(-Math.PI / 2)).toBeCloseTo(-Math.PI / 2);
    expect(clampAimAngle(-0.05)).toBeCloseTo(-0.14);
    expect(clampAimAngle(0.5)).toBeCloseTo(-0.14);
    expect(clampAimAngle(2.5)).toBeCloseTo(-Math.PI + 0.14);
    expect(clampAimAngle(-Math.PI + 0.05)).toBeCloseTo(-Math.PI + 0.14);
  });

  it('cancela abaixo de 14 px e puxar para baixo atira para cima', () => {
    expect(aimAngle(100, 100, 100, 110)).toBeNull();
    const a = aimAngle(100, 100, 100, 160)!;
    expect(a.angle).toBeCloseTo(-Math.PI / 2);
    // Puxar para cima apontaria para baixo: travado.
    const down = aimAngle(100, 100, 130, 60)!;
    expect(down.angle).toBeGreaterThanOrEqual(-Math.PI + 0.14 - 1e-9);
    expect(down.angle).toBeLessThanOrEqual(-0.14 + 1e-9);
  });

  it('v0 = 9.5 + min(1, d/120)·3.8', () => {
    expect(aimPower(0)).toBeCloseTo(9.5);
    expect(aimPower(60)).toBeCloseTo(11.4);
    expect(aimPower(500)).toBeCloseTo(13.3);
  });

  it('leque simétrico em torno do ângulo base', () => {
    const base = -1.2;
    const a = [0, 1, 2].map((i) => fanAngle(base, i, 3));
    expect(a[1]).toBeCloseTo(base);
    expect(a[0]! - base).toBeCloseTo(-(a[2]! - base));
    expect(fanAngle(base, 0, 1)).toBeCloseTo(base);
  });
});

describe('Mira — previsão', () => {
  it('1 quique: origem, quique, fim; 2 quiques adiciona um ponto', () => {
    const buf = new Float32Array(16);
    const n1 = predictTrajectory(300, 468, -0.3, 1, buf);
    expect(n1).toBe(3);
    expect(buf[2]).toBeCloseTo(352); // parede direita (360 − 8)
    const n2 = predictTrajectory(300, 468, -0.3, 2, buf);
    expect(n2).toBe(4);
    expect(buf[4]).toBeCloseTo(8); // parede esquerda
  });
});
