import { arp, noise, tone, type Voice } from './synth';

/** Chaves estáveis dos efeitos (T-045). A T-046 liga cada uma a eventos. */
export const SFX_KEYS = [
  'impact', 'wall', 'bumper', 'ring', 'explosion', 'zap', 'ghost', 'kill', 'crit', 'barrier_hit',
  'heal', 'wave_start', 'draft_open', 'pick', 'ui_tap', 'ui_back', 'victory', 'defeat',
] as const;
export type SfxKey = (typeof SFX_KEYS)[number];

export interface SfxDef {
  /** Vozes simultâneas máximas deste efeito. */
  voices: number;
  /** Se o tom do combo se aplica (a variação de ±8% vale sempre). */
  combo: boolean;
  /** Monta o som e retorna a duração (s). */
  build: (v: Voice) => number;
}

// Notas (Hz) — escala menor de Lá, tom arcano.
const A4 = 440, C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99, A5 = 880, C6 = 1046.5, E6 = 1318.5;

export const SFX: Record<SfxKey, SfxDef> = {
  impact: { voices: 6, combo: true, build: (v) => Math.max(
    tone(v, { type: 'triangle', f: E5, f2: A4, dur: 0.12, gain: 0.32 }),
    noise(v, { filter: 'bandpass', f: 2400, q: 1.2, dur: 0.05, gain: 0.18 }),
  ) },
  wall: { voices: 4, combo: false, build: (v) => Math.max(
    tone(v, { type: 'sine', f: 180, f2: 90, dur: 0.09, gain: 0.3 }),
    noise(v, { filter: 'lowpass', f: 900, dur: 0.06, gain: 0.15 }),
  ) },
  bumper: { voices: 4, combo: true, build: (v) => Math.max(
    tone(v, { type: 'square', f: 330, f2: 990, dur: 0.1, gain: 0.12, lp: 3000 }),
    tone(v, { type: 'sine', f: 660, f2: 1320, dur: 0.14, gain: 0.18 }),
  ) },
  ring: { voices: 3, combo: true, build: (v) => Math.max(
    tone(v, { type: 'sine', f: A5, dur: 0.45, gain: 0.2 }),
    tone(v, { type: 'sine', f: E6, dur: 0.35, gain: 0.08, delay: 0.01 }),
  ) },
  explosion: { voices: 3, combo: false, build: (v) => Math.max(
    noise(v, { filter: 'lowpass', f: 2200, f2: 120, dur: 0.55, gain: 0.5 }),
    tone(v, { type: 'sine', f: 110, f2: 38, dur: 0.4, gain: 0.45 }),
  ) },
  zap: { voices: 3, combo: true, build: (v) => Math.max(
    tone(v, { type: 'sawtooth', f: 1800, f2: 220, dur: 0.18, gain: 0.12, lp: 5000 }),
    noise(v, { filter: 'highpass', f: 3000, dur: 0.15, gain: 0.14 }),
    tone(v, { type: 'square', f: 1200, f2: 300, dur: 0.08, gain: 0.06, delay: 0.06 }),
  ) },
  ghost: { voices: 2, combo: false, build: (v) => Math.max(
    tone(v, { type: 'sine', f: 520, f2: 260, dur: 0.35, gain: 0.16, attack: 0.05 }),
    tone(v, { type: 'triangle', f: 530, f2: 265, dur: 0.35, gain: 0.1, attack: 0.05 }),
    noise(v, { filter: 'bandpass', f: 1200, f2: 500, q: 4, dur: 0.3, gain: 0.08, attack: 0.05 }),
  ) },
  kill: { voices: 4, combo: true, build: (v) => Math.max(
    arp(v, [A4, E5, A5], 0.04, { type: 'triangle', dur: 0.16, gain: 0.22 }),
    noise(v, { filter: 'bandpass', f: 3000, f2: 800, q: 1, dur: 0.18, gain: 0.12 }),
  ) },
  crit: { voices: 3, combo: true, build: (v) => Math.max(
    tone(v, { type: 'square', f: C6, f2: A5, dur: 0.12, gain: 0.1, lp: 4000 }),
    tone(v, { type: 'sine', f: E6, dur: 0.22, gain: 0.14, delay: 0.03 }),
    noise(v, { filter: 'highpass', f: 4000, dur: 0.06, gain: 0.16 }),
  ) },
  barrier_hit: { voices: 2, combo: false, build: (v) => Math.max(
    tone(v, { type: 'sawtooth', f: 160, f2: 60, dur: 0.45, gain: 0.25, lp: 900 }),
    tone(v, { type: 'square', f: 233, f2: 80, dur: 0.35, gain: 0.08, lp: 700 }),
    noise(v, { filter: 'lowpass', f: 1500, f2: 200, dur: 0.3, gain: 0.25 }),
  ) },
  heal: { voices: 2, combo: false, build: (v) => arp(v, [C5, E5, G5, C6], 0.06, { type: 'sine', dur: 0.3, gain: 0.16, attack: 0.02 }) },
  wave_start: { voices: 1, combo: false, build: (v) => Math.max(
    tone(v, { type: 'sawtooth', f: 110, dur: 0.7, gain: 0.12, attack: 0.08, lp: 800 }),
    arp(v, [A4, D5, E5], 0.12, { type: 'triangle', dur: 0.35, gain: 0.16 }),
  ) },
  draft_open: { voices: 1, combo: false, build: (v) => Math.max(
    noise(v, { filter: 'bandpass', f: 600, f2: 4000, q: 3, dur: 0.35, gain: 0.12, attack: 0.1 }),
    arp(v, [E5, A5, C6, E6], 0.05, { type: 'sine', dur: 0.4, gain: 0.12 }),
  ) },
  pick: { voices: 2, combo: false, build: (v) => Math.max(
    tone(v, { type: 'triangle', f: A5, dur: 0.12, gain: 0.22 }),
    tone(v, { type: 'sine', f: E6, dur: 0.25, gain: 0.14, delay: 0.07 }),
  ) },
  ui_tap: { voices: 3, combo: false, build: (v) => tone(v, { type: 'triangle', f: 1400, f2: 900, dur: 0.05, gain: 0.16 }) },
  ui_back: { voices: 3, combo: false, build: (v) => tone(v, { type: 'triangle', f: 700, f2: 400, dur: 0.08, gain: 0.16 }) },
  victory: { voices: 1, combo: false, build: (v) => Math.max(
    arp(v, [A4, C5, E5, A5], 0.11, { type: 'triangle', dur: 0.3, gain: 0.2 }),
    tone(v, { type: 'sine', f: E6, dur: 0.9, gain: 0.1, delay: 0.44, attack: 0.03 }),
    tone(v, { type: 'sine', f: A5, dur: 0.9, gain: 0.14, delay: 0.44, attack: 0.03 }),
  ) },
  defeat: { voices: 1, combo: false, build: (v) => Math.max(
    arp(v, [E5, D5, C5, A4 / 2], 0.18, { type: 'sawtooth', dur: 0.4, gain: 0.1, lp: 1200 }),
    tone(v, { type: 'sine', f: 110, f2: 55, dur: 1.1, gain: 0.2, delay: 0.5 }),
  ) },
};
