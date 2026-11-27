import { comboPitch, pitchJitter } from './pitch';
import { SFX, type SfxKey } from './sfx';
import { makeNoise, type Voice } from './synth';

export interface PlayOptions {
  /** Combo do turno: sobe o tom (GDD §6.3). */
  combo?: number;
  /** Panorâmica estéreo, -1 (esquerda) a 1 (direita). */
  pan?: number;
}

export interface AudioEngineOptions {
  /** Fábrica do contexto; padrão: `AudioContext` do navegador (null se não existir). */
  createContext?: () => AudioContext | null;
  /** Gerador aleatório [0, 1) para a variação de ±8%. */
  random?: () => number;
  /** Limite global de vozes simultâneas (todos os efeitos). */
  maxVoices?: number;
}

/** Eventos de gesto que destravam o áudio (política de autoplay do iOS/Chrome). */
export const UNLOCK_EVENTS = ['pointerdown', 'touchend', 'mousedown', 'keydown'] as const;

function defaultContext(): AudioContext | null {
  const g = globalThis as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  const Ctor = g.AudioContext ?? g.webkitAudioContext;
  if (!Ctor) return null;
  try {
    return new Ctor();
  } catch {
    return null;
  }
}

const clamp01 = (x: number): number => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);

/**
 * Motor de efeitos sintetizados (decisão 39). Nada toca antes do 1º gesto do jogador:
 * o contexto só é criado em `unlock()`, chamado pelos ouvintes de `attachUnlock()`.
 * Sem Web Audio, todas as chamadas viram no-op.
 */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private bus: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private readonly active = new Map<SfxKey, number[]>();
  private volumeValue = 1;
  private mutedValue = false;
  private failed = false;
  private detach: (() => void) | null = null;
  private readonly createContext: () => AudioContext | null;
  private readonly random: () => number;
  private readonly maxVoices: number;

  constructor(opts: AudioEngineOptions = {}) {
    this.createContext = opts.createContext ?? defaultContext;
    this.random = opts.random ?? Math.random;
    this.maxVoices = opts.maxVoices ?? 16;
  }

  /** Destravado: contexto criado e rodando. */
  get unlocked(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  /** Web Audio disponível (false só depois de uma tentativa falha). */
  get supported(): boolean {
    return !this.failed;
  }

  get volume(): number {
    return this.volumeValue;
  }

  get muted(): boolean {
    return this.mutedValue;
  }

  /** Volume mestre dos efeitos, 0–1 (decisão 42). */
  setVolume(v: number): void {
    this.volumeValue = clamp01(v);
    this.applyGain();
  }

  /** Som liga/desliga (decisão 42). */
  setMuted(m: boolean): void {
    this.mutedValue = m;
    this.applyGain();
  }

  /** Liga o destrave ao 1º gesto em `target` (padrão: `window`). Idempotente; retorna o desligamento. */
  attachUnlock(target: EventTarget | undefined = globalThis.window): () => void {
    if (this.detach) return this.detach;
    if (!target) return () => {};
    const handler = (): void => {
      this.unlock();
      if (this.unlocked || this.failed) this.detach?.();
    };
    for (const e of UNLOCK_EVENTS) target.addEventListener(e, handler, { capture: true, passive: true });
    this.detach = () => {
      for (const e of UNLOCK_EVENTS) target.removeEventListener(e, handler, { capture: true });
      this.detach = null;
    };
    return this.detach;
  }

  /** Cria/retoma o contexto. Deve ser chamado dentro de um gesto do usuário. */
  unlock(): void {
    if (this.failed) return;
    if (!this.ctx) {
      const ctx = this.createContext();
      if (!ctx) {
        this.failed = true;
        return;
      }
      this.ctx = ctx;
      this.build(ctx);
    }
    const ctx = this.ctx;
    if (ctx.state !== 'running') {
      void ctx.resume().catch(() => {});
      // iOS: tocar um buffer mudo dentro do gesto destrava a saída.
      try {
        const src = ctx.createBufferSource();
        src.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
        src.connect(ctx.destination);
        src.start(0);
      } catch {
        /* ignora */
      }
    }
  }

  /**
   * Toca um efeito. Retorna a taxa de tom aplicada, ou null se não tocou
   * (antes do destrave, mudo, sem Web Audio ou limite de vozes).
   */
  play(key: SfxKey, opts: PlayOptions = {}): number | null {
    const ctx = this.ctx;
    const def = SFX[key];
    if (!ctx || !this.bus || !this.noiseBuf || !def || ctx.state !== 'running') return null;
    if (this.mutedValue || this.volumeValue <= 0) return null;
    const now = ctx.currentTime;
    if (!this.reserve(key, def.voices, now)) return null;

    const rate = (def.combo ? comboPitch(opts.combo ?? 0) : 1) * pitchJitter(this.random);
    let out: AudioNode = this.bus;
    const pan = opts.pan ?? 0;
    if (pan !== 0 && typeof ctx.createStereoPanner === 'function') {
      const p = ctx.createStereoPanner();
      p.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
      p.connect(this.bus);
      out = p;
    }
    const voice: Voice = { ctx, out, t: now + 0.005, r: rate, noise: this.noiseBuf };
    let dur = 0.1;
    try {
      dur = def.build(voice);
    } catch {
      /* contexto fechado/inválido: não derruba o jogo */
    }
    this.active.get(key)?.push(now + dur + 0.03);
    return rate;
  }

  /** Vozes ativas de um efeito (para testes/depuração). */
  voices(key: SfxKey): number {
    const now = this.ctx?.currentTime ?? 0;
    return (this.active.get(key) ?? []).filter((end) => end > now).length;
  }

  private reserve(key: SfxKey, limit: number, now: number): boolean {
    let total = 0;
    for (const [k, ends] of this.active) {
      const alive = ends.filter((end) => end > now);
      this.active.set(k, alive);
      total += alive.length;
    }
    const mine = this.active.get(key) ?? [];
    this.active.set(key, mine);
    return mine.length < limit && total < this.maxVoices;
  }

  private build(ctx: AudioContext): void {
    // vozes → bus (volume/mudo) → compressor/limiter → saída
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 6;
    comp.ratio.value = 12;
    comp.attack.value = 0.003;
    comp.release.value = 0.15;
    comp.connect(ctx.destination);
    const bus = ctx.createGain();
    bus.connect(comp);
    this.bus = bus;
    this.noiseBuf = makeNoise(ctx);
    this.applyGain();
  }

  private applyGain(): void {
    if (!this.bus) return;
    this.bus.gain.value = this.mutedValue ? 0 : this.volumeValue * 0.8;
  }
}
