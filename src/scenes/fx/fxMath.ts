/**
 * Lógica pura do game feel (decisões 21 e 41, GDD §6.3). Sem Phaser: testável no Vitest.
 * Tudo avança em frames lógicos de 60 Hz (o mesmo passo da física).
 */
import type { CombatEventType, CombatSource } from '../../core/CombatResolver';
import type { RandomSource } from '../../match/rng';

/** Duração de um frame lógico (ms). */
export const FX_FRAME_MS = 1000 / 60;

// ---------- Hit-flash ----------
/** GDD §6.3: tint branco sólido por 50 ms. */
export const HIT_FLASH_MS = 50;

/** Frames lógicos de flash para uma duração em ms (50 ms → 3 frames). */
export function hitFlashFrames(ms: number = HIT_FLASH_MS): number {
  return Math.max(1, Math.round(ms / FX_FRAME_MS));
}

// ---------- Squash & stretch ----------
/** Escala instantânea do acerto (decisão 41: mais forte que o 1.18× do slice). */
export const SQUASH_PEAK = 1.26;
/** Fração do caminho de volta a 1.0 por frame (interpolação exponencial, sem mola). */
export const SQUASH_RETURN = 0.25;
/** Abaixo disto a escala volta exatamente a 1. */
const SQUASH_EPS = 0.002;

/** Escala após `frames` frames: 1 + (s − 1)·(1 − k)^frames, com encaixe em 1. */
export function squashScale(scale: number, frames: number): number {
  if (scale <= 1) return 1;
  if (frames <= 0) return scale;
  const s = 1 + (scale - 1) * Math.pow(1 - SQUASH_RETURN, frames);
  return s - 1 < SQUASH_EPS ? 1 : s;
}

/** Força do squash elástico por golpe (deformação inicial; 0.3 = 30% mais largo). */
export const SQUASH_KICK = { hit: 0.24, crit: 0.36, explosion: 0.3, orb: 0.3 } as const;
/** Teto da deformação somada (golpes seguidos não estouram o sprite). */
export const SQUASH_MAX = 0.42;
/** Mola: rigidez e fração da velocidade mantida por frame (subamortecida → oscila e assenta). */
export const SPRING_K = 0.3;
export const SPRING_KEEP = 0.68;
/** Eixo Y compensa parte do X (squash & stretch com volume aproximado). */
export const SQUASH_Y = 0.6;
/** Com "reduzir movimento": deformação reduzida. */
export const REDUCED_SQUASH = 0.35;
const SPRING_EPS = 0.0015;

/**
 * Squash elástico (decisão 41): mola subamortecida sobre o desvio `s` da escala 1.
 * Um objeto por view, criado uma vez; `step` não aloca. scaleX = 1 + s, scaleY = 1 − s·SQUASH_Y.
 */
export class SquashSpring {
  s = 0;
  v = 0;
  reduced = false;

  /** Golpe: soma a deformação até o teto. */
  kick(amount: number): void {
    if (amount <= 0) return;
    const a = this.reduced ? amount * REDUCED_SQUASH : amount;
    this.s = Math.min(SQUASH_MAX, Math.max(this.s, 0) + a);
    this.v = 0;
  }

  step(frames: number): void {
    for (let f = 0; f < frames; f++) {
      if (this.s === 0 && this.v === 0) return;
      this.v = (this.v - SPRING_K * this.s) * SPRING_KEEP;
      this.s += this.v;
      if (Math.abs(this.s) < SPRING_EPS && Math.abs(this.v) < SPRING_EPS) {
        this.s = 0;
        this.v = 0;
      }
    }
  }

  get scaleX(): number {
    return 1 + this.s;
  }

  get scaleY(): number {
    return 1 - this.s * SQUASH_Y;
  }

  get active(): boolean {
    return this.s !== 0 || this.v !== 0;
  }

  reset(): void {
    this.s = 0;
    this.v = 0;
  }
}

// ---------- Screen shake ----------
/** Amplitude por evento (px do mundo lógico). Decisão 41: mais forte e proporcional ao golpe. */
export const SHAKE_PX = {
  damage: 0,
  crit: 3.5,
  /** Explosões pequenas por acerto (splash, choque do bumper). */
  splash: 2,
  /** Explosão de morte (Golem/Supernova). */
  explosion: 10,
  kill: 1.5,
  bossKill: 18,
  /** Tiro do atirador na barreira. */
  shot: 11,
  barrierHit: 15,
} as const;
/** Teto absoluto da tremida e fração da menor amplitude somada quando golpes se acumulam. */
export const SHAKE_CAP = 20;
export const SHAKE_STACK = 0.35;
/** Decaimento por frame e corte. */
export const SHAKE_DECAY = 0.85;
export const SHAKE_MIN = 0.4;

/**
 * Amplitude da tremida de um evento de combate: crítico treme pouco, explosão de morte e tiro
 * tremem bem, morte de chefe é o máximo. Dano normal não treme (seria ruído com 28 orbes).
 */
export function shakeFor(type: CombatEventType, source: CombatSource, crit = false, boss = false): number {
  switch (type) {
    case 'damage':
      return crit ? SHAKE_PX.crit : SHAKE_PX.damage;
    case 'explosion':
      return source === 'golem' || source === 'supernova' ? SHAKE_PX.explosion : SHAKE_PX.splash;
    case 'kill':
      return boss ? SHAKE_PX.bossKill : SHAKE_PX.kill;
    case 'shot':
      return SHAKE_PX.shot;
    case 'barrierHit':
      return SHAKE_PX.barrierHit;
    default:
      return 0;
  }
}

/** Soma de amplitudes: max + SHAKE_STACK·min, limitada a SHAKE_CAP. */
export function stackShake(amp: number, px: number): number {
  if (px <= 0) return amp;
  const hi = Math.max(amp, px);
  const lo = Math.min(amp, px);
  return Math.min(SHAKE_CAP, hi + SHAKE_STACK * lo);
}

/** Tremida de câmera: golpes se somam até o teto e decaem exponencialmente. */
export class Shake {
  amp = 0;
  ox = 0;
  oy = 0;
  /** "Reduzir movimento": não treme. */
  reduced = false;

  add(px: number): void {
    if (this.reduced) return;
    this.amp = stackShake(this.amp, px);
  }

  /** Avança `frames` e sorteia o deslocamento em [−amp/2, amp/2). Sem frames, mantém o atual. */
  step(frames: number, rng: RandomSource): void {
    if (frames <= 0) return;
    if (this.amp <= SHAKE_MIN) {
      this.amp = 0;
      this.ox = 0;
      this.oy = 0;
      return;
    }
    this.ox = (rng.next() - 0.5) * this.amp;
    this.oy = (rng.next() - 0.5) * this.amp;
    this.amp *= Math.pow(SHAKE_DECAY, frames);
  }

  get active(): boolean {
    return this.amp > 0 || this.ox !== 0 || this.oy !== 0;
  }

  reset(): void {
    this.amp = 0;
    this.ox = 0;
    this.oy = 0;
  }
}

// ---------- Partículas: quantidade e limite ----------
/** Com "reduzir movimento": fração das partículas de cada rajada e teto de vivas. */
export const REDUCED_PARTICLES = 0.4;
export const PARTICLE_LIVE_MAX = 384;
export const PARTICLE_LIVE_REDUCED = 128;

/** Partículas de uma rajada (≥ 1 quando n ≥ 1). */
export function particleCount(n: number, reduced: boolean): number {
  if (n <= 0) return 0;
  return reduced ? Math.max(1, Math.round(n * REDUCED_PARTICLES)) : n;
}
