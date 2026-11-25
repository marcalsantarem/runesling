import { describe, expect, it } from 'vitest';
import { loadGameData, rawGameData, validateGameData, PERK_IDS, type GameData } from '../../src/data/types';

describe('dados do jogo (GDD §7.3)', () => {
  const data = loadGameData();

  it('carrega e valida sem erros', () => {
    expect(validateGameData(data)).toEqual([]);
  });

  it('tem os 9 inimigos do Capítulo 1', () => {
    expect(Object.keys(data.enemies).sort()).toEqual(
      ['bomb', 'boss_obsidian', 'goblin', 'healer', 'mini', 'miniboss_iron', 'shield', 'shooter', 'splitter'],
    );
  });

  it('números-chave dos inimigos batem com o GDD §3.3', () => {
    const e = data.enemies;
    expect(e.shield?.shieldArc?.minNormalY).toBe(0.3);
    expect(e.bomb?.explode).toEqual({ radiusPx: 92, atkRatio: 2.5 });
    expect(e.splitter?.split?.offsetsXPx).toEqual([-20, 20]);
    expect(e.healer?.heal?.maxHpRatio).toBe(0.22);
    expect(e.healer?.heal?.rangePx).toBe(130);
    expect(e.miniboss_iron?.advancePx).toBe(22);
    expect(e.miniboss_iron?.barrierDmg).toBe(4);
    expect(e.miniboss_iron?.barrierRecoilPx).toBe(72);
    expect(e.boss_obsidian?.shoot).toEqual({ cooldown: 2, damage: 2 });
  });

  it('tem as 15 runas; só as de núcleo são repetíveis', () => {
    expect(Object.keys(data.perks).sort()).toEqual([...PERK_IDS].sort());
    const rep = Object.values(data.perks).filter((p) => p.repeatable).map((p) => p.id).sort();
    expect(rep).toEqual(['bastion_heal', 'extra_orb', 'power_surge']);
    expect(data.perks.chain_lightning.params.chance).toBe(0.45);
  });

  it('capítulo 1 referencia arena, chefes e ondas de draft', () => {
    const c = data.chapters.chapter_1!;
    expect(c.arenaId).toBe('arena_crypt_standard');
    expect(c.totalWaves).toBe(15);
    expect(c.draftWaves).toEqual([2, 4, 6, 7, 9, 11, 13]);
    expect(c.fixedSpawns['7']).toEqual(['miniboss_iron']);
    expect(c.fixedSpawns['15']).toEqual(['boss_obsidian']);
  });

  it('arena e regras globais seguem o contrato', () => {
    const a = data.arenas.arena_crypt_standard!;
    expect(a.launch).toEqual({ x: 180, y: 468 });
    expect(a.barrierY).toBe(436);
    expect(data.rules.maxActiveOrbs).toBe(28);
    expect(data.rules.victoryGoldBonus).toBe(60);
    expect(data.rules.damage).toEqual({ minDamage: 1, ricochetMult: 2, tempCloneMult: 0.7, critMult: 1.75, shockMult: 1.35 });
  });

  it('detecta referências cruzadas quebradas', () => {
    const raw = rawGameData();
    const ch = raw.chapters.chapter_1!;
    const broken: GameData = {
      ...raw,
      enemies: {
        ...raw.enemies,
        splitter: { ...raw.enemies.splitter!, split: { ...raw.enemies.splitter!.split!, spawnId: 'nope' } },
      },
      chapters: {
        chapter_1: {
          ...ch,
          arenaId: 'arena_x',
          fixedSpawns: { '7': ['miniboss'] },
          poolByWave: [{ fromWave: 1, weights: { orc: 10 } }],
          perkPool: ['laser'],
          draftWaves: [16],
        },
      },
    };
    const errs = validateGameData(broken).join('\n');
    for (const s of ['"nope"', 'arena_x', '"miniboss"', '"orc"', '"laser"', 'onda 16']) expect(errs).toContain(s);
  });
});
