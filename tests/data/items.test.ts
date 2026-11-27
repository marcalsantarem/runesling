import { describe, expect, it } from 'vitest';
import { ITEM_SCHOOLS, ITEM_SLOTS, loadGameData, rawGameData, validateItems, type GameData } from '../../src/data/types';

describe('catálogo de itens (GDD §5.2; decisões 62–69)', () => {
  const data = loadGameData();
  const items = Object.values(data.items.items);

  it('valida sem erros', () => {
    expect(validateItems(data)).toEqual([]);
  });

  it('tem 18 itens: 6 espaços × 3 escolas (decisão 64)', () => {
    expect(items).toHaveLength(18);
    for (const slot of ITEM_SLOTS) for (const school of ITEM_SCHOOLS) expect(data.items.items[`${slot}_${school}`]).toBeDefined();
  });

  it('Comum vale cerca de 1–2 níveis de talento (decisão 69)', () => {
    const per: Record<string, number> = { atk: 1, maxHp: 2, critChance: 0.05, goldMult: 0.15 };
    for (const it of items) {
      const lvl = per[it.stat];
      if (lvl === undefined) continue;
      const ratio = it.values.common / lvl;
      expect(ratio).toBeGreaterThanOrEqual(1);
      expect(ratio).toBeLessThanOrEqual(2);
    }
  });

  it('runa do Épico é da escola e nenhuma aparece mais de 2 vezes', () => {
    const count: Record<string, number> = {};
    for (const it of items) {
      expect(data.perks[it.epicRune].synergy).toBe(it.school);
      count[it.epicRune] = (count[it.epicRune] ?? 0) + 1;
    }
    expect(Math.max(...Object.values(count))).toBeLessThanOrEqual(2);
  });

  it('nomes da narrativa §12: base e Lendário (T-076)', () => {
    expect(data.items.items.staff_lightning?.name).toBe('Cajado Tempestuoso');
    expect(data.items.items.boots_spectral?.legendaryName).toBe('Botas de Sileas');
    for (const it of items) expect(it.legendaryName).not.toBe(it.name);
  });

  it('drops: quase sempre Comum; cores da decisão 70; chefe dá 1–2 (decisões 63, 65, 70)', () => {
    const r = data.items.rules;
    for (const o of Object.values(r.dropOdds)) expect(o.common).toBeGreaterThanOrEqual(0.75);
    expect(Object.fromEntries(r.rarities.map((x) => [x.id, x.color]))).toEqual({
      common: '#8B95B5', uncommon: '#2ECC71', rare: '#3B82F6', epic: '#FF9F43', legendary: '#FF4D4D',
    });
    expect(r.bossDrops.base).toBe(1);
    expect(r.bossDrops.base + r.bossDrops.extra).toBe(2);
    expect(r.fuseCount).toBe(3);
  });

  it('detecta catálogo quebrado', () => {
    const raw = rawGameData();
    const it = raw.items.items.staff_fire!;
    const broken: GameData = {
      ...raw,
      items: {
        rules: { ...raw.items.rules, dropOdds: { ...raw.items.rules.dropOdds, chest: { common: 0.5, uncommon: 0.2, rare: 0.1 } } },
        items: {
          ...raw.items.items,
          staff_fire: { ...it, values: { common: 3, uncommon: 2, rare: 1 }, epicRune: 'chain_lightning' },
          orb_fire: { ...raw.items.items.orb_fire!, legendary: { ...it.legendary } },
          ring_fire: { ...raw.items.items.ring_fire!, legendaryName: '' },
        },
      },
    };
    const errs = validateItems(broken).join('\n');
    expect(errs).toMatch(/chest: soma/);
    expect(errs).toMatch(/staff_fire.values/);
    expect(errs).toMatch(/não é da escola fire/);
    expect(errs).toMatch(/repetido/);
    expect(errs).toMatch(/ring_fire: name\/legendaryName/);
  });
});
