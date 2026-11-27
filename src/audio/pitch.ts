/** Curva de tom pelo combo do turno (GDD §6.3): p(c) = min(1.45, 1 + 0.03c). Teto em c = 15. */
export const PITCH_STEP = 0.03;
export const PITCH_MAX = 1.45;
/** Variação aleatória por disparo: ±8% (decisão 39). */
export const PITCH_JITTER = 0.08;

export function comboPitch(combo: number): number {
  const c = Number.isFinite(combo) ? Math.max(0, combo) : 0;
  return Math.min(PITCH_MAX, 1 + PITCH_STEP * c);
}

/** Fator aleatório em [1 - 0.08, 1 + 0.08]; `random` retorna [0, 1). */
export function pitchJitter(random: () => number = Math.random): number {
  return 1 + (random() * 2 - 1) * PITCH_JITTER;
}

/** Taxa final aplicada ao efeito: tom do combo × variação. */
export function playbackRate(combo: number, random: () => number = Math.random): number {
  return comboPitch(combo) * pitchJitter(random);
}
