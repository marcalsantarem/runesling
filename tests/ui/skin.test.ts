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
    expect(UI_PIECES).toHaveLength(37);
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

  it('peças novas da T-039 ligadas e runas SVG da placa visíveis por cima da peça', () => {
    const skin = css('ui-skin.css');
    const novas = ['ui_btn_mini', 'ui_btn_round', 'ui_btn_square', 'ui_ribbon_dark', 'ui_pill', 'ui_map_bg', 'ui_map_node', 'ui_map_node_locked', 'ui_defeat_shield'] as const;
    for (const k of novas) {
      expect(UI_PIECES, k).toContain(k);
      expect(skin, k).toMatch(new RegExp(`\\.skin-${k}[^{]*\\{[^}]*var\\(${pieceVar(k)}\\)`));
    }
    expect(skin).not.toMatch(/rs-plate-rn\)\s*\{\s*display:\s*none/);
    expect(skin).toMatch(/skin-ui_btn_square \.rs-plate\.rs-plate-mini\.rs-plate-iron \{[^}]*--ui-btn-square/);
    const root = document.createElement('div');
    expect(applySkin(root, novas.map((k) => `ui/${k}.webp`), { ui_map_bg: { slice: null } })).toEqual(
      UI_PIECES.filter((k) => (novas as readonly string[]).includes(k)),
    );
    expect(root.style.getPropertyValue('--ui-map-bg-slice')).toBe('');
  });

  it('T-039 parte 2: encaixe e ícones novos ligados; gema sozinha na carta', () => {
    const skin = css('ui-skin.css');
    for (const k of ['ui_socket', 'ui_icon_lock', 'ui_icon_back', 'ui_icon_check', 'ui_icon_recall'] as const) {
      expect(UI_PIECES, k).toContain(k);
      expect(skin, k).toMatch(new RegExp(`\\.skin-${k}[^{]*\\{[^}]*var\\(${pieceVar(k)}\\)`));
    }
    expect(skin).toMatch(/skin-ui_socket \.rs-rune:not\(\.rs-rune-empty\)/);
    expect(skin).toMatch(/skin-ui_socket \.rs-talent-icon \{[^}]*--ui-socket/);
    expect(skin).not.toMatch(/skin-ui_socket[^{]*rs-draft-socket/);
  });

  it('ícones de imagem: cadeado, voltar, check (MÁX e vitória) e Recolher pedem a peça', async () => {
    h = await setup();
    h.bus.emit('app:ready', {});
    expect(h.q('screen-menu').querySelector('.rs-node-lock .rs-uicon-ui_icon_lock')).not.toBeNull();
    expect(h.q('talents-back').querySelector('.rs-uicon-ui_icon_back')).not.toBeNull();
    expect(h.q('modal-end').querySelector('.rs-end-seal .rs-uicon-ui_icon_check')).not.toBeNull();
    h.click('menu-play');
    expect(h.q('hud-recall').querySelector('.rs-uicon-ui_icon_recall')).not.toBeNull();
  });

  it('animações respeitam prefers-reduced-motion', () => {
    expect(css('ui.css')).toMatch(/prefers-reduced-motion: reduce[^@]*animation: none/);
  });
});

describe('Menu e Talentos na direção A', () => {
  it('medalhão do chefe, barra da melhor onda e selo de talentos compráveis', async () => {
    h = await setup();
    h.bus.emit('app:ready', {});
    expect(h.q('menu-boss').getAttribute('aria-label')).toContain('Senhor Obsidiana');
    expect(h.q('menu-best').textContent).toBe('0/15');
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

describe('Botão placa de ferro (decisão 44)', () => {
  it('variantes mapeiam as peças, mini sem rebites/runas, pressionado e rótulo', async () => {
    const { plate, setPlateLabel } = await import('../../src/ui/dom');
    const gold = plate('gold', 'JOGAR', () => undefined, { size: 'lg' });
    expect(gold.classList.contains('rs-btn-primary')).toBe(true);
    expect(gold.querySelectorAll('.rs-plate-rv')).toHaveLength(4);
    expect(gold.querySelectorAll('.rs-plate-rn')).toHaveLength(2);
    expect(gold.textContent).toBe('JOGAR');
    expect(plate('iron', 'MENU', () => undefined).classList.contains('rs-btn-secondary')).toBe(true);
    const cyan = plate('cyan', 'RECOLHER', () => undefined, { size: 'mini' });
    expect(cyan.classList.contains('rs-btn-action')).toBe(true);
    expect(cyan.querySelector('.rs-plate-rv, .rs-plate-rn')).toBeNull();
    gold.dispatchEvent(new Event('pointerdown'));
    expect(gold.classList.contains('is-down')).toBe(true);
    gold.dispatchEvent(new Event('pointerup'));
    expect(gold.classList.contains('is-down')).toBe(false);
    gold.disabled = true;
    gold.dispatchEvent(new Event('pointerdown'));
    expect(gold.classList.contains('is-down')).toBe(false);
    setPlateLabel(gold, 'DE NOVO');
    expect(gold.textContent).toBe('DE NOVO');
    expect(gold.querySelector('.rs-plate-fr')).not.toBeNull();
  });

  it('todos os botões de texto das telas usam a placa', async () => {
    h = await setup();
    h.bus.emit('app:ready', {});
    for (const k of ['menu-play', 'talent-buy-atk', 'settings-sound', 'settings-close', 'hud-speed', 'hud-recall', 'end-again', 'end-menu', 'pause-resume', 'pause-sound', 'pause-quit']) {
      expect(h.q(k).classList.contains('rs-plate'), k).toBe(true);
    }
  });
});
