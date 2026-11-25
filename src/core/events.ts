import { EventBus } from './EventBus';
import type { PerkId } from '../data/types';

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
  'run:ended': { won: boolean; wave: number; goldEarned: number };
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
