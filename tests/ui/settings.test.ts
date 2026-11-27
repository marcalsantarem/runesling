// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PROFILE_SAVE_VERSION } from '../../src/meta/profile';
import { flush, MemoryStorage, setup, type Harness } from './helpers';

let h: Harness;
afterEach(() => {
  h?.ui.destroy();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function inRun(): Promise<void> {
  h = await setup();
  h.bus.emit('app:ready', {});
  h.click('menu-play');
}

function slide(key: string, pct: number, release = true): void {
  const r = h.q<HTMLInputElement>(key);
  r.value = String(pct);
  r.dispatchEvent(new Event('input', { bubbles: true }));
  if (release) r.dispatchEvent(new Event('change', { bubbles: true }));
}

describe('sons da UI (T-046)', () => {
  it('liga o destrave uma vez e aplica mudo/volume do perfil ao montar', async () => {
    const storage = new MemoryStorage();
    storage.items.set('test.ui', {
      version: PROFILE_SAVE_VERSION,
      savedAt: 0,
      data: { settings: { muted: true, sfxVolume: 0.4, reducedMotion: 'off' } },
    });
    h = await setup({ storage });
    expect(h.audio.unlockAttached).toBe(1);
    expect(h.audio.muted).toBe(true);
    expect(h.audio.volume).toBe(0.4);
  });

  it('botões tocam ui_tap; voltar/cancelar tocam ui_back; um som por clique', async () => {
    h = await setup();
    h.bus.emit('app:ready', {});
    h.click('nav-talents');
    h.click('talents-back');
    h.click('menu-settings');
    h.click('settings-close');
    expect(h.audio.played).toEqual(['ui_tap', 'ui_back', 'ui_tap', 'ui_back']);
  });

  it('Draft: draft_open ao abrir e um só pick ao escolher', async () => {
    await inRun();
    h.audio.played.length = 0;
    vi.useFakeTimers();
    h.bus.emit('draft:open', { choices: ['fire_splash', 'ghost_ball', 'power_surge'] });
    const card = h.q('modal-draft').querySelector<HTMLButtonElement>('.rs-draft-card');
    card?.click();
    card?.click();
    expect(h.audio.played).toEqual(['draft_open', 'pick']);
  });

  it('Fim de run: victory ou defeat', async () => {
    await inRun();
    h.audio.played.length = 0;
    h.bus.emit('run:ended', { won: true, wave: 15, goldEarned: 10 });
    h.click('end-again');
    h.bus.emit('run:ended', { won: false, wave: 3, goldEarned: 1 });
    expect(h.audio.played).toEqual(['victory', 'ui_tap', 'defeat']);
  });

  it('som: desligar não toca nada; religar toca um ui_tap', async () => {
    await inRun();
    h.click('hud-pause');
    h.audio.played.length = 0;
    h.click('pause-sound');
    expect(h.audio.muted).toBe(true);
    expect(h.audio.played).toEqual([]);
    h.click('pause-sound');
    expect(h.audio.muted).toBe(false);
    expect(h.audio.played).toEqual(['ui_tap']);
  });
});

describe('configurações (T-049)', () => {
  it('volume: arrastar aplica no áudio; soltar grava e toca a prévia', async () => {
    h = await setup();
    h.bus.emit('app:ready', {});
    h.click('menu-settings');
    expect(h.q<HTMLInputElement>('settings-volume').value).toBe('80');
    expect(h.q('settings-volume-value').textContent).toBe('80%');
    h.audio.played.length = 0;
    slide('settings-volume', 35, false);
    expect(h.audio.volume).toBeCloseTo(0.35);
    expect(h.profile.data().settings.sfxVolume).toBe(0.8);
    expect(h.audio.played).toEqual([]);
    slide('settings-volume', 35);
    expect(h.profile.data().settings.sfxVolume).toBeCloseTo(0.35);
    expect(h.audio.played).toEqual(['ui_tap']);
    expect(h.q('settings-volume-value').textContent).toBe('35%');
    // A Pausa mostra o mesmo valor.
    expect(h.q<HTMLInputElement>('pause-volume').value).toBe('35');
  });

  it('Reduzir movimento: 3 opções, uma marcada, grava no perfil', async () => {
    h = await setup();
    h.bus.emit('app:ready', {});
    const pressed = () =>
      (['system', 'on', 'off'] as const).filter((p) => h.q(`settings-motion-${p}`).getAttribute('aria-pressed') === 'true');
    expect(pressed()).toEqual(['system']);
    h.click('settings-motion-on');
    expect(h.profile.data().settings.reducedMotion).toBe('on');
    expect(pressed()).toEqual(['on']);
    expect(h.root.querySelector('.rs-ui')?.getAttribute('data-reduced-motion')).toBe('true');
  });

  it('settings:changed no início e a cada mudança, com o movimento efetivo', async () => {
    h = await setup();
    await flush();
    expect(h.settings).toEqual([{ muted: false, sfxVolume: 0.8, reducedMotion: false }]);
    h.click('settings-motion-on');
    h.click('settings-sound');
    expect(h.settings.slice(1)).toEqual([
      { muted: false, sfxVolume: 0.8, reducedMotion: true },
      { muted: true, sfxVolume: 0.8, reducedMotion: true },
    ]);
    // Mudança que não altera o efetivo (system sem preferência do sistema = off) não repete o aviso.
    h.click('settings-motion-off');
    h.click('settings-motion-system');
    expect(h.settings.at(-1)).toEqual({ muted: true, sfxVolume: 0.8, reducedMotion: false });
    expect(h.settings).toHaveLength(4);
    // app:ready reenvia para a cena que assinou depois.
    h.bus.emit('app:ready', {});
    expect(h.settings).toHaveLength(5);
  });

  it('system segue prefers-reduced-motion do sistema', async () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    h = await setup();
    expect(h.settings.at(-1)?.reducedMotion).toBe(true);
    h.click('settings-motion-off');
    expect(h.settings.at(-1)?.reducedMotion).toBe(false);
    expect(h.root.querySelector('.rs-ui')?.getAttribute('data-reduced-motion')).toBe('false');
  });

  it('controles têm alvo de toque de 44 px no CSS', async () => {
    const css = readFileSync(join(__dirname, '../../src/styles/ui.css'), 'utf8');
    expect(css).toMatch(/\.rs-range \{[^}]*height: 44px/);
    expect(css).toMatch(/\.rs-seg \{[^}]*min-height: 44px/);
  });
});
