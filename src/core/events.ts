import { EventBus } from './EventBus';
import type { ItemRarity, PerkId } from '../data/types';

/** Item ganho na run (contrato M8 de itens). */
export interface ItemDrop {
  itemId: string;
  rarity: ItemRarity;
}

/** Payload vazio (`{}`). */
export type Empty = Record<string, never>;

export type RunSpeed = 1 | 2;
export type RunPhase = 'aim' | 'flight' | 'resolving' | 'draft' | 'ended';

/** Snapshot do estado da run para o HUD. */
export interface RunState {
  hp: number;
  maxHp: number;
  atk: number;
  orbs: number;
  /** Chance de crítico (0..1). */
  crit: number;
  /** Runas adquiridas na run, na ordem de escolha (repetíveis repetem). */
  perks: PerkId[];
  wave: number;
  totalWaves: number;
  gold: number;
  speed: RunSpeed;
  phase: RunPhase;
}

/**
 * Contrato único entre o jogo (Phaser) e a UI HTML (BRF-014).
 * `app:*`, `run:*` e `draft:*`: jogo → UI. `ui:*`: UI → jogo.
 */
export type GameEvents = {
  // Jogo → UI
  'app:ready': Empty;
  'run:state': RunState;
  'run:banner': { text: string };
  'draft:open': { choices: PerkId[] };
  // Onda 7 (mini-chefe) e vitória sobre o chefe; emitido pela T-078.
  'run:itemDrop': { items: ItemDrop[]; source: 'miniboss' | 'boss' };
  // `items`: o que entra no inventário (todos os drops da run). Opcional até a T-078 emitir (ausente = nenhum).
  'run:ended': { won: boolean; wave: number; goldEarned: number; items?: ItemDrop[] };
  // UI → todos (T-049): ajustes efetivos, emitidos no início e a cada mudança. `reducedMotion` já é o valor efetivo.
  'settings:changed': { muted: boolean; sfxVolume: number; reducedMotion: boolean };
  // UI → Jogo
  'ui:startRun': Empty;
  'ui:toggleSpeed': Empty;
  'ui:recall': Empty;
  'ui:pickPerk': { perkId: PerkId };
  'ui:pause': { paused: boolean };
  'ui:quitRun': Empty;
};

export type GameEventName = keyof GameEvents;

/** Bus único do app. */
export const gameBus = new EventBus<GameEvents>();
