import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import {
  createReloadGuard,
  RELOAD_GUARD_KEY,
  RELOAD_GUARD_WINDOW_MS,
  scheduleUpdateChecks,
  UPDATE_CHECK_INTERVAL_MS,
  type GuardStorage,
} from '../../src/core/pwaUpdate';

function memStorage(): GuardStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

describe('createReloadGuard', () => {
  it('libera só a primeira recarga da página', () => {
    const guard = createReloadGuard(memStorage(), () => 1000);
    expect(guard()).toBe(true);
    expect(guard()).toBe(false);
  });

  it('bloqueia recarga logo após outra (sem loop entre reloads)', () => {
    const s = memStorage();
    expect(createReloadGuard(s, () => 1000)()).toBe(true);
    expect(s.data.get(RELOAD_GUARD_KEY)).toBe('1000');
    expect(createReloadGuard(s, () => 1000 + RELOAD_GUARD_WINDOW_MS - 1)()).toBe(false);
    expect(createReloadGuard(s, () => 1000 + RELOAD_GUARD_WINDOW_MS)()).toBe(true);
  });

  it('funciona sem storage ou com storage que lança erro', () => {
    expect(createReloadGuard(null)()).toBe(true);
    const broken: GuardStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => undefined,
    };
    const guard = createReloadGuard(broken);
    expect(guard()).toBe(true);
    expect(guard()).toBe(false);
  });
});

describe('scheduleUpdateChecks', () => {
  it('checa ao voltar ao primeiro plano e a cada ~60 min', () => {
    const update = vi.fn(() => Promise.resolve());
    let onVis: (() => void) | undefined;
    const doc = {
      visibilityState: 'hidden' as DocumentVisibilityState,
      addEventListener: (type: string, fn: () => void) => {
        if (type === 'visibilitychange') onVis = fn;
      },
    };
    let tick: (() => void) | undefined;
    let interval = 0;
    scheduleUpdateChecks({ update } as never, {
      doc: doc as never,
      setInterval: (fn, ms) => {
        tick = fn;
        interval = ms;
      },
    });
    expect(interval).toBe(UPDATE_CHECK_INTERVAL_MS);
    expect(UPDATE_CHECK_INTERVAL_MS).toBe(60 * 60 * 1000);
    onVis?.();
    expect(update).toHaveBeenCalledTimes(0);
    doc.visibilityState = 'visible';
    onVis?.();
    tick?.();
    expect(update).toHaveBeenCalledTimes(2);
  });

  it('ignora falha do update (offline)', () => {
    const update = vi.fn(() => Promise.reject(new Error('offline')));
    let tick: (() => void) | undefined;
    scheduleUpdateChecks({ update } as never, {
      doc: { visibilityState: 'visible', addEventListener: () => undefined } as never,
      setInterval: (fn) => (tick = fn),
    });
    expect(() => tick?.()).not.toThrow();
  });
});

describe('favicon (T-031)', () => {
  it('index.html aponta para public/favicon.ico, que é um ICO válido', () => {
    const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
    expect(html).toMatch(/<link rel="icon" href="favicon\.ico"/);
    const ico = readFileSync(new URL('../../public/favicon.ico', import.meta.url));
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBeGreaterThan(0);
  });
});
