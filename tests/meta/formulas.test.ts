import { describe, expect, it } from 'vitest';
import { enemyHp, hpBase, talentCost } from '../../src/meta/formulas';
import { rawGameData, type GameData } from '../../src/data/types';

describe('enemyHp (GDD §3.2)', () => {
  it('HP base nas ondas de referência', () => {
    expect(hpBase(1)).toBeCloseTo(7.35, 6);
    expect(hpBase(7)).toBeCloseTo(30.7762, 3);
    expect(hpBase(15)).toBeCloseTo(65.6247, 3);
  });

  it.each([
    ['goblin', 1, 7], ['shield', 1, 9], ['mini', 1, 3], ['bomb', 1, 6],
    ['goblin', 7, 31], ['shield', 7, 38], ['miniboss_iron', 7, 160],
    ['goblin', 15, 66], ['healer', 15, 66], ['boss_obsidian', 15, 623],
  ] as const)('%s na onda %i = %i', (id, w, hp) => {
    expect(enemyHp(id, w)).toBe(hp);
  });

  it('aplica piso de 2', () => {
    const raw = rawGameData();
    const data: GameData = { ...raw, enemies: { ...raw.enemies, tiny: { ...raw.enemies.mini!, id: 'tiny', hpMult: 0.01 } } };
    expect(enemyHp('tiny', 1, data)).toBe(2);
  });

  it('rejeita id ou onda inválidos', () => {
    expect(() => enemyHp('orc', 1)).toThrow();
    expect(() => enemyHp('goblin', 0)).toThrow(RangeError);
  });
});

describe('talentCost (GDD §5.1)', () => {
  it.each([
    ['atk', 0, 25], ['atk', 9, 205],
    ['hp', 0, 20], ['hp', 3, 74],
    ['balls', 0, 75], ['balls', 2, 255],
    ['crit', 0, 30], ['crit', 7, 198],
    ['gold', 0, 35], ['gold', 5, 175],
  ] as const)('%s nível %i custa %i', (id, lvl, cost) => {
    expect(talentCost(id, lvl)).toBe(cost);
  });

  it('não tem custo no nível máximo nem fora do intervalo', () => {
    expect(() => talentCost('balls', 3)).toThrow(RangeError);
    expect(() => talentCost('atk', -1)).toThrow(RangeError);
    expect(() => talentCost('atk', 1.5)).toThrow(RangeError);
    expect(() => talentCost('nope', 0)).toThrow();
  });
});
