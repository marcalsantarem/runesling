/**
 * Mira (GDD §2.1/§2.2): ângulo com trava, cancelamento, potência, leque e previsão.
 * TS puro, sem Phaser. A previsão escreve num buffer reutilizável (sem alocação por frame).
 */
import type { GameData } from '../data/types';

export interface AimConfig {
  /** Margem da trava: −π + m ≤ θ ≤ −m. */
  angleMargin: number;
  cancelDistance: number;
  basePower: number;
  powerBonus: number;
  powerDistance: number;
  /** Abertura entre orbes do leque (slice: 0.085 rad). */
  fanSpread: number;
  /** Margem das paredes na previsão (slice: 8). */
  previewMargin: number;
  previewStep: number;
  /** Comprimento da linha com 1 e 2 quiques (slice: 310 / 460). */
  previewLength1: number;
  previewLength2: number;
  worldWidth: number;
}

export const DEFAULT_AIM_CONFIG: Readonly<AimConfig> = Object.freeze({
  angleMargin: 0.14,
  cancelDistance: 14,
  basePower: 9.5,
  powerBonus: 3.8,
  powerDistance: 120,
  fanSpread: 0.085,
  previewMargin: 8,
  previewStep: 4,
  previewLength1: 310,
  previewLength2: 460,
  worldWidth: 360,
});

/** Config da mira a partir de `rules.launch`/`rules.world` (números do JSON); o resto do padrão do slice. */
export function aimConfigFromRules(data: GameData): AimConfig {
  const l = data.rules.launch;
  return {
    ...DEFAULT_AIM_CONFIG,
    angleMargin: l.minAngleRad,
    cancelDistance: l.cancelPullPx,
    basePower: l.v0Base,
    powerBonus: l.v0Bonus,
    powerDistance: l.pullForMaxPx,
    fanSpread: l.multishotSpreadRad,
    worldWidth: data.rules.world.width,
  };
}

export interface Aim {
  angle: number;
  power: number;
}

/** Trava o ângulo para sempre apontar para cima. */
export function clampAimAngle(angle: number, cfg: Readonly<AimConfig> = DEFAULT_AIM_CONFIG): number {
  const m = cfg.angleMargin;
  if (angle > -m && angle <= Math.PI / 2) return -m;
  if (angle > Math.PI / 2 || angle < -Math.PI + m) return -Math.PI + m;
  return angle;
}

/** v0 = base + min(1, d/D)·bônus. */
export function aimPower(distance: number, cfg: Readonly<AimConfig> = DEFAULT_AIM_CONFIG): number {
  return cfg.basePower + Math.min(1, distance / cfg.powerDistance) * cfg.powerBonus;
}

/**
 * Ângulo e potência a partir do arrasto (puxar para trás, como estilingue: direção = início − atual).
 * Retorna null abaixo da distância de cancelamento. `out` evita alocação.
 */
export function aimAngle(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
  cfg: Readonly<AimConfig> = DEFAULT_AIM_CONFIG,
  out: Aim = { angle: 0, power: 0 },
): Aim | null {
  const dx = startX - currentX;
  const dy = startY - currentY;
  const dist = Math.hypot(dx, dy);
  if (dist < cfg.cancelDistance) return null;
  out.angle = clampAimAngle(Math.atan2(dy, dx), cfg);
  out.power = aimPower(dist, cfg);
  return out;
}

/** Ângulo do orbe i num leque simétrico de `count` orbes. */
export function fanAngle(baseAngle: number, i: number, count: number, spread: number = DEFAULT_AIM_CONFIG.fanSpread): number {
  return baseAngle + (i - (count - 1) / 2) * spread;
}

/**
 * Previsão da trajetória (paredes laterais e teto) com 1 ou 2 quiques.
 * Escreve pares (x, y) em `out` e retorna o número de pontos. O primeiro ponto é a origem;
 * os seguintes são os quiques e o ponto final.
 */
export function predictTrajectory(
  x0: number,
  y0: number,
  angle: number,
  maxBounces: 1 | 2,
  out: Float32Array,
  cfg: Readonly<AimConfig> = DEFAULT_AIM_CONFIG,
): number {
  const m = cfg.previewMargin;
  const step = cfg.previewStep;
  const right = cfg.worldWidth - m;
  const length = maxBounces === 2 ? cfg.previewLength2 : cfg.previewLength1;
  const cap = out.length >> 1;
  let vx = Math.cos(angle);
  let vy = Math.sin(angle);
  let px = x0;
  let py = y0;
  let bounces = 0;
  let n = 0;
  n = writePoint(out, n, cap, px, py);
  for (let s = 0; s < length; s += step) {
    px += vx * step;
    py += vy * step;
    if (px < m || px > right) {
      bounces++;
      if (bounces > maxBounces) break;
      vx = -vx;
      px = Math.max(m, Math.min(right, px));
      n = writePoint(out, n, cap, px, py);
    }
    if (py < m) {
      bounces++;
      if (bounces > maxBounces) break;
      vy = -vy;
      py = m;
      n = writePoint(out, n, cap, px, py);
    }
  }
  // A ponta final respeita a margem mesmo quando o laço sai por excesso de quiques (QA M2-03).
  px = Math.max(m, Math.min(right, px));
  if (py < m) py = m;
  n = writePoint(out, n, cap, px, py);
  return n;
}

function writePoint(out: Float32Array, n: number, cap: number, x: number, y: number): number {
  if (n >= cap) return n;
  out[n * 2] = x;
  out[n * 2 + 1] = y;
  return n + 1;
}
