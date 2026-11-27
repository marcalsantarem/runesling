import { describe, expect, it, vi } from 'vitest';
import { AudioEngine, PITCH_JITTER, PITCH_MAX, SFX_KEYS, UNLOCK_EVENTS, comboPitch, playbackRate } from '../../src/audio';
import { SFX } from '../../src/audio/sfx';
import { fakeFactory } from './fakeAudio';

function ready(random = () => 0.5) {
  const f = fakeFactory();
  const eng = new AudioEngine({ createContext: f.createContext, random });
  eng.unlock();
  return { ...f, eng };
}

describe('pitch pelo combo (GDD §6.3)', () => {
  it('p(c) = min(1.45, 1 + 0.03c)', () => {
    expect(comboPitch(0)).toBe(1);
    expect(comboPitch(5)).toBeCloseTo(1.15);
    expect(comboPitch(15)).toBeCloseTo(1.45);
    expect(comboPitch(40)).toBe(PITCH_MAX);
    expect(comboPitch(-3)).toBe(1);
    expect(comboPitch(Number.NaN)).toBe(1);
  });

  it('variação fica dentro de ±8%', () => {
    for (let i = 0; i < 2000; i++) {
      const r = playbackRate(10);
      expect(r).toBeGreaterThanOrEqual(comboPitch(10) * (1 - PITCH_JITTER) - 1e-9);
      expect(r).toBeLessThanOrEqual(comboPitch(10) * (1 + PITCH_JITTER) + 1e-9);
    }
    expect(playbackRate(0, () => 0)).toBeCloseTo(0.92);
    expect(playbackRate(0, () => 0.999999)).toBeCloseTo(1.08);
  });

  it('play aplica combo + variação nas frequências', () => {
    const { eng, ctx } = ready(() => 0.5);
    expect(eng.play('impact', { combo: 15 })).toBeCloseTo(1.45);
    const f0 = ctx.oscillators[0]!.frequency.calls[0]![1];
    expect(f0).toBeCloseTo(659.25 * 1.45, 1);
    // efeito sem combo ignora o combo mas mantém a variação
    const r = eng.play('explosion', { combo: 15 });
    expect(r).toBe(1);
  });
});

describe('destrave no 1º gesto', () => {
  it('não cria contexto nem toca antes do gesto', () => {
    const f = fakeFactory();
    const eng = new AudioEngine({ createContext: f.createContext });
    expect(eng.play('impact')).toBeNull();
    expect(f.created()).toBe(0);
    expect(eng.unlocked).toBe(false);
  });

  it('attachUnlock destrava no 1º gesto e remove os ouvintes', () => {
    const f = fakeFactory();
    const eng = new AudioEngine({ createContext: f.createContext });
    const target = new EventTarget();
    const remove = vi.spyOn(target, 'removeEventListener');
    eng.attachUnlock(target);
    expect(f.created()).toBe(0);
    target.dispatchEvent(new Event('pointerdown'));
    expect(f.created()).toBe(1);
    expect(eng.unlocked).toBe(true);
    expect(remove).toHaveBeenCalledTimes(UNLOCK_EVENTS.length);
    target.dispatchEvent(new Event('keydown'));
    expect(f.created()).toBe(1);
    expect(eng.play('ui_tap')).not.toBeNull();
  });

  it('mantém os ouvintes enquanto o contexto não roda', () => {
    const f = fakeFactory();
    f.ctx.autoRun = false;
    const eng = new AudioEngine({ createContext: f.createContext });
    const target = new EventTarget();
    eng.attachUnlock(target);
    target.dispatchEvent(new Event('touchend'));
    expect(eng.unlocked).toBe(false);
    expect(eng.play('impact')).toBeNull();
    f.ctx.autoRun = true;
    target.dispatchEvent(new Event('mousedown'));
    expect(f.ctx.resumeCalls).toBe(2);
    expect(f.created()).toBe(1);
    expect(eng.unlocked).toBe(true);
  });

  it('sem Web Audio: no-op sem erro', () => {
    const eng = new AudioEngine({ createContext: () => null });
    const target = new EventTarget();
    eng.attachUnlock(target);
    expect(() => target.dispatchEvent(new Event('pointerdown'))).not.toThrow();
    expect(eng.supported).toBe(false);
    expect(eng.play('victory')).toBeNull();
    expect(() => eng.setVolume(0.5)).not.toThrow();
  });

  it('sem AudioContext global (node): no-op', () => {
    const eng = new AudioEngine();
    expect(() => eng.unlock()).not.toThrow();
    expect(eng.play('impact')).toBeNull();
  });
});

describe('volume e mudo', () => {
  it('volume é limitado a 0–1 e vai para o bus', () => {
    const { eng, ctx } = ready();
    const bus = ctx.gains[0]!;
    eng.setVolume(2);
    expect(eng.volume).toBe(1);
    eng.setVolume(-1);
    expect(eng.volume).toBe(0);
    expect(bus.gain.value).toBe(0);
    eng.setVolume(0.5);
    expect(bus.gain.value).toBeCloseTo(0.4);
  });

  it('mudo zera o bus e não toca; desmutar volta', () => {
    const { eng, ctx } = ready();
    eng.setMuted(true);
    expect(ctx.gains[0]!.gain.value).toBe(0);
    expect(eng.play('impact')).toBeNull();
    eng.setMuted(false);
    expect(ctx.gains[0]!.gain.value).toBeGreaterThan(0);
    expect(eng.play('impact')).not.toBeNull();
  });

  it('volume/mudo definidos antes do destrave valem depois', () => {
    const f = fakeFactory();
    const eng = new AudioEngine({ createContext: f.createContext });
    eng.setVolume(0.25);
    eng.unlock();
    expect(f.ctx.gains[0]!.gain.value).toBeCloseTo(0.2);
  });
});

describe('limite de vozes', () => {
  it('respeita o limite por efeito e libera com o tempo', () => {
    const { eng, ctx } = ready();
    const limit = SFX.impact.voices;
    for (let i = 0; i < limit; i++) expect(eng.play('impact')).not.toBeNull();
    expect(eng.play('impact')).toBeNull();
    expect(eng.voices('impact')).toBe(limit);
    expect(eng.play('ui_tap')).not.toBeNull(); // outro efeito ainda toca
    ctx.currentTime += 2;
    expect(eng.voices('impact')).toBe(0);
    expect(eng.play('impact')).not.toBeNull();
  });

  it('respeita o limite global', () => {
    const f = fakeFactory();
    const eng = new AudioEngine({ createContext: f.createContext, maxVoices: 3 });
    eng.unlock();
    expect(eng.play('impact')).not.toBeNull();
    expect(eng.play('wall')).not.toBeNull();
    expect(eng.play('kill')).not.toBeNull();
    expect(eng.play('crit')).toBeNull();
  });
});

describe('catálogo', () => {
  it('todas as chaves tocam, curtas, com pan', () => {
    for (const k of SFX_KEYS) {
      const { eng } = ready();
      expect(eng.play(k, { combo: 3, pan: -0.5 }), k).not.toBeNull();
    }
    expect(SFX_KEYS).toHaveLength(18);
    for (const k of SFX_KEYS) {
      const { ctx } = fakeFactory();
      const dur = SFX[k].build({ ctx: ctx as never, out: ctx.destination as never, t: 0, r: 1, noise: {} as never });
      expect(dur, k).toBeGreaterThan(0);
      expect(dur, k).toBeLessThanOrEqual(1.7);
    }
  });
});
