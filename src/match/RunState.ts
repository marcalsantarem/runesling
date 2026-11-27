/**
 * Estado da run (TS puro). Criado a partir de `rules.runStart` + bônus de talentos.
 * Inimigos implementam EnemyShape: a mesma lista é a `arena.enemies` da física.
 */
import type { EnemyDef, GameData, PerkId, TalentStat } from '../data/types';
import { enemyHp } from '../meta/formulas';
import type { EnemyShape } from './physicsTypes';

export interface EnemyState extends EnemyShape {
  readonly typeId: string;
  readonly def: EnemyDef;
  hp: number;
  maxHp: number;
  /** Choque (bumper_shock/chain_lightning): vale até o próximo lançamento. */
  shocked: boolean;
  /** Atingido por orbe com ignite: queima no fim do turno. */
  burning: boolean;
  shootCd: number;
  summonCd: number;
  /** Morte já resolvida (sai da lista ao fim da passada). */
  dead: boolean;
  /** Quiques do orbe que causou o último dano (-1 se o último dano não foi de orbe). */
  killBounces: number;
}

export type RunPhase = 'aim' | 'flight' | 'draft' | 'won' | 'lost';

export interface RunState {
  hp: number;
  maxHp: number;
  atk: number;
  orbs: number;
  critChance: number;
  goldMult: number;
  /** Ouro bruto da run (multiplicador aplicado em finalGold). */
  gold: number;
  kills: number;
  wave: number;
  turn: number;
  turnCombo: number;
  bestCombo: number;
  /** Abates no turno atual (zerado no lançamento). */
  turnKills: number;
  /** Mini-chefe abatido (drop da onda 7). */
  minibossDefeated: boolean;
  /** Quantas vezes cada perk foi obtido (repetíveis podem passar de 1). */
  perks: Partial<Record<PerkId, number>>;
  /** Ordem de obtenção (para HUD/save). */
  perkOrder: PerkId[];
  chainChanceBonus: number;
  previewBounces: number;
  enemies: EnemyState[];
  nextEnemyId: number;
  phase: RunPhase;
  draftOptions: PerkId[];
}

export type TalentBonus = Partial<Record<TalentStat, number>>;

/** Soma dos efeitos de talentos a partir dos níveis (id → nível). */
export function talentBonuses(levels: { readonly [id: string]: number }, data: GameData): TalentBonus {
  const out: TalentBonus = {};
  for (const [id, lvl] of Object.entries(levels)) {
    const t = data.talents[id];
    if (!t || lvl <= 0) continue;
    const l = Math.min(lvl, t.maxLevel);
    out[t.effect.stat] = (out[t.effect.stat] ?? 0) + l * t.effect.perLevel;
  }
  return out;
}

export function createRunState(data: GameData, bonus: TalentBonus = {}): RunState {
  const s = data.rules.runStart;
  const maxHp = s.hp + (bonus.maxHp ?? 0);
  return {
    hp: maxHp,
    maxHp,
    atk: s.atk + (bonus.atk ?? 0),
    orbs: s.orbs + (bonus.orbs ?? 0),
    critChance: s.critChance + (bonus.critChance ?? 0),
    goldMult: s.goldMult + (bonus.goldMult ?? 0),
    gold: 0,
    kills: 0,
    wave: 1,
    turn: 0,
    turnCombo: 0,
    bestCombo: 0,
    turnKills: 0,
    minibossDefeated: false,
    perks: {},
    perkOrder: [],
    chainChanceBonus: 0,
    previewBounces: 1,
    enemies: [],
    nextEnemyId: 1,
    phase: 'aim',
    draftOptions: [],
  };
}

export function hasPerk(state: RunState, id: PerkId): boolean {
  return (state.perks[id] ?? 0) > 0;
}

/** Cria um inimigo (HP por enemyHp) e o adiciona ao estado. */
export function addEnemy(state: RunState, data: GameData, typeId: string, x: number, y: number, wave = state.wave): EnemyState {
  const def = data.enemies[typeId];
  if (!def) throw new Error(`Inimigo desconhecido: ${typeId}`);
  const hp = enemyHp(typeId, wave, data);
  const en: EnemyState = {
    id: state.nextEnemyId++,
    typeId,
    def,
    x,
    y,
    r: def.radius,
    hp,
    maxHp: hp,
    shocked: false,
    burning: false,
    shootCd: def.shoot?.cooldown ?? 0,
    summonCd: def.summon?.cooldown ?? 0,
    dead: false,
    killBounces: -1,
  };
  if (def.shieldArc) en.frontShield = { minNormalY: def.shieldArc.minNormalY };
  state.enemies.push(en);
  return en;
}

/** Ouro final: round(ouro × multiplicador) + bônus de vitória fixo (decisão 17). */
export function finalGold(state: RunState, data: GameData): number {
  const bonus = state.phase === 'won' ? data.rules.victoryGoldBonus : 0;
  return Math.round(state.gold * state.goldMult) + bonus;
}
