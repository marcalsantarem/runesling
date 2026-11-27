/**
 * Itens na partida (T-078; contrato `docs/briefings/_contrato-m8-itens.md`, decisões 63 e 66). TS puro.
 * Converte o `RunLoadout` do perfil no que a run usa: bônus de stats (somados aos talentos),
 * dano por escola, chance de anular tiro, runas iniciais e parâmetros dos Lendários.
 */
import type { GameData, ItemSchool, PerkId } from '../data/types';
import { ITEM_SLOTS } from '../data/types';
import { itemValue, type Equipped, type RunLoadout } from '../meta/items';
import type { TalentBonus } from './RunState';

/** Os 18 `effectId` de `items.json` (um por item). */
export const LEGENDARY_EFFECT_IDS = [
  'kill_bolt',
  'first_hit_mult',
  'bounce_mult',
  'first_hit_shock',
  'hit_burn',
  'launch_extra_orb',
  'shock_crit',
  'crit_splash',
  'bounce_crit',
  'bumper_heal',
  'combo_heal',
  'ceiling_heal',
  'turn_end_bolt_shooter',
  'shooter_mult',
  'shooter_kill_heal',
  'shock_kill_gold',
  'combo_gold',
  'bounce_kill_gold',
] as const;
export type LegendaryEffectId = (typeof LEGENDARY_EFFECT_IDS)[number];

export type LegendaryParams = { readonly [k: string]: number | string };

export interface RunItems {
  /** +fração no dano dos efeitos das runas de cada escola. */
  readonly schoolDamage: Readonly<Partial<Record<ItemSchool, number>>>;
  /** Chance (0..1) de anular cada tiro de atirador na barreira. */
  readonly shotBlockChance: number;
  /** Runas dos Épicos/Lendários: adquiridas antes da onda 1. */
  readonly startRunes: readonly PerkId[];
  /** Lendários ativos (effectId → params). */
  readonly legendary: Readonly<Partial<Record<LegendaryEffectId, LegendaryParams>>>;
}

export function emptyRunItems(): RunItems {
  return { schoolDamage: {}, shotBlockChance: 0, startRunes: [], legendary: {} };
}

const isLegendaryId = (id: string): id is LegendaryEffectId => (LEGENDARY_EFFECT_IDS as readonly string[]).includes(id);

/** Parte dos stats que soma como talento (atk, maxHp, critChance, goldMult). */
export function itemStatBonus(loadout: RunLoadout | null | undefined): TalentBonus {
  const out: TalentBonus = {};
  if (!loadout) return out;
  for (const k of ['atk', 'maxHp', 'critChance', 'goldMult'] as const) {
    const v = loadout.stats[k];
    if (v) out[k] = v;
  }
  return out;
}

/** Soma dois conjuntos de bônus. */
export function mergeBonus(a: TalentBonus, b: TalentBonus): TalentBonus {
  const out: TalentBonus = { ...a };
  for (const [k, v] of Object.entries(b) as [keyof TalentBonus, number][]) out[k] = (out[k] ?? 0) + v;
  return out;
}

/**
 * Monta os efeitos de itens da run. `schoolDamage` vem por escola dos equipados (o `RunLoadout` só tem a soma);
 * effectId desconhecido é ignorado.
 */
export function runItemsFrom(loadout: RunLoadout | null | undefined, equipped: Equipped | null | undefined, data: GameData): RunItems {
  if (!loadout) return emptyRunItems();
  const schoolDamage: Partial<Record<ItemSchool, number>> = {};
  if (equipped) {
    for (const slot of ITEM_SLOTS) {
      const ref = equipped[slot];
      const it = ref ? data.items.items[ref.itemId] : undefined;
      if (!ref || !it || it.stat !== 'schoolDamage') continue;
      schoolDamage[it.school] = (schoolDamage[it.school] ?? 0) + itemValue(it, ref.rarity);
    }
  }
  const legendary: Partial<Record<LegendaryEffectId, LegendaryParams>> = {};
  for (const l of loadout.legendaryEffects) if (isLegendaryId(l.effectId)) legendary[l.effectId] = l.params;
  return {
    schoolDamage,
    shotBlockChance: loadout.stats.shotBlockChance ?? 0,
    startRunes: [...loadout.startRunes],
    legendary,
  };
}

/** Parâmetro numérico de um Lendário (0 se ausente ou não numérico). */
export function num(p: LegendaryParams, key: string): number {
  const v = p[key];
  return typeof v === 'number' ? v : 0;
}

/** Parâmetro texto de um Lendário ('' se ausente). */
export function str(p: LegendaryParams, key: string): string {
  const v = p[key];
  return typeof v === 'string' ? v : '';
}
