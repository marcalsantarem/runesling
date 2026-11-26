import { describe, expect, it, vi } from 'vitest';
import html from '../../index.html?raw';
import { FONT_TITLE, FONT_UI, FONT_WEIGHTS, fontDescriptors, waitForFonts } from '../../src/core/fonts';
import pkg from '../../package.json';

function fakeFonts(load: () => Promise<unknown>) {
  return { load: vi.fn(load), ready: Promise.resolve() } as unknown as Pick<FontFaceSet, 'load' | 'ready'>;
}

describe('fontes', () => {
  it('exporta as famílias do GDD', () => {
    expect(FONT_TITLE).toBe('Cinzel');
    expect(FONT_UI).toBe('Plus Jakarta Sans');
    expect(fontDescriptors()).toHaveLength(5);
  });

  it('index.html declara um @font-face .woff2 latin por peso empacotado', () => {
    for (const [family, weights] of Object.entries(FONT_WEIGHTS)) {
      for (const w of weights) {
        const re = new RegExp(`font-family: '${family}';[^}]*font-weight: ${w};[^}]*latin-${w}-normal\\.woff2`);
        expect(html).toMatch(re);
      }
    }
    expect(html).not.toMatch(/\.woff'\)/);
  });

  it('pacotes @fontsource com versão fixa', () => {
    const deps: Record<string, string> = pkg.dependencies;
    expect(deps['@fontsource/cinzel']).toMatch(/^\d+\.\d+\.\d+$/);
    expect(deps['@fontsource/plus-jakarta-sans']).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('waitForFonts resolve true quando carrega', async () => {
    const fonts = fakeFonts(() => Promise.resolve([]));
    await expect(waitForFonts(fonts, 1000)).resolves.toBe(true);
    expect(fonts.load).toHaveBeenCalledTimes(5);
  });

  it('waitForFonts resolve false em timeout, erro ou sem document', async () => {
    await expect(waitForFonts(fakeFonts(() => new Promise(() => {})), 10)).resolves.toBe(false);
    await expect(waitForFonts(fakeFonts(() => Promise.reject(new Error('x'))), 1000)).resolves.toBe(false);
    await expect(waitForFonts(undefined, 10)).resolves.toBe(false);
  });

  it('#ui-root cobre o canvas sem capturar toque', () => {
    expect(html).toMatch(/#ui-root \{[^}]*inset: 0;[^}]*pointer-events: none;/);
  });
});
