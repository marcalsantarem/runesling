/**
 * Lógica pura do game feel (decisão 21, GDD §6.3). Sem Phaser: testável no Vitest.
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
/** GDD §6.3: escala instantânea de 1.18×. */
export const SQUASH_PEAK = 1.18;
/** Fração do caminho de volta a 1.0 por frame (interpolação exponencial do slice). */
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

// ---------- Screen shake ----------
/** GDD §6.3: amplitude por evento (px do mundo lógico). */
export const SHAKE_PX = {
  damage: 0,
  explosion: 7,
  /** Tiro do atirador na barreira: valor do slice (o GDD não cita). */
  shot: 9,
  barrierHit: 12,
} as const;
/** Decaimento por frame e corte do slice. */
export const SHAKE_DECAY = 0.84;
export const SHAKE_MIN = 0.4;

/**
 * Amplitude da tremida de um evento de combate. Explosão só treme quando vem de uma morte
 * (Golem/Supernova), como no slice; splash e choque do bumper são explosões pequenas por acerto.
 */
export function shakeFor(type: CombatEventType, source: CombatSource): number {
  switch (type) {
    case 'explosion':
      return source === 'golem' || source === 'supernova' ? SHAKE_PX.explosion : 0;
    case 'shot':
      return SHAKE_PX.shot;
    case 'barrierHit':
      return SHAKE_PX.barrierHit;
    default:
      return SHAKE_PX.damage;
  }
}

/** Tremida de câmera: a maior amplitude vence, decai exponencialmente. */
export class Shake {
  amp = 0;
  ox = 0;
  oy = 0;

  add(px: number): void {
    if (px > this.amp) this.amp = px;
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
