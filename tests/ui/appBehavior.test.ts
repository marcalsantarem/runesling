// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import html from '../../index.html?raw';
import { installAppBehavior, isEditable } from '../../src/ui/appBehavior';

const uiCss = readFileSync(join(__dirname, '../../src/styles/ui.css'), 'utf8');
const mainTs = readFileSync(join(__dirname, '../../src/main.ts'), 'utf8');

/** Corpo da primeira regra cujo seletor bate exatamente. */
function rule(source: string, selector: string): string {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = source.match(new RegExp(`(?:^|[}\\n])\\s*${esc}\\s*\\{([^}]*)\\}`));
  expect(m, `regra ${selector}`).not.toBeNull();
  return m?.[1] ?? '';
}

let uninstall: (() => void) | undefined;
afterEach(() => {
  uninstall?.();
  uninstall = undefined;
  document.body.innerHTML = '';
});

function fire(target: EventTarget, type: string, init: Record<string, unknown> = {}): Event {
  const e = new Event(type, { bubbles: true, cancelable: true });
  for (const [k, v] of Object.entries(init)) Object.defineProperty(e, k, { value: v });
  target.dispatchEvent(e);
  return e;
}

describe('comportamento de app (decisão 46): CSS e meta', () => {
  it('viewport sem zoom', () => {
    const meta = html.match(/<meta name="viewport" content="([^"]+)"/)?.[1] ?? '';
    expect(meta).toContain('maximum-scale=1');
    expect(meta).toContain('user-scalable=no');
  });

  it('html/body sem rolagem, sem elástico, sem seleção e sem callout', () => {
    const r = rule(html, 'html, body');
    for (const d of [
      'overflow: hidden',
      'overscroll-behavior: none',
      'touch-action: manipulation',
      '-webkit-user-select: none',
      'user-select: none',
      '-webkit-touch-callout: none',
      '-webkit-tap-highlight-color: transparent',
      'height: 100dvh',
    ]) {
      expect(r).toContain(d);
    }
    expect(rule(html, 'body')).toContain('position: fixed');
  });

  it('canvas sem gestos do navegador (mira por arrasto) e campos de texto selecionáveis', () => {
    expect(rule(html, '#game')).toContain('touch-action: none');
    expect(rule(html, '#game canvas')).toContain('touch-action: none');
    expect(rule(html, 'input, textarea, [contenteditable="true"]')).toContain('user-select: text');
  });

  it('listas com rolagem interna não puxam a página', () => {
    expect(rule(uiCss, '.rs-menu-body')).toContain('overscroll-behavior: contain');
    expect(rule(uiCss, '.rs-menu-body')).toContain('touch-action: pan-y');
    for (const m of uiCss.matchAll(/\{[^}]*overflow(?:-[xy])?: (?:auto|scroll)[^}]*\}/g)) {
      expect(m[0]).toContain('overscroll-behavior: contain');
    }
  });

  it('camada da UI sem seleção, callout e destaque de toque; botões sem zoom por toque duplo', () => {
    const r = rule(uiCss, '.rs-ui');
    expect(r).toContain('user-select: none');
    expect(r).toContain('-webkit-touch-callout: none');
    expect(r).toContain('-webkit-tap-highlight-color: transparent');
    expect(rule(uiCss, '.rs-btn')).toContain('touch-action: manipulation');
  });

  it('main.ts instala os listeners', () => {
    expect(mainTs).toMatch(/installAppBehavior\(document\)/);
  });
});

describe('comportamento de app (decisão 46): listeners', () => {
  it('bloqueia gestos de zoom do iOS, pinça, Ctrl+roda e toque duplo', () => {
    uninstall = installAppBehavior(document);
    for (const t of ['gesturestart', 'gesturechange', 'gestureend', 'dblclick']) {
      expect(fire(document.body, t).defaultPrevented, t).toBe(true);
    }
    expect(fire(document.body, 'touchmove', { touches: [{}, {}] }).defaultPrevented).toBe(true);
    expect(fire(document.body, 'wheel', { ctrlKey: true }).defaultPrevented).toBe(true);
  });

  it('não atrapalha a mira (um dedo) nem a rolagem comum', () => {
    uninstall = installAppBehavior(document);
    expect(fire(document.body, 'touchmove', { touches: [{}] }).defaultPrevented).toBe(false);
    expect(fire(document.body, 'wheel', { ctrlKey: false }).defaultPrevented).toBe(false);
    for (const t of ['pointerdown', 'pointermove', 'pointerup', 'click']) {
      expect(fire(document.body, t).defaultPrevented, t).toBe(false);
    }
  });

  it('sem menu de contexto nem seleção fora de campos de texto', () => {
    uninstall = installAppBehavior(document);
    const div = document.createElement('div');
    const input = document.createElement('input');
    document.body.append(div, input);
    for (const t of ['contextmenu', 'selectstart', 'dragstart']) {
      expect(fire(div, t).defaultPrevented, t).toBe(true);
      expect(fire(input, t).defaultPrevented, `${t} em input`).toBe(false);
    }
    expect(isEditable(input)).toBe(true);
    expect(isEditable(div)).toBe(false);
    expect(isEditable(null)).toBe(false);
  });

  it('a função devolvida remove os bloqueios', () => {
    installAppBehavior(document)();
    expect(fire(document.body, 'contextmenu').defaultPrevented).toBe(false);
    expect(fire(document.body, 'gesturestart').defaultPrevented).toBe(false);
  });
});
