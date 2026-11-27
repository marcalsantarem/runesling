/**
 * Lógica pura dos itens (GDD §5.2; decisões 62–70; contrato `docs/briefings/_contrato-m8-itens.md`).
 * Sem Phaser; aleatoriedade injetada. Todas as funções devolvem estado novo (não mutam).
 */
import {
  ITEM_RARITIES,
  ITEM_SLOTS,
  loadGameData,
  type DropSource,
  type GameData,
  type ItemDef,
  type ItemRarity,
  type ItemSlot,
  type ItemStat,
  type ItemValueRarity,
  type PerkId,
} from '../data/types';
import type { RandomSource } from '../match/rng';

export interface ItemRef {
  readonly itemId: string;
  readonly rarity: ItemRarity;
}
export interface ItemStack extends ItemRef {
  /** ≥ 1. */
  readonly count: number;
}
export type Equipped = { readonly [S in ItemSlot]: ItemRef | null };
export interface ItemsState {
  /** Empilhado por itemId+rarity (decisão 67). Não inclui os equipados. */
  readonly inventory: readonly ItemStack[];
  readonly equipped: Equipped;
}

export interface RunLoadout {
  readonly stats: Partial<Record<ItemStat, number>>;
  /** Runas dos Épicos/Lendários, sem repetição, na ordem dos espaços. */
  readonly startRunes: PerkId[];
  readonly legendaryEffects: { effectId: string; params: ItemDef['legendary']['params'] }[];
}

const def = (data: GameData, itemId: string): ItemDef | undefined =>
  Object.prototype.hasOwnProperty.call(data.items.items, itemId) ? data.items.items[itemId] : undefined;

const isRarity = (v: unknown): v is ItemRarity => ITEM_RARITIES.includes(v as ItemRarity);

export function emptyItems(): ItemsState {
  const equipped = {} as Record<ItemSlot, ItemRef | null>;
  for (const s of ITEM_SLOTS) equipped[s] = null;
  return { inventory: [], equipped };
}

/** Número do stat na raridade: Épico e Lendário usam o do Raro (decisão 66). */
export function itemValue(item: ItemDef, rarity: ItemRarity): number {
  const r: ItemValueRarity = rarity === 'common' || rarity === 'uncommon' ? rarity : 'rare';
  return item.values[r];
}

/** Nome exibido: o do Lendário muda (narrativa §12). */
export function itemName(item: ItemDef, rarity: ItemRarity): string {
  return rarity === 'legendary' ? item.legendaryName : item.name;
}

export function rarityColor(rarity: ItemRarity, data: GameData = loadGameData()): string {
  return data.items.rules.rarities.find((r) => r.id === rarity)?.color ?? '#8B95B5';
}

export function nextRarity(rarity: ItemRarity): ItemRarity | null {
  return ITEM_RARITIES[ITEM_RARITIES.indexOf(rarity) + 1] ?? null;
}

export function countOf(items: ItemsState, itemId: string, rarity: ItemRarity): number {
  return items.inventory.find((s) => s.itemId === itemId && s.rarity === rarity)?.count ?? 0;
}

/** Soma `delta` (pode ser negativo) à pilha; pilha ≤ 0 some. Mantém a ordem de chegada. */
function addCount(inv: readonly ItemStack[], itemId: string, rarity: ItemRarity, delta: number): ItemStack[] {
  const out: ItemStack[] = [];
  let found = false;
  for (const s of inv) {
    if (s.itemId === itemId && s.rarity === rarity) {
      found = true;
      if (s.count + delta > 0) out.push({ itemId, rarity, count: s.count + delta });
    } else out.push(s);
  }
  if (!found && delta > 0) out.push({ itemId, rarity, count: delta });
  return out;
}

/** Soma itens ganhos ao inventário; ref inválida é ignorada. */
export function addItems(items: ItemsState, refs: readonly ItemRef[], data: GameData = loadGameData()): ItemsState {
  let inv = items.inventory as ItemStack[];
  for (const r of refs) if (def(data, r.itemId) && isRarity(r.rarity)) inv = addCount(inv, r.itemId, r.rarity, 1);
  return inv === items.inventory ? items : { ...items, inventory: inv };
}

/** Move 1 unidade do inventário para o espaço do item; o anterior volta ao inventário. Sem a unidade → null. */
export function equip(items: ItemsState, itemId: string, rarity: ItemRarity, data: GameData = loadGameData()): ItemsState | null {
  const it = def(data, itemId);
  if (!it || countOf(items, itemId, rarity) < 1) return null;
  let inv = addCount(items.inventory, itemId, rarity, -1);
  const prev = items.equipped[it.slot];
  if (prev) inv = addCount(inv, prev.itemId, prev.rarity, 1);
  return { inventory: inv, equipped: { ...items.equipped, [it.slot]: { itemId, rarity } } };
}

/** Devolve o item do espaço ao inventário (espaço vazio → estado igual). */
export function unequip(items: ItemsState, slot: ItemSlot): ItemsState {
  const prev = items.equipped[slot];
  if (!prev) return items;
  return {
    inventory: addCount(items.inventory, prev.itemId, prev.rarity, 1),
    equipped: { ...items.equipped, [slot]: null },
  };
}

/** `fuseCount` iguais no inventário (equipados não contam); Lendário não funde (decisão 62). */
export function canFuse(items: ItemsState, itemId: string, rarity: ItemRarity, data: GameData = loadGameData()): boolean {
  return !!def(data, itemId) && nextRarity(rarity) !== null && countOf(items, itemId, rarity) >= data.items.rules.fuseCount;
}

/** Consome `fuseCount` e dá 1 da raridade seguinte. Não pode → null. */
export function fuse(items: ItemsState, itemId: string, rarity: ItemRarity, data: GameData = loadGameData()): ItemsState | null {
  const next = nextRarity(rarity);
  if (!next || !canFuse(items, itemId, rarity, data)) return null;
  const inv = addCount(addCount(items.inventory, itemId, rarity, -data.items.rules.fuseCount), itemId, next, 1);
  return { ...items, inventory: inv };
}

function rollRarity(source: DropSource, rng: RandomSource, data: GameData): ItemRarity {
  const o = data.items.rules.dropOdds[source];
  const x = rng.next();
  if (x < o.common) return 'common';
  if (x < o.common + o.uncommon) return 'uncommon';
  return 'rare';
}

/** Sorteia os drops da fonte (decisões 63, 65). Item uniforme entre os do catálogo; chefe: base + extra com `extraChance`. */
export function rollDrop(source: DropSource, rng: RandomSource, data: GameData = loadGameData()): ItemRef[] {
  const ids = Object.keys(data.items.items);
  const b = data.items.rules.bossDrops;
  const n = source === 'boss' ? b.base + (rng.next() < b.extraChance ? b.extra : 0) : 1;
  const out: ItemRef[] = [];
  for (let i = 0; i < n; i++) {
    const itemId = ids[Math.min(ids.length - 1, Math.floor(rng.next() * ids.length))]!;
    out.push({ itemId, rarity: rollRarity(source, rng, data) });
  }
  return out;
}

export interface ChestResult {
  readonly gold: number;
  readonly items: ItemsState;
  readonly drops: ItemRef[];
}

/** Baú do menu: debita `chest.priceGold` e soma 1 drop `chest`. Sem ouro → null. */
export function openChest(
  profile: { readonly gold: number; readonly items: ItemsState },
  rng: RandomSource,
  data: GameData = loadGameData(),
): ChestResult | null {
  const price = data.items.rules.chest.priceGold;
  if (profile.gold < price) return null;
  const drops = rollDrop('chest', rng, data);
  return { gold: profile.gold - price, items: addItems(profile.items, drops, data), drops };
}

/** Bônus dos equipados para a partida (decisão 66). A T-078 soma `stats` aos talentos. */
export function runLoadout(equipped: Equipped, data: GameData = loadGameData()): RunLoadout {
  const stats: Partial<Record<ItemStat, number>> = {};
  const startRunes: PerkId[] = [];
  const legendaryEffects: RunLoadout['legendaryEffects'] = [];
  for (const slot of ITEM_SLOTS) {
    const ref = equipped[slot];
    const it = ref && def(data, ref.itemId);
    if (!ref || !it) continue;
    stats[it.stat] = (stats[it.stat] ?? 0) + itemValue(it, ref.rarity);
    if ((ref.rarity === 'epic' || ref.rarity === 'legendary') && !startRunes.includes(it.epicRune)) startRunes.push(it.epicRune);
    if (ref.rarity === 'legendary') legendaryEffects.push({ effectId: it.legendary.effectId, params: it.legendary.params });
  }
  return { stats, startRunes, legendaryEffects };
}

/** Saneia o save: descarta id/raridade inválidos, item no espaço errado e count ≤ 0; empilha repetidos. */
export function sanitizeItems(raw: unknown, data: GameData = loadGameData()): ItemsState {
  const base = emptyItems();
  if (typeof raw !== 'object' || raw === null) return base;
  const r = raw as { inventory?: unknown; equipped?: unknown };
  let inv: ItemStack[] = [];
  if (Array.isArray(r.inventory)) {
    for (const s of r.inventory as unknown[]) {
      if (typeof s !== 'object' || s === null) continue;
      const { itemId, rarity, count } = s as Record<string, unknown>;
      if (typeof itemId !== 'string' || !def(data, itemId) || !isRarity(rarity)) continue;
      if (typeof count !== 'number' || !Number.isInteger(count) || count <= 0) continue;
      inv = addCount(inv, itemId, rarity, count);
    }
  }
  const equipped = { ...base.equipped } as Record<ItemSlot, ItemRef | null>;
  const eqRaw = typeof r.equipped === 'object' && r.equipped !== null ? (r.equipped as Record<string, unknown>) : {};
  for (const slot of ITEM_SLOTS) {
    const e = eqRaw[slot];
    if (typeof e !== 'object' || e === null) continue;
    const { itemId, rarity } = e as Record<string, unknown>;
    if (typeof itemId !== 'string' || !isRarity(rarity)) continue;
    if (def(data, itemId)?.slot !== slot) continue;
    equipped[slot] = { itemId, rarity };
  }
  return { inventory: inv, equipped };
}
