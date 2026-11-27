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
  private cap: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cap = capacity;
  }

  /** Teto de vivos (≤ capacidade). Baixar o teto descarta os excedentes. */
  get limit(): number {
    return this.cap;
  }

  set limit(n: number) {
    this.cap = Math.max(1, Math.min(this.capacity, Math.floor(n)));
    if (this.count > this.cap) this.count = this.cap;
    if (this.cursor >= this.cap) this.cursor = 0;
  }

  /** Índice para um novo efeito. */
  protected alloc(): number {
    if (this.count < this.cap) return this.count++;
    const i = this.cursor;
    this.cursor = (this.cursor + 1) % this.cap;
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

// ---------- Partículas (faíscas, fogo, elétrico, espectral, morte) ----------
/** Vida e alfa do slice: 14..24 frames, alfa = min(1, vida/12). */
const PART_LIFE_MIN = 14;
const PART_LIFE_RAND = 10;
const PART_FADE = 12;

/** Tipo de partícula: muda arrasto, gravidade, tamanho e vida (decisão 41). */
export const PART = { spark: 0, fire: 1, electric: 2, spectral: 3, death: 4 } as const;
export type PartKind = (typeof PART)[keyof typeof PART];

interface KindSpec {
  /** Fração da velocidade mantida por frame. */
  readonly drag: number;
  /** px/frame² (negativo sobe). */
  readonly grav: number;
  /** Tamanho base (px) e variação aleatória. */
  readonly size: number;
  readonly sizeRand: number;
  /** Multiplicador da vida. */
  readonly life: number;
  /** Encolhe com a vida (1) ou mantém (0). */
  readonly shrink: number;
}

export const PART_SPEC: readonly KindSpec[] = [
  { drag: 0.9, grav: 0.05, size: 3, sizeRand: 2, life: 1, shrink: 1 },
  { drag: 0.9, grav: -0.07, size: 5, sizeRand: 4, life: 1.15, shrink: 0 },
  { drag: 0.8, grav: 0, size: 2.5, sizeRand: 1.5, life: 0.6, shrink: 1 },
  { drag: 0.93, grav: -0.04, size: 4, sizeRand: 3, life: 1.3, shrink: 0 },
  { drag: 0.91, grav: 0.08, size: 3.5, sizeRand: 2.5, life: 1.2, shrink: 1 },
];

export class ParticlePool extends DensePool {
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly vx: Float32Array;
  readonly vy: Float32Array;
  readonly life: Float32Array;
  readonly life0: Float32Array;
  readonly size: Float32Array;
  readonly color: Uint32Array;
  readonly kind: Uint8Array;

  constructor(capacity: number) {
    super(capacity);
    this.x = new Float32Array(capacity);
    this.y = new Float32Array(capacity);
    this.vx = new Float32Array(capacity);
    this.vy = new Float32Array(capacity);
    this.life = new Float32Array(capacity);
    this.life0 = new Float32Array(capacity);
    this.size = new Float32Array(capacity);
    this.color = new Uint32Array(capacity);
    this.kind = new Uint8Array(capacity);
  }

  spawn(x: number, y: number, vx: number, vy: number, life: number, color: number, kind: PartKind = PART.spark, size = 3): void {
    const i = this.alloc();
    this.x[i] = x;
    this.y[i] = y;
    this.vx[i] = vx;
    this.vy[i] = vy;
    this.life[i] = life;
    this.life0[i] = life;
    this.size[i] = size;
    this.color[i] = color;
    this.kind[i] = kind;
  }

  /** Rajada radial do slice: ângulo uniforme, velocidade 1..1+speed; vida e tamanho pelo tipo. */
  burst(x: number, y: number, color: number, n: number, speed: number, rng: RandomSource, kind: PartKind = PART.spark): void {
    const k = PART_SPEC[kind]!;
    for (let j = 0; j < n; j++) {
      const a = rng.next() * Math.PI * 2;
      const v = 1 + rng.next() * speed;
      const life = (PART_LIFE_MIN + rng.next() * PART_LIFE_RAND) * k.life;
      this.spawn(x, y, Math.cos(a) * v, Math.sin(a) * v, life, color, kind, k.size + rng.next() * k.sizeRand);
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
      const k = PART_SPEC[this.kind[i]!]!;
      let x = this.x[i]!;
      let y = this.y[i]!;
      let vx = this.vx[i]!;
      let vy = this.vy[i]!;
      for (let f = 0; f < frames; f++) {
        x += vx;
        y += vy;
        vx *= k.drag;
        vy = vy * k.drag + k.grav;
      }
      this.x[i] = x;
      this.y[i] = y;
      this.vx[i] = vx;
      this.vy[i] = vy;
    }
  }

  alpha(i: number): number {
    return Math.min(1, this.life[i]! / PART_FADE);
  }

  /** Tamanho desenhado: encolhe até 35% com a vida nos tipos que encolhem. */
  drawSize(i: number): number {
    const k = PART_SPEC[this.kind[i]!]!;
    if (!k.shrink) return this.size[i]!;
    const t = this.life[i]! / (this.life0[i]! || 1);
    return this.size[i]! * (0.35 + 0.65 * t);
  }

  protected move(from: number, to: number): void {
    this.x[to] = this.x[from]!;
    this.y[to] = this.y[from]!;
    this.vx[to] = this.vx[from]!;
    this.vy[to] = this.vy[from]!;
    this.life[to] = this.life[from]!;
    this.life0[to] = this.life0[from]!;
    this.size[to] = this.size[from]!;
    this.color[to] = this.color[from]!;
    this.kind[to] = this.kind[from]!;
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
