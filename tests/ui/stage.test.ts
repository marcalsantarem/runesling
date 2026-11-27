// T-064: o jogo vive num palco de celular em retrato; a UI mede pelo palco, não pela janela.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import html from '../../index.html?raw';

const css = ['ui.css', 'ui-skin.css', 'tokens.css'].map((f) => readFileSync(join(__dirname, '../../src/styles', f), 'utf8'));
const uiCss = css[0] ?? '';

function rule(source: string, selector: string): string {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = source.match(new RegExp(`(?:^|[}\\n])\\s*${esc}\\s*\\{([^}]*)\\}`));
  expect(m, `regra ${selector}`).not.toBeNull();
  return m?.[1] ?? '';
}

describe('palco do jogo (#app)', () => {
  it('canvas e UI ficam dentro do palco', () => {
    expect(html).toMatch(/<div id="app">\s*<div id="game"><\/div>\s*<div id="ui-root"><\/div>\s*<\/div>/);
  });

  it('palco centrado, retrato no máx. 9:16, limitado a 480×1000 e container da UI', () => {
    const r = rule(html, '#app');
    expect(html).toContain('--rs-stage-max-w: 480px');
    expect(html).toContain('--rs-stage-max-h: 1000px');
    expect(r).toMatch(/inset: 0; margin: auto/);
    expect(r).toContain('width: min(100%, calc(100dvh * 9 / 16), var(--rs-stage-max-w))');
    expect(r).toContain('height: min(100%, var(--rs-stage-max-h))');
    expect(r).toContain('container-type: size');
    expect(r).toContain('overflow: hidden');
  });

  it('fundo de fora do palco é decorativo e não recebe toque', () => {
    const r = rule(html, 'body::before');
    expect(r).toContain('pointer-events: none');
    expect(r).toContain('ui_map_bg.webp');
  });

  it('a UI não usa unidades da janela sem a versão do palco logo depois', () => {
    for (const source of css) {
      const lines = source.split('\n');
      lines.forEach((line, i) => {
        expect(line, line).not.toMatch(/\d(dvw|svw|lvw|vw|vmin|vmax)\b/);
        if (/\d(dvh|svh|lvh|vh)\b/.test(line)) expect(lines[i + 1] ?? '', `fallback sem cqh: ${line}`).toMatch(/cqh/);
      });
    }
  });

  it('a fita do anúncio de onda tem padding fixo (o % era da largura do palco e cortava o texto)', () => {
    const r = rule(uiCss, '.rs-banner');
    expect(r).toMatch(/padding: 0 \d+px/);
  });
});
