/** Perfil persistente do jogador: banco de ouro, progresso, talentos (GDD §5.1) e ajustes. */
import { SaveManager, type SaveStorage } from '../core/SaveManager';
import { loadGameData, type GameData } from '../data/types';
import type talentsJson from '../data/talents.json';
import type { ItemRarity, ItemSlot } from '../data/types';
import type { RandomSource } from '../match/rng';
import { talentCost as talentCostFormula } from './formulas';
import * as itemsLogic from './items';
import { emptyItems, sanitizeItems, type ItemRef, type ItemsState } from './items';

export type TalentId = keyof typeof talentsJson;

/** Preferência de "Reduzir movimento": seguir o sistema, sempre ligado ou sempre desligado. */
export type ReducedMotionPref = 'system' | 'on' | 'off';
export const REDUCED_MOTION_PREFS: readonly ReducedMotionPref[] = ['system', 'on', 'off'];

export interface PlayerSettings {
  readonly muted: boolean;
  /** Volume dos efeitos, 0–1 (decisão 42). */
  readonly sfxVolume: number;
  readonly reducedMotion: ReducedMotionPref;
}

export const DEFAULT_SETTINGS: PlayerSettings = Object.freeze<PlayerSettings>({ muted: false, sfxVolume: 0.8, reducedMotion: 'system' });

/** Movimento reduzido efetivo: `on`, ou `system` com `prefers-reduced-motion` do sistema. */
export function effectiveReducedMotion(pref: ReducedMotionPref, systemPrefers: boolean): boolean {
  return pref === 'on' || (pref === 'system' && systemPrefers);
}

export interface PlayerData {
  readonly gold: number;
  readonly bestWave: number;
  readonly cleared: boolean;
  readonly talents: Readonly<Record<TalentId, number>>;
  readonly settings: PlayerSettings;
  /** Inventário e equipados (M8; contrato de itens). */
  readonly items: ItemsState;
}

export interface RunResult {
  /** Onda alcançada na expedição. */
  wave: number;
  won: boolean;
  /** Ouro final da partida, já com Cobiça e bônus de vitória (decisão 17). */
  goldEarned: number;
}

/** Versão do formato do save. Decisão 26: o save do vertical slice não é migrado. v2 (M8): itens. */
export const PROFILE_SAVE_VERSION = 2;

/** v1 → v2: mesmo perfil, inventário vazio. O sanitize completa o resto. */
export function migrateProfile(raw: unknown, fromVersion: number): unknown {
  if (fromVersion === 1 && typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
    return { ...(raw as Record<string, unknown>), items: emptyItems() };
  }
  return null;
}
/** Ouro inicial, igual ao do vertical slice v0.1. */
export const STARTING_GOLD = 40;

export interface ProfileOptions {
  storage?: SaveStorage;
  key?: string;
  data?: GameData;
}

function talentIds(data: GameData): TalentId[] {
  return Object.keys(data.talents) as TalentId[];
}

function freeze(d: PlayerData): Readonly<PlayerData> {
  Object.freeze(d.talents);
  Object.freeze(d.settings);
  Object.freeze(d.items);
  return Object.freeze(d);
}

function defaults(data: GameData): PlayerData {
  const talents = {} as Record<TalentId, number>;
  for (const id of talentIds(data)) talents[id] = 0;
  return { gold: STARTING_GOLD, bestWave: 0, cleared: false, talents, settings: { ...DEFAULT_SETTINGS }, items: emptyItems() };
}

const isNonNegInt = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0;

const isVolume = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1;

/** Saneia dados lidos do storage: campo inválido volta ao padrão; níveis limitados a [0, máx]. */
function sanitize(raw: unknown, data: GameData): PlayerData {
  const base = defaults(data);
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return base;
  const r = raw as Record<string, unknown>;
  const talentsRaw =
    typeof r.talents === 'object' && r.talents !== null ? (r.talents as Record<string, unknown>) : {};
  const talents = { ...base.talents };
  for (const id of talentIds(data)) {
    const lv = talentsRaw[id];
    const max = data.talents[id]?.maxLevel ?? 0;
    if (isNonNegInt(lv)) talents[id] = Math.min(lv, max);
  }
  const settingsRaw =
    typeof r.settings === 'object' && r.settings !== null ? (r.settings as Record<string, unknown>) : {};
  return {
    gold: isNonNegInt(r.gold) ? r.gold : base.gold,
    bestWave: isNonNegInt(r.bestWave) ? r.bestWave : base.bestWave,
    cleared: typeof r.cleared === 'boolean' ? r.cleared : base.cleared,
    talents,
    // Save antigo (só `muted`) ganha os padrões dos campos novos.
    settings: {
      muted: typeof settingsRaw.muted === 'boolean' ? settingsRaw.muted : base.settings.muted,
      sfxVolume: isVolume(settingsRaw.sfxVolume) ? settingsRaw.sfxVolume : base.settings.sfxVolume,
      reducedMotion: REDUCED_MOTION_PREFS.includes(settingsRaw.reducedMotion as ReducedMotionPref)
        ? (settingsRaw.reducedMotion as ReducedMotionPref)
        : base.settings.reducedMotion,
    },
    items: sanitizeItems(r.items, data),
  };
}

export class PlayerProfile {
  private state: Readonly<PlayerData>;
  private readonly listeners = new Set<(data: Readonly<PlayerData>) => void>();
  private writing: Promise<void> = Promise.resolve();

  private constructor(
    private readonly save: SaveManager<unknown>,
    private readonly game: GameData,
    initial: PlayerData,
  ) {
    this.state = freeze(initial);
  }

  /** Carrega o perfil do storage. Save ausente, corrompido ou ilegível → padrões. */
  static async load(options: ProfileOptions = {}): Promise<PlayerProfile> {
    const game = options.data ?? loadGameData();
    const save = new SaveManager<unknown>({
      version: PROFILE_SAVE_VERSION,
      defaults: () => defaults(game),
      migrate: migrateProfile,
      ...(options.storage ? { storage: options.storage } : {}),
      ...(options.key ? { key: options.key } : {}),
    });
    let raw: unknown;
    try {
      raw = await save.load();
    } catch {
      raw = null;
    }
    return new PlayerProfile(save, game, sanitize(raw, game));
  }

  data(): Readonly<PlayerData> {
    return this.state;
  }

  talentLevel(id: TalentId): number {
    return this.state.talents[id] ?? 0;
  }

  /** Custo do próximo nível (GDD §5.1) ou null se o talento está no máximo. */
  talentCost(id: TalentId): number | null {
    const def = this.game.talents[id];
    if (!def) throw new Error(`Talento desconhecido: ${id}`);
    const lv = this.talentLevel(id);
    return lv >= def.maxLevel ? null : talentCostFormula(id, lv, this.game);
  }

  canBuy(id: TalentId): boolean {
    const cost = this.talentCost(id);
    return cost !== null && this.state.gold >= cost;
  }

  async buyTalent(id: TalentId): Promise<boolean> {
    const cost = this.talentCost(id);
    if (cost === null || this.state.gold < cost) return false;
    await this.commit({
      ...this.state,
      gold: this.state.gold - cost,
      talents: { ...this.state.talents, [id]: this.talentLevel(id) + 1 },
    });
    return true;
  }

  /** Soma o ouro ao banco, atualiza melhor onda e capítulo conquistado. */
  async recordRun({ wave, won, goldEarned }: RunResult): Promise<void> {
    if (!isNonNegInt(wave)) throw new RangeError(`Onda inválida: ${wave}`);
    if (!Number.isFinite(goldEarned) || goldEarned < 0) {
      throw new RangeError(`Ouro inválido: ${goldEarned}`);
    }
    await this.commit({
      ...this.state,
      gold: this.state.gold + Math.floor(goldEarned),
      bestWave: Math.max(this.state.bestWave, wave),
      cleared: this.state.cleared || won,
    });
  }

  /** Soma itens ganhos (drops da run) ao inventário e grava. */
  async addItems(refs: readonly ItemRef[]): Promise<void> {
    const items = itemsLogic.addItems(this.state.items, refs, this.game);
    if (items !== this.state.items) await this.commit({ ...this.state, items });
  }

  /** Equipa 1 unidade do inventário (o anterior volta). Sem a unidade → false. */
  async equipItem(itemId: string, rarity: ItemRarity): Promise<boolean> {
    return this.applyItems(itemsLogic.equip(this.state.items, itemId, rarity, this.game));
  }

  async unequipItem(slot: ItemSlot): Promise<boolean> {
    if (!this.state.items.equipped[slot]) return false;
    return this.applyItems(itemsLogic.unequip(this.state.items, slot));
  }

  canFuseItem(itemId: string, rarity: ItemRarity): boolean {
    return itemsLogic.canFuse(this.state.items, itemId, rarity, this.game);
  }

  /** Funde `fuseCount` iguais em 1 da raridade seguinte. Não pode → false. */
  async fuseItem(itemId: string, rarity: ItemRarity): Promise<boolean> {
    return this.applyItems(itemsLogic.fuse(this.state.items, itemId, rarity, this.game));
  }

  /** Compra o baú: debita o ouro e devolve o que saiu. Sem ouro → null. */
  async openChest(rng: RandomSource = { next: Math.random }): Promise<ItemRef[] | null> {
    const res = itemsLogic.openChest(this.state, rng, this.game);
    if (!res) return null;
    await this.commit({ ...this.state, gold: res.gold, items: res.items });
    return res.drops;
  }

  /** Bônus dos equipados para a partida (a T-078 soma aos talentos). */
  runLoadout(): itemsLogic.RunLoadout {
    return itemsLogic.runLoadout(this.state.items.equipped, this.game);
  }

  private async applyItems(items: ItemsState | null): Promise<boolean> {
    if (!items) return false;
    await this.commit({ ...this.state, items });
    return true;
  }

  /** Volume fora de 0–1 é limitado; valor inválido é ignorado. */
  async updateSettings(partial: Partial<PlayerSettings>): Promise<void> {
    const p: { -readonly [K in keyof PlayerSettings]?: PlayerSettings[K] } = { ...partial };
    if (p.sfxVolume !== undefined) {
      if (Number.isFinite(p.sfxVolume)) p.sfxVolume = Math.min(1, Math.max(0, p.sfxVolume));
      else delete p.sfxVolume;
    }
    if (p.reducedMotion !== undefined && !REDUCED_MOTION_PREFS.includes(p.reducedMotion)) delete p.reducedMotion;
    partial = p;
    await this.commit({ ...this.state, settings: { ...this.state.settings, ...partial } });
  }

  /**
   * Volta ao estado inicial (ouro inicial, talentos e itens zerados, melhor onda 0, capítulo não conquistado)
   * e grava no save. Mantém as configurações (som, volume, movimento). Usado pelo botão temporário da T-061.
   */
  async reset(): Promise<void> {
    await this.commit({ ...defaults(this.game), settings: { ...this.state.settings } });
  }

  /** Assina mudanças; devolve a função para cancelar. */
  onChange(cb: (data: Readonly<PlayerData>) => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private emit(): void {
    for (const cb of this.listeners) cb(this.state);
  }

  /** Atualiza o estado, avisa os ouvintes e grava (escritas em fila, na ordem). */
  private async commit(next: PlayerData): Promise<void> {
    const snapshot = freeze(next);
    this.state = snapshot;
    this.emit();
    this.writing = this.writing.then(async () => {
      try {
        await this.save.save(snapshot);
      } catch (e) {
        console.warn('[profile] falha ao gravar o save', e);
      }
    });
    await this.writing;
  }
}

let instance: Promise<PlayerProfile> | null = null;

/** Perfil único do jogo, carregado na primeira chamada. */
export function getProfile(): Promise<PlayerProfile> {
  if (!instance) {
    instance = PlayerProfile.load().catch((e: unknown) => {
      instance = null;
      throw e;
    });
  }
  return instance;
}

/** Só para testes: troca o storage do singleton (ou limpa com undefined). */
export function resetProfileForTests(options?: ProfileOptions): void {
  instance = options ? PlayerProfile.load(options) : null;
}
