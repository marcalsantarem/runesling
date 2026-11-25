/**
 * RNG determinístico com semente (mulberry32). Toda aleatoriedade da física passa por aqui.
 */
export interface RandomSource {
  /** Número em [0, 1). */
  next(): number;
}

export class Rng implements RandomSource {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Número em [min, max). */
  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  /** +1 ou -1 com probabilidade igual. */
  sign(): 1 | -1 {
    return this.next() > 0.5 ? 1 : -1;
  }

  /** Estado interno (para salvar/restaurar a run). */
  getState(): number {
    return this.state;
  }

  setState(state: number): void {
    this.state = state >>> 0;
  }
}
