import { describe, expect, it } from 'vitest';
import { loadGameData } from '../../src/data/types';
import {
  addItems, canFuse, emptyItems, equip, fuse, itemName, itemValue, openChest, rollDrop, runLoadout, sanitizeItems, unequip,
  type ItemsState,
} from '../../src/meta/items';

const data = loadGameData();
const seq = (...xs: number[]) => { let i = 0; return { next: () => xs[i++ % xs.length]! }; };
const withInv = (...refs: [string, 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary', number][]): ItemsState => ({
  ...emptyItems(),
  inventory: refs.map(([itemId, rarity, count]) => ({ itemId, rarity, count })),
});

describe('lógica dos itens (contrato M8; decisões 62–70)', () => {
  it('addItems empilha por id+raridade e ignora inválidos', () => {
    const s = addItems(emptyItems(), [
      { itemId: 'orb_fire', rarity: 'common' }, { itemId: 'orb_fire', rarity: 'common' },
      { itemId: 'orb_fire', rarity: 'rare' }, { itemId: 'xx', rarity: 'common' },
    ]);
    expect(s.inventory).toEqual([{ itemId: 'orb_fire', rarity: 'common', count: 2 }, { itemId: 'orb_fire', rarity: 'rare', count: 1 }]);
  });

  it('equip move 1 unidade e devolve o anterior; unequip devolve', () => {
    const s0 = withInv(['ring_fire', 'common', 2], ['ring_spectral', 'rare', 1]);
    const s1 = equip(s0, 'ring_fire', 'common')!;
    expect(s1.equipped.ring).toEqual({ itemId: 'ring_fire', rarity: 'common' });
    expect(s1.inventory).toContainEqual({ itemId: 'ring_fire', rarity: 'common', count: 1 });
    const s2 = equip(s1, 'ring_spectral', 'rare')!;
    expect(s2.equipped.ring).toEqual({ itemId: 'ring_spectral', rarity: 'rare' });
    expect(s2.inventory).toEqual([{ itemId: 'ring_fire', rarity: 'common', count: 2 }]);
    expect(equip(s2, 'ring_spectral', 'rare')).toBeNull();
    const s3 = unequip(s2, 'ring');
    expect(s3.equipped.ring).toBeNull();
    expect(s3.inventory).toContainEqual({ itemId: 'ring_spectral', rarity: 'rare', count: 1 });
    expect(s0.equipped.ring).toBeNull();
  });

  it('fusão: 3 → 1 da seguinte; equipados não contam; Lendário não funde', () => {
    const s = withInv(['cloak_fire', 'epic', 3]);
    expect(canFuse(s, 'cloak_fire', 'epic')).toBe(true);
    expect(fuse(s, 'cloak_fire', 'epic')!.inventory).toEqual([{ itemId: 'cloak_fire', rarity: 'legendary', count: 1 }]);
    const eq = equip(s, 'cloak_fire', 'epic')!;
    expect(canFuse(eq, 'cloak_fire', 'epic')).toBe(false);
    expect(fuse(withInv(['cloak_fire', 'legendary', 5]), 'cloak_fire', 'legendary')).toBeNull();
  });

  it('rollDrop: odds por fonte; chefe dá 1 ou 2', () => {
    expect(rollDrop('miniboss', seq(0, 0))).toEqual([{ itemId: Object.keys(data.items.items)[0], rarity: 'common' }]);
    expect(rollDrop('miniboss', seq(0.999, 0.9))[0]!.rarity).toBe('uncommon');
    expect(rollDrop('chest', seq(0.5, 0.99))[0]!.rarity).toBe('rare');
    expect(rollDrop('boss', seq(0.9, 0.1, 0.1))).toHaveLength(1);
    expect(rollDrop('boss', seq(0.1, 0.1, 0.1, 0.1, 0.1))).toHaveLength(2);
    const ids = new Set(Array.from({ length: 18 }, (_, i) => rollDrop('chest', seq((i + 0.5) / 18, 0))[0]!.itemId));
    expect(ids.size).toBe(18);
  });

  it('openChest debita o preço e soma 1 item; sem ouro → null', () => {
    const price = data.items.rules.chest.priceGold;
    const r = openChest({ gold: price + 5, items: emptyItems() }, seq(0, 0))!;
    expect(r.gold).toBe(5);
    expect(r.drops).toHaveLength(1);
    expect(r.items.inventory).toHaveLength(1);
    expect(openChest({ gold: price - 1, items: emptyItems() }, seq(0))).toBeNull();
  });

  it('runLoadout: soma stats, runas sem repetição e efeitos dos Lendários (decisão 66)', () => {
    const staff = data.items.items.staff_lightning!;
    const eq = { ...emptyItems().equipped, staff: { itemId: 'staff_lightning', rarity: 'legendary' as const }, ring: { itemId: 'ring_fire', rarity: 'common' as const } };
    const l = runLoadout(eq);
    expect(l.stats[staff.stat]).toBeCloseTo(itemValue(staff, 'legendary') + (data.items.items.ring_fire!.stat === staff.stat ? data.items.items.ring_fire!.values.common : 0));
    expect(itemValue(staff, 'legendary')).toBe(staff.values.rare);
    expect(l.startRunes).toEqual([staff.epicRune]);
    expect(l.legendaryEffects).toEqual([{ effectId: staff.legendary.effectId, params: staff.legendary.params }]);
    const twin = Object.values(data.items.items).find((i) => i.id !== 'staff_lightning' && i.epicRune === staff.epicRune);
    if (twin) {
      const l2 = runLoadout({ ...eq, [twin.slot]: { itemId: twin.id, rarity: 'epic' } });
      expect(l2.startRunes).toEqual([staff.epicRune]);
    }
    expect(itemName(staff, 'legendary')).toBe(staff.legendaryName);
    expect(itemName(staff, 'epic')).toBe(staff.name);
  });

  it('sanitize descarta inválidos, espaço errado e count ≤ 0', () => {
    const s = sanitizeItems({
      inventory: [
        { itemId: 'orb_fire', rarity: 'rare', count: 2 }, { itemId: 'orb_fire', rarity: 'rare', count: 1 },
        { itemId: 'orb_fire', rarity: 'mitico', count: 1 }, { itemId: 'xx', rarity: 'common', count: 1 },
        { itemId: 'orb_fire', rarity: 'common', count: 0 }, { itemId: 'orb_fire', rarity: 'common', count: 1.5 }, null,
      ],
      equipped: { staff: { itemId: 'orb_fire', rarity: 'common' }, orb: { itemId: 'orb_spectral', rarity: 'epic' }, ring: 'x' },
    });
    expect(s.inventory).toEqual([{ itemId: 'orb_fire', rarity: 'rare', count: 3 }]);
    expect(s.equipped).toEqual({ ...emptyItems().equipped, orb: { itemId: 'orb_spectral', rarity: 'epic' } });
    expect(sanitizeItems('lixo')).toEqual(emptyItems());
  });
});
