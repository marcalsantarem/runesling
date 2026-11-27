// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import { loadGameData } from '../../src/data/types';
import { setAvailableAssets } from '../../src/ui/dom';
import { itemBonus, itemLines } from '../../src/ui/equipment';
import { flush, runState, setup, type Harness } from './helpers';

let h: Harness;
afterEach(() => {
  h?.ui.destroy();
  setAvailableAssets();
});

const game = loadGameData();
const price = game.items.rules.chest.priceGold;

async function openItems(): Promise<void> {
  h.bus.emit('app:ready', {});
  h.click('nav-items');
  await flush();
}

describe('Tela de Equipamentos (T-079)', () => {
  it('abre pelo menu ao lado de Talentos e volta', async () => {
    h = await setup();
    await openItems();
    expect(h.visible('tab-items')).toBe(true);
    expect(h.visible('tab-play')).toBe(false);
    for (const s of ['staff', 'orb', 'ring', 'amulet', 'cloak', 'boots']) expect(h.visible(`items-slot-${s}`)).toBe(true);
    expect(h.visible('items-empty')).toBe(true);
    expect(h.q<HTMLButtonElement>('items-fuse').disabled).toBe(true);
    h.click('items-back');
    expect(h.visible('tab-play')).toBe(true);
  });

  it('pilha ×N, cor da raridade, equipar e desequipar', async () => {
    h = await setup();
    await h.profile.addItems([
      { itemId: 'staff_fire', rarity: 'common' },
      { itemId: 'staff_fire', rarity: 'common' },
      { itemId: 'ring_lightning', rarity: 'legendary' },
    ]);
    await openItems();
    const cell = h.q('items-cell-staff_fire-common');
    expect(cell.textContent).toContain('×2');
    expect(cell.textContent).toContain('Cajado de Brasa');
    expect(cell.textContent).toContain('+1 ATK');
    expect(cell.style.getPropertyValue('--rs-rarity')).toBe('#8B95B5');
    const leg = h.q('items-cell-ring_lightning-legendary');
    expect(leg.textContent).toContain('Anel de Vessa');
    expect(leg.style.getPropertyValue('--rs-rarity')).toBe('#FF4D4D');
    expect(leg.textContent).toContain(game.items.items.ring_lightning!.legendary.desc);

    cell.click();
    await flush();
    expect(h.profile.data().items.equipped.staff).toEqual({ itemId: 'staff_fire', rarity: 'common' });
    expect(h.q('items-cell-staff_fire-common').textContent).not.toContain('×');
    expect(h.q('items-bonus').textContent).toContain('+1 ATK');
    const slot = h.q<HTMLButtonElement>('items-slot-staff');
    expect(slot.disabled).toBe(false);

    slot.click();
    await flush();
    expect(h.profile.data().items.equipped.staff).toBeNull();
    expect(h.q('items-cell-staff_fire-common').textContent).toContain('×2');
  });

  it('Fundir: ativo com 3 iguais livres, mostra o resultado e confirma', async () => {
    h = await setup();
    await h.profile.addItems(Array.from({ length: 3 }, () => ({ itemId: 'orb_fire', rarity: 'rare' as const })));
    await openItems();
    const fuse = h.q<HTMLButtonElement>('items-fuse');
    expect(fuse.disabled).toBe(false);
    fuse.click();
    expect(h.visible('modal-fuse')).toBe(true);
    const result = h.q('fuse-result-orb_fire-rare');
    expect(result.textContent).toContain('Épico');
    expect(result.textContent).toContain('Runa:');
    h.click('fuse-confirm-orb_fire-rare');
    await flush();
    expect(h.profile.data().items.inventory).toEqual([{ itemId: 'orb_fire', rarity: 'epic', count: 1 }]);
    expect(h.visible('modal-fuse')).toBe(false);
    expect(h.visible('modal-chest')).toBe(true);
    expect(h.q<HTMLButtonElement>('items-fuse').disabled).toBe(true);
  });

  it('Baú: desativado sem ouro; ao abrir mostra o item na cor da raridade', async () => {
    h = await setup();
    await openItems();
    const chest = h.q<HTMLButtonElement>('items-chest');
    expect(chest.textContent).toContain(String(price));
    expect(chest.disabled).toBe(true); // 40 de ouro inicial < preço
    await h.profile.recordRun({ wave: 1, won: false, goldEarned: price });
    await flush();
    expect(h.q<HTMLButtonElement>('items-chest').disabled).toBe(false);
    h.click('items-chest');
    await flush();
    expect(h.visible('modal-chest')).toBe(true);
    const card = h.q('chest-item-0');
    expect(card.style.getPropertyValue('--rs-rarity')).toMatch(/^#/);
    expect(h.profile.data().items.inventory).toHaveLength(1);
    expect(h.q('items-gold').textContent).toBe('40');
  });

  it('ícone: imagem só se existir em AVAILABLE_ASSETS; senão, ícone do espaço tingido', async () => {
    setAvailableAssets([]);
    h = await setup();
    await h.profile.addItems([{ itemId: 'boots_spectral', rarity: 'common' }]);
    await openItems();
    const art = h.q('items-cell-boots_spectral-common').querySelector('.rs-item-art')!;
    expect(art.classList.contains('rs-school-spectral')).toBe(true);
    expect(art.querySelector('img')).toBeNull();
    expect(art.querySelector('.rs-item-glyph svg')).not.toBeNull();
    h.ui.destroy();
    setAvailableAssets(['icons/item_boots_spectral.webp']);
    h = await setup();
    await h.profile.addItems([{ itemId: 'boots_spectral', rarity: 'common' }]);
    await openItems();
    const img = h.q('items-cell-boots_spectral-common').querySelector('img');
    expect(img?.getAttribute('src')).toContain('icons/item_boots_spectral.webp');
  });

  it('textos de bônus por stat', () => {
    const it = game.items.items;
    expect(itemBonus(it.ring_fire!, 'uncommon')).toBe('+8% CRIT');
    expect(itemBonus(it.orb_lightning!, 'epic')).toBe('+20% dano elétrico');
    expect(itemBonus(it.cloak_fire!, 'common')).toBe('15% de anular tiros');
    expect(itemBonus(it.amulet_fire!, 'rare')).toBe('+7 HP');
    expect(itemLines(it.staff_fire!, 'common')).toHaveLength(1);
    expect(itemLines(it.staff_fire!, 'legendary')).toHaveLength(3);
  });
});

describe('Itens na partida (T-079)', () => {
  it('run:itemDrop mostra aviso sem travar; Fim de run lista os itens (ou some se vazio)', async () => {
    h = await setup();
    h.bus.emit('app:ready', {});
    h.click('menu-play');
    h.bus.emit('run:state', runState());
    h.bus.emit('run:itemDrop', { items: [{ itemId: 'staff_fire', rarity: 'uncommon' }], source: 'miniboss' });
    expect(h.visible('hud-item-toast')).toBe(true);
    expect(h.q('hud-item-toast').textContent).toContain('Cajado de Brasa');
    expect(h.q<HTMLButtonElement>('hud-pause').disabled).toBe(false);

    h.bus.emit('run:ended', { won: true, wave: 15, goldEarned: 10, items: [{ itemId: 'ring_fire', rarity: 'rare' }] });
    expect(h.visible('end-items')).toBe(true);
    expect(h.q('end-items').textContent).toContain('Anel de Cinzas');

    h.click('end-again');
    h.bus.emit('run:ended', { won: false, wave: 2, goldEarned: 1, items: [] });
    expect(h.visible('end-items')).toBe(false);
  });
});
