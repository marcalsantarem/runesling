/** Fórmulas puras de meta/balanceamento. */
import { loadGameData, type GameData } from '../data/types';

/** GDD §3.2: HP_base(w) = 4 + 2.8w + 0.55w^1.32. */
export function hpBase(wave: number, data: GameData = loadGameData()): number {
  const f = data.rules.hpFormula;
  return f.base + f.linear * wave + f.powCoef * Math.pow(wave, f.powExp);
}

/** GDD §3.2: HP(k, w) = max(2, round(HP_base(w) · M_k)). */
export function enemyHp(typeId: string, wave: number, data: GameData = loadGameData()): number {
  const def = data.enemies[typeId];
  if (!def) throw new Error(`Inimigo desconhecido: ${typeId}`);
  if (!Number.isInteger(wave) || wave < 1) throw new RangeError(`Onda inválida: ${wave}`);
  return Math.max(data.rules.hpFormula.minHp, Math.round(hpBase(wave, data) * def.hpMult));
}

/**
 * GDD §5.1: Custo(L) = C_base + L · ΔC, com L = nível atual (começa em 0).
 * Lança RangeError se L fora de [0, maxLevel - 1] (talento no máximo não tem custo).
 */
export function talentCost(id: string, level: number, data: GameData = loadGameData()): number {
  const t = data.talents[id];
  if (!t) throw new Error(`Talento desconhecido: ${id}`);
  if (!Number.isInteger(level) || level < 0 || level >= t.maxLevel) {
    throw new RangeError(`Nível inválido para ${id}: ${level} (0..${t.maxLevel - 1})`);
  }
  return t.baseCost + level * t.costStep;
}
