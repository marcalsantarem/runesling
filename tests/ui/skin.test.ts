// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadGameData } from '../../src/data/types';
import { synergySeal } from '../../src/ui/modals';
import { applySkin, availablePieces, pieceVar, UI_PIECES } from '../../src/ui/skin';
import { flush, runState, setup, type Harness } from './helpers';

let h: Harness | undefined;
afterEach(() => {
  h?.ui.destroy();
  h = undefined;
  vi.useRealTimers();
});

const css = (f: string) => readFileSync(join(__dirname, '../../src/styles', f), 'utf8');

describe('Peças de UI da direção A (contrato M5)', () => {
  it('toda peça do contrato tem variável com fallback none em ui-skin.css', () => {
    const skin = css('ui-skin.css');
    expect(UI_PIECES).toHaveLength(23);
    for (const k of UI_PIECES) {
      expect(skin, k).toMatch(new RegExp(`${pieceVar(k)}:\\s*none`));
      expect(skin, k).toContain(`.skin-${k}`);
    }
    expect(css('ui.css')).toContain("@import './ui-skin.css'");
  });

  it('sem arquivo não liga nada; com arquivo preenche a variável, o slice e a classe', () => {
    const root = document.createElement('div');
    expect(applySkin(root, [])).toEqual([]);
    expect(root.className).toBe('');
    const got = applySkin(root, ['ui/ui_panel.webp', 'ui/ui_icon_coin.webp', 'ui/outro.webp'], {
      ui_panel: { slice: [40, 40, 40, 40] },
    });
    expect(got).toEqual(['ui_panel', 'ui_icon_coin']);
    expect(root.classList.contains('skin-ui_panel')).toBe(true);
    expect(root.style.getPropertyValue('--ui-panel')).toMatch(/assets\/ui\/ui_panel\.webp/);
    expect(root.style.getPropertyValue('--ui-panel-slice')).toBe('40 40 40 40');
    expect(root.style.getPropertyValue('--ui-panel-bw')).toBe('20px 20px 20px 20px');
    expect(availablePieces(['ui/ui_ribbon.webp'])).toEqual(['ui_ribbon']);
  });

  it('animações respeitam prefers-reduced-motion', () => {
    expect(css('ui.css')).toMatch(/prefers-reduced-motion: reduce[^@]*animation: none/);
  });
});

describe('Menu e Talentos na direção A', () => {
  it('medalhão do chefe, barra da melhor onda e selo de talentos compráveis', async () => {
    h = await setup();
    h.bus.emit('app:ready', {});
    expect(h.q('menu-boss').textContent).toContain('Senhor Obsidiana');
    expect(h.q('menu-progress').style.width).toBe('0%');
    const ids = ['atk', 'hp', 'balls', 'crit', 'gold'] as const;
    const affordable = () => ids.filter((id) => h?.profile.canBuy(id)).length;
    expect(affordable()).toBeGreaterThan(0);
    expect(h.q('nav-talents-badge').textContent).toBe(String(affordable()));
    expect(h.visible('nav-talents-badge')).toBe(true);
    h.click('talent-buy-atk');
    await flush();
    expect(h.visible('nav-talents-badge')).toBe(affordable() > 0);
    const pips = h.q('talent-atk').querySelectorAll('.rs-pips i');
    expect(pips).toHaveLength(10);
    expect(h.q('talent-atk').querySelectorAll('.rs-pips i.is-on')).toHaveLength(1);
  });

  it('engrenagem abre as configurações com som', async () => {
    h = await setup();
    h.bus.emit('app:ready', {});
    expect(h.visible('modal-settings')).toBe(false);
    h.click('menu-settings');
    expect(h.visible('modal-settings')).toBe(true);
    h.click('settings-sound');
    await flush();
    expect(h.profile.data().settings.muted).toBe(true);
    expect(h.q('settings-sound').textContent).toBe('SOM: DESLIGADO');
    h.click('settings-close');
    expect(h.visible('modal-settings')).toBe(false);
  });
});

describe('Partida na direção A', () => {
  it('selo de sinergia: nova, n-ésima e nenhum no Núcleo', () => {
    const game = loadGameData();
    expect(synergySeal('fire', [], game)).toBe('Nova sinergia');
    expect(synergySeal('lightning', ['chain_lightning'], game)).toBe('2ª da sinergia');
    expect(synergySeal('core', ['extra_orb'], game)).toBeNull();
  });

  it('cartas do Draft: losango, encaixe, selo e entrada escalonada', async () => {
    h = await setup();
    h.bus.emit('app:ready', {});
    h.click('menu-play');
    h.bus.emit('run:state', runState({ perks: ['chain_lightning'] }));
    h.bus.emit('draft:open', { choices: ['static_crit', 'fire_splash', 'extra_orb'] });
    const cards = [...h.q('modal-draft').querySelectorAll<HTMLElement>('.rs-draft-card')];
    expect(cards.map((c) => c.querySelector('.rs-draft-seal')?.textContent ?? null)).toEqual([
      '2ª da sinergia',
      'Nova sinergia',
      null,
    ]);
    for (const c of cards) {
      expect(c.querySelector('.rs-gem')).not.toBeNull();
      expect(c.querySelector('.rs-socket [data-icon]')).not.toBeNull();
    }
    expect(cards.map((c) => c.style.getPropertyValue('--i'))).toEqual(['0', '1', '2']);
  });

  it('banner na fita e fim de run com fita de vitória/derrota', async () => {
    h = await setup();
    h.bus.emit('app:ready', {});
    h.click('menu-play');
    h.bus.emit('run:banner', { text: 'ONDA 6/15' });
    expect(h.q('hud-banner').querySelector('.rs-ribbon-text')?.textContent).toBe('ONDA 6/15');
    h.bus.emit('run:ended', { won: true, wave: 15, goldEarned: 10 });
    const rib = h.q('end-title').parentElement;
    expect(rib?.classList.contains('is-victory')).toBe(true);
    h.click('end-again');
    h.bus.emit('run:ended', { won: false, wave: 3, goldEarned: 1 });
    expect(rib?.classList.contains('is-defeat')).toBe(true);
  });
});
