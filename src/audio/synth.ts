/** Blocos de síntese (osciladores, ruído, envelopes, filtros). Uso interno de `sfx.ts`. */
export interface Voice {
  ctx: BaseAudioContext;
  out: AudioNode;
  /** Início (tempo do contexto). */
  t: number;
  /** Taxa de tom (combo × variação). */
  r: number;
  noise: AudioBuffer;
}

export interface ToneOpts {
  type?: OscillatorType;
  /** Frequência inicial e final (Hz, antes da taxa). */
  f: number;
  f2?: number;
  dur: number;
  gain: number;
  attack?: number;
  delay?: number;
  /** Filtro passa-baixa opcional (Hz). */
  lp?: number;
}

export interface NoiseOpts {
  dur: number;
  gain: number;
  filter: BiquadFilterType;
  /** Frequência do filtro, inicial e final (Hz, antes da taxa). */
  f: number;
  f2?: number;
  q?: number;
  attack?: number;
  delay?: number;
}

const FLOOR = 0.0001;

function envelope(ctx: BaseAudioContext, t: number, attack: number, dur: number, peak: number): GainNode {
  const g = ctx.createGain();
  g.gain.setValueAtTime(FLOOR, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(FLOOR, t + dur);
  return g;
}

export function tone(v: Voice, o: ToneOpts): number {
  const t = v.t + (o.delay ?? 0);
  const osc = v.ctx.createOscillator();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.f * v.r, t);
  if (o.f2 !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f2 * v.r), t + o.dur);
  const env = envelope(v.ctx, t, o.attack ?? 0.004, o.dur, o.gain);
  if (o.lp !== undefined) {
    const lp = v.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(o.lp * v.r, t);
    osc.connect(lp).connect(env);
  } else {
    osc.connect(env);
  }
  env.connect(v.out);
  osc.start(t);
  osc.stop(t + o.dur + 0.02);
  return (o.delay ?? 0) + o.dur;
}

export function noise(v: Voice, o: NoiseOpts): number {
  const t = v.t + (o.delay ?? 0);
  const src = v.ctx.createBufferSource();
  src.buffer = v.noise;
  src.playbackRate.setValueAtTime(v.r, t);
  const flt = v.ctx.createBiquadFilter();
  flt.type = o.filter;
  flt.Q.setValueAtTime(o.q ?? 1, t);
  flt.frequency.setValueAtTime(o.f * v.r, t);
  if (o.f2 !== undefined) flt.frequency.exponentialRampToValueAtTime(Math.max(1, o.f2 * v.r), t + o.dur);
  const env = envelope(v.ctx, t, o.attack ?? 0.003, o.dur, o.gain);
  src.connect(flt).connect(env).connect(v.out);
  src.start(t, Math.random() * 0.5);
  src.stop(t + o.dur + 0.02);
  return (o.delay ?? 0) + o.dur;
}

/** Arpejo: notas em sequência (Hz), cada uma com `step` s de distância. */
export function arp(v: Voice, notes: readonly number[], step: number, o: Omit<ToneOpts, 'f' | 'delay'>): number {
  let end = 0;
  notes.forEach((f, i) => {
    end = Math.max(end, tone(v, { ...o, f, delay: i * step }));
  });
  return end;
}

/** 1 s de ruído branco, criado uma vez por contexto. */
export function makeNoise(ctx: BaseAudioContext): AudioBuffer {
  const len = Math.floor(ctx.sampleRate);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}
