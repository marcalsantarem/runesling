// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import { loadGameData } from '../../src/data/types';
import { artIcon, hasIconFile, iconPath, resetMissingIcons, setAvailableAssets } from '../../src/ui/dom';
import { runState, setup, type Harness } from './helpers';

let h: Harness | undefined;
afterEach(() => {
  h?.ui.destroy();
  h = undefined;
  resetMissingIcons();
  setAvailableAssets();
});

describe('Ícones na UI (T-028)', () => {
  it('caminho do ícone vem do iconKey', () => {
    expect(iconPath('icon_chain_lightning')).toBe(`${import.meta.env.BASE_URL}assets/icons/icon_chain_lightning.webp`);
    expect(iconPath('icon_gold_greed')).toMatch(/assets\/icons\/icon_gold_greed\.webp$/);
  });

  it('todo perk e talento tem iconKey icon_*', () => {
    const game = loadGameData();
    for (const p of Object.values(game.perks)) expect(p.iconKey).toMatch(/^icon_[a-z0-9_]+$/);
    for (const tl of Object.values(game.talents)) expect(tl.iconKey).toMatch(/^icon_[a-z0-9_]+$/);
  });

  it('carregou: marca has-art; falhou: remove a imagem e mantém a bolinha', () => {
    setAvailableAssets(['icons/icon_ok.webp', 'icons/icon_missing.webp']);
    const ok = artIcon('icon_ok', 'rs-draft-gem rs-art');
    ok.querySelector('img')?.dispatchEvent(new Event('load'));
    expect(ok.classList.contains('has-art')).toBe(true);

    const bad = artIcon('icon_missing', 'rs-draft-gem rs-art');
    expect(bad.querySelector('img')?.getAttribute('src')).toBe(iconPath('icon_missing'));
    bad.querySelector('img')?.dispatchEvent(new Event('error'));
    expect(bad.querySelector('img')).toBeNull();
    expect(bad.classList.contains('has-art')).toBe(false);
    expect(bad.classList.contains('rs-draft-gem')).toBe(true);
    // chave que falhou não é pedida de novo
    expect(artIcon('icon_missing', 'rs-art').querySelector('img')).toBeNull();
  });

  it('só cria <img> para ícone listado em AVAILABLE_ASSETS (T-031)', () => {
    setAvailableAssets(['icons/icon_ok.webp', 'atlases/icons.webp']);
    expect(hasIconFile('icon_ok')).toBe(true);
    expect(hasIconFile('icons')).toBe(false);
    expect(artIcon('icon_ok', 'rs-art').querySelector('img')?.getAttribute('src')).toBe(iconPath('icon_ok'));
    const none = artIcon('icon_absent', 'rs-draft-gem rs-art');
    expect(none.querySelector('img')).toBeNull();
    expect(none.classList.contains('rs-draft-gem')).toBe(true);
    expect(none.getAttribute('data-icon')).toBe('icon_absent');
    setAvailableAssets([]);
    expect(artIcon('icon_ok', 'rs-art').querySelector('img')).toBeNull();
  });

  it('draft, talentos e faixa de runas usam o iconKey do dado', async () => {
    h = await setup();
    const game = loadGameData();
    h.bus.emit('app:ready', {});
    h.click('nav-talents');
    expect(h.q('talent-gold').querySelector('[data-icon]')?.getAttribute('data-icon')).toBe(game.talents.gold?.iconKey);

    h.click('menu-play');
    h.bus.emit('draft:open', { choices: ['fire_splash', 'ghost_ball', 'power_surge'] });
    const icons = [...h.q('modal-draft').querySelectorAll('.rs-draft-card [data-icon]')].map((n) => n.getAttribute('data-icon'));
    expect(icons).toEqual(['fire_splash', 'ghost_ball', 'power_surge'].map((id) => game.perks[id as 'ghost_ball'].iconKey));
  });

  it('faixa de runas: ícone por runa e repetidas empilhadas com contador', async () => {
    h = await setup();
    h.bus.emit('app:ready', {});
    h.click('menu-play');
    h.bus.emit('run:state', runState({ perks: ['extra_orb', 'chain_lightning', 'extra_orb', 'extra_orb'] }));
    const tags = [...h.q('hud-runes').querySelectorAll('[data-perk]')];
    expect(tags).toHaveLength(2);
    expect(tags[0]?.querySelector('[data-icon]')?.getAttribute('data-icon')).toBe('icon_extra_orb');
    expect(tags[0]?.querySelector('.rs-rune-count')?.textContent).toBe('×3');
    expect(tags[1]?.querySelector('.rs-rune-count')).toBeNull();
  });
});
