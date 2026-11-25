/**
 * Ondas (GDD §3.1): spawn por poolByWave/fixedSpawns/waveSize/spawnLayout, ondas de draft e sorteio de runas.
 * Toda aleatoriedade pelo RNG injetado.
 */
import type { ChapterDef, GameData, PerkId } from '../data/types';
import type { RandomSource } from './rng';
import { addEnemy, hasPerk, type RunState } from './RunState';

const FREE_X_ATTEMPTS = 25;

export function waveSize(chapter: ChapterDef, wave: number): number {
  const ws = chapter.waveSize;
  const o = ws.overrides[String(wave)];
  if (o !== undefined) return o;
  return ws.base + Math.min(ws.maxExtra, Math.floor(wave / ws.wavesPerExtra));
}

export function poolForWave(chapter: ChapterDef, wave: number): { readonly [enemyId: string]: number } {
  let weights = chapter.poolByWave[0]!.weights;
  for (const e of chapter.poolByWave) if (e.fromWave <= wave) weights = e.weights;
  return weights;
}

export function pickWeighted(weights: { readonly [id: string]: number }, rng: RandomSource): string {
  let total = 0;
  for (const k in weights) total += weights[k]!;
  let r = rng.next() * total;
  let last = '';
  for (const k in weights) {
    last = k;
    r -= weights[k]!;
    if (r < 0) return k;
  }
  return last;
}

export function isDraftWave(chapter: ChapterDef, wave: number): boolean {
  return chapter.draftWaves.includes(wave);
}

function findFreeX(state: RunState, chapter: ChapterDef, y: number, r: number, rng: RandomSource): number {
  const L = chapter.spawnLayout;
  for (let a = 0; a < FREE_X_ATTEMPTS; a++) {
    const x = L.minX + rng.next() * (L.maxX - L.minX);
    let free = true;
    for (const e of state.enemies) {
      if (Math.hypot(e.x - x, e.y - y) < e.r + r + L.minGapPx) {
        free = false;
        break;
      }
    }
    if (free) return x;
  }
  return L.minX + rng.next() * (L.maxX - L.minX);
}

/** Gera os inimigos da onda `wave` no estado. Retorna quantos foram criados. */
export function spawnWave(state: RunState, data: GameData, chapter: ChapterDef, wave: number, rng: RandomSource): number {
  const L = chapter.spawnLayout;
  const W = data.rules.world.width;
  const fixed = chapter.fixedSpawns[String(wave)];
  let n = 0;
  if (fixed) {
    for (const id of fixed) {
      const pos = L.fixedSpawnPos[id];
      addEnemy(state, data, id, pos ? pos.x : W / 2, pos ? pos.y : L.normalY[0], wave);
      n++;
    }
  }
  const [y0, y1] = fixed ? L.fixedWaveY : L.normalY;
  const weights = poolForWave(chapter, wave);
  const count = waveSize(chapter, wave);
  for (let i = 0; i < count; i++) {
    const type = pickWeighted(weights, rng);
    const y = y0 + rng.next() * (y1 - y0);
    const x = findFreeX(state, chapter, y, data.enemies[type]!.radius, rng);
    addEnemy(state, data, type, x, y, wave);
    n++;
  }
  return n;
}

/** Sorteia `count` runas distintas: repetíveis sempre elegíveis; não repetíveis só se ainda não obtidas. */
export function rollDraft(state: RunState, data: GameData, chapter: ChapterDef, rng: RandomSource, count = chapter.draftChoices): PerkId[] {
  const pool: PerkId[] = [];
  for (const id of chapter.perkPool) {
    const perk = data.perks[id as PerkId];
    if (!perk) continue;
    if (perk.repeatable || !hasPerk(state, perk.id)) pool.push(perk.id);
  }
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng.next() * (pool.length - i));
    const t = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = t;
  }
  pool.length = n;
  return pool;
}
