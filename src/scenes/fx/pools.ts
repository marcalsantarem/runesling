/**
 * Pools de efeitos com capacidade fixa (struct-of-arrays): nada é alocado depois da construção.
 * Pool cheio sobrescreve um slot em rodízio (o efeito mais antigo some primeiro, em média).
 * Lógica pura, sem Phaser; o desenho fica em FxLayer.
 */
import type { RandomSource } from '../../match/rng';

/** Base com remoção por troca com o último (iteração densa em [0, count)). */
abstract class DensePool {
  readonly capacity: number;
  count = 0;
  private cursor = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  /** Índice para um novo efeito. */
  protected alloc(): number {
    if (this.count < this.capacity) return this.count++;
    const i = this.cursor;
    this.cursor = (this.cursor + 1) % this.capacity;
    return i;
  }

  protected abstract move(from: number, to: number): void;

  protected remove(i: number): void {
    const last = --this.count;
    if (i !== last) this.move(last, i);
  }

  clear(): void {
    this.count = 0;
    this.cursor = 0;
  }
}

// ---------- Partículas (faíscas, explosão, morte) ----------
/** Vida e alfa do slice: 14..24 frames, alfa = min(1, vida/12). */
const PART_LIFE_MIN = 14;
const PART_LIFE_RAND = 10;
const PART_FADE = 12;

export class ParticlePool extends DensePool {
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly vx: Float32Array;
  readonly vy: Float32Array;
  readonly life: Float32Array;
  readonly color: Uint32Array;

  constructor(capacity: number) {
    super(capacity);
    this.x = new Float32Array(capacity);
    this.y = new Float32Array(capacity);
    this.vx = new Float32Array(capacity);
    this.vy = new Float32Array(capacity);
    this.life = new Float32Array(capacity);
    this.color = new Uint32Array(capacity);
  }

  spawn(x: number, y: number, vx: number, vy: number, life: number, color: number): void {
    const i = this.alloc();
    this.x[i] = x;
    this.y[i] = y;
    this.vx[i] = vx;
    this.vy[i] = vy;
    this.life[i] = life;
    this.color[i] = color;
  }

  /** Rajada radial do slice: ângulo uniforme, velocidade 1..1+speed. */
  burst(x: number, y: number, color: number, n: number, speed: number, rng: RandomSource): void {
    for (let k = 0; k < n; k++) {
      const a = rng.next() * Math.PI * 2;
      const v = 1 + rng.next() * speed;
      this.spawn(x, y, Math.cos(a) * v, Math.sin(a) * v, PART_LIFE_MIN + rng.next() * PART_LIFE_RAND, color);
    }
  }

  step(frames: number): void {
    if (frames <= 0) return;
    for (let i = this.count - 1; i >= 0; i--) {
      const l = this.life[i]! - frames;
      if (l <= 0) {
        this.remove(i);
        continue;
      }
      this.life[i] = l;
      this.x[i] = this.x[i]! + this.vx[i]! * frames;
      this.y[i] = this.y[i]! + this.vy[i]! * frames;
    }
  }

  alpha(i: number): number {
    return Math.min(1, this.life[i]! / PART_FADE);
  }

  protected move(from: number, to: number): void {
    this.x[to] = this.x[from]!;
    this.y[to] = this.y[from]!;
    this.vx[to] = this.vx[from]!;
    this.vy[to] = this.vy[from]!;
    this.life[to] = this.life[from]!;
    this.color[to] = this.color[from]!;
  }
}

// ---------- Ondas (anel de explosão/choque) ----------
/** Raio avança 25% do restante por frame; alfa = vida/16 (slice). */
const WAVE_GROW = 0.25;
const WAVE_FADE = 16;

export class WavePool extends DensePool {
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly r: Float32Array;
  readonly maxR: Float32Array;
  readonly life: Float32Array;
  readonly color: Uint32Array;

  constructor(capacity: number) {
    super(capacity);
    this.x = new Float32Array(capacity);
    this.y = new Float32Array(capacity);
    this.r = new Float32Array(capacity);
    this.maxR = new Float32Array(capacity);
    this.life = new Float32Array(capacity);
    this.color = new Uint32Array(capacity);
  }

  spawn(x: number, y: number, r0: number, maxR: number, life: number, color: number): void {
    const i = this.alloc();
    this.x[i] = x;
    this.y[i] = y;
    this.r[i] = r0;
    this.maxR[i] = maxR;
    this.life[i] = life;
    this.color[i] = color;
  }

  step(frames: number): void {
    if (frames <= 0) return;
    const keep = Math.pow(1 - WAVE_GROW, frames);
    for (let i = this.count - 1; i >= 0; i--) {
      const l = this.life[i]! - frames;
      if (l <= 0) {
        this.remove(i);
        continue;
      }
      this.life[i] = l;
      const m = this.maxR[i]!;
      this.r[i] = m - (m - this.r[i]!) * keep;
    }
  }

  alpha(i: number): number {
    return Math.min(1, this.life[i]! / WAVE_FADE);
  }

  protected move(from: number, to: number): void {
    this.x[to] = this.x[from]!;
    this.y[to] = this.y[from]!;
    this.r[to] = this.r[from]!;
    this.maxR[to] = this.maxR[from]!;
    this.life[to] = this.life[from]!;
    this.color[to] = this.color[from]!;
  }
}

// ---------- Feixes (Raio em Cadeia, tiro do atirador, cura) ----------
const BEAM_FADE = 10;

export class BeamPool extends DensePool {
  readonly x1: Float32Array;
  readonly y1: Float32Array;
  readonly x2: Float32Array;
  readonly y2: Float32Array;
  readonly life: Float32Array;
  readonly color: Uint32Array;
  /** 1 = zigue-zague (raio). */
  readonly zig: Uint8Array;

  constructor(capacity: number) {
    super(capacity);
    this.x1 = new Float32Array(capacity);
    this.y1 = new Float32Array(capacity);
    this.x2 = new Float32Array(capacity);
    this.y2 = new Float32Array(capacity);
    this.life = new Float32Array(capacity);
    this.color = new Uint32Array(capacity);
    this.zig = new Uint8Array(capacity);
  }

  spawn(x1: number, y1: number, x2: number, y2: number, life: number, color: number, zig: boolean): void {
    const i = this.alloc();
    this.x1[i] = x1;
    this.y1[i] = y1;
    this.x2[i] = x2;
    this.y2[i] = y2;
    this.life[i] = life;
    this.color[i] = color;
    this.zig[i] = zig ? 1 : 0;
  }

  step(frames: number): void {
    if (frames <= 0) return;
    for (let i = this.count - 1; i >= 0; i--) {
      const l = this.life[i]! - frames;
      if (l <= 0) this.remove(i);
      else this.life[i] = l;
    }
  }

  alpha(i: number): number {
    return Math.min(1, this.life[i]! / BEAM_FADE);
  }

  protected move(from: number, to: number): void {
    this.x1[to] = this.x1[from]!;
    this.y1[to] = this.y1[from]!;
    this.x2[to] = this.x2[from]!;
    this.y2[to] = this.y2[from]!;
    this.life[to] = this.life[from]!;
    this.color[to] = this.color[from]!;
    this.zig[to] = this.zig[from]!;
  }
}

// ---------- Números flutuantes ----------
/** Slice: sobe 0.9 px/frame por 28 frames; alfa = min(1, vida/10). */
const FLOAT_LIFE = 28;
const FLOAT_RISE = 0.9;
const FLOAT_FADE = 10;

/**
 * Slots fixos (sem troca): cada slot corresponde a um objeto de texto do renderizador.
 * `version` muda a cada spawn para o renderizador refazer texto/estilo só quando preciso.
 */
export class FloatTextPool {
  readonly capacity: number;
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly life: Float32Array;
  readonly size: Float32Array;
  readonly color: Uint32Array;
  readonly version: Uint32Array;
  readonly text: string[];
  /** Slots vivos. */
  active = 0;
  private cursor = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.x = new Float32Array(capacity);
    this.y = new Float32Array(capacity);
    this.life = new Float32Array(capacity);
    this.size = new Float32Array(capacity);
    this.color = new Uint32Array(capacity);
    this.version = new Uint32Array(capacity);
    this.text = new Array<string>(capacity).fill('');
  }

  /** Usa o primeiro slot livre a partir do cursor; se todos vivos, sobrescreve o do cursor. Devolve o slot. */
  spawn(x: number, y: number, text: string, color: number, size: number): number {
    const n = this.capacity;
    let i = this.cursor;
    for (let k = 0; k < n; k++) {
      const j = (this.cursor + k) % n;
      if (this.life[j]! <= 0) {
        i = j;
        break;
      }
    }
    this.cursor = (i + 1) % n;
    if (this.life[i]! <= 0) this.active++;
    this.x[i] = x;
    this.y[i] = y;
    this.life[i] = FLOAT_LIFE;
    this.size[i] = size;
    this.color[i] = color;
    this.text[i] = text;
    this.version[i] = this.version[i]! + 1;
    return i;
  }

  step(frames: number): void {
    if (frames <= 0 || this.active === 0) return;
    for (let i = 0; i < this.capacity; i++) {
      const l = this.life[i]!;
      if (l <= 0) continue;
      const nl = l - frames;
      this.life[i] = nl;
      this.y[i] = this.y[i]! - FLOAT_RISE * frames;
      if (nl <= 0) this.active--;
    }
  }

  alive(i: number): boolean {
    return this.life[i]! > 0;
  }

  alpha(i: number): number {
    return Math.max(0, Math.min(1, this.life[i]! / FLOAT_FADE));
  }

  clear(): void {
    this.life.fill(0);
    this.active = 0;
    this.cursor = 0;
  }
}
