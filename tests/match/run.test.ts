import { describe, expect, it } from 'vitest';
import { loadGameData } from '../../src/data/types';
import { Match } from '../../src/match/Match';
import { Rng } from '../../src/match/rng';
import { createRunState } from '../../src/match/RunState';
import { isDraftWave, poolForWave, rollDraft, spawnWave, waveSize } from '../../src/match/waves';

const data = loadGameData();
const chapter = data.chapters['chapter_1']!;

describe('Ondas', () => {
  it('waveSize, pool por onda e ondas de draft', () => {
    expect(waveSize(chapter, 1)).toBe(3);
    expect(waveSize(chapter, 6)).toBe(5);
    expect(waveSize(chapter, 14)).toBe(7);
    expect(waveSize(chapter, 7)).toBe(2);
    expect(Object.keys(poolForWave(chapter, 1))).toEqual(['goblin']);
    expect(Object.keys(poolForWave(chapter, 5)).length).toBe(4);
    expect([2, 4, 6, 7, 9, 11, 13].every((w) => isDraftWave(chapter, w))).toBe(true);
    expect(isDraftWave(chapter, 8)).toBe(false);
  });

  it('onda 7: mini-chefe fixo + 2 do pool em fixedWaveY; determinística', () => {
    const run = () => {
      const s = createRunState(data);
      s.wave = 7;
      spawnWave(s, data, chapter, 7, new Rng(11));
      return s.enemies.map((e) => ({ t: e.typeId, x: e.x, y: e.y, hp: e.hp }));
    };
    const a = run();
    expect(a.length).toBe(3);
    expect(a[0]).toMatchObject({ t: 'miniboss_iron', x: 180, y: 74 });
    for (const e of a.slice(1)) expect(e.y >= 124 && e.y <= 148).toBe(true);
    expect(run()).toEqual(a);
  });

  it('draft: 3 runas distintas; não repetíveis obtidas saem, repetíveis voltam', () => {
    const s = createRunState(data);
    const owned = ['chain_lightning', 'bumper_shock', 'static_crit', 'storm_orb', 'fire_splash', 'ignite', 'supernova',
      'molten_core', 'ghost_ball', 'ricochet_crit', 'wall_clone', 'arcane_sight', 'extra_orb'] as const;
    for (const id of owned) s.perks[id] = 1;
    const opts = rollDraft(s, data, chapter, new Rng(3));
    expect([...opts].sort()).toEqual(['bastion_heal', 'extra_orb', 'power_surge']);
    const fresh = rollDraft(createRunState(data), data, chapter, new Rng(4));
    expect(new Set(fresh).size).toBe(3);
  });
});

describe('Run simulada', () => {
  function simulate(seed: number) {
    const rng = new Rng(seed);
    const m = new Match(data, 'chapter_1', rng);
    let frames = 0;
    let turns = 0;
    while (m.state.phase !== 'won' && m.state.phase !== 'lost' && turns < 400) {
      if (m.state.phase === 'draft') {
        m.pickPerk(m.state.draftOptions[0]!);
        continue;
      }
      const angle = -Math.PI / 2 + (rng.next() - 0.5) * 2.4;
      m.launch(angle, 9.5 + rng.next() * 3.8);
      let f = 0;
      while (m.state.phase === 'flight') {
        m.step(2);
        f++;
        if (f > 3000) m.recall();
      }
      frames += f;
      turns++;
    }
    const s = m.state;
    return { phase: s.phase, wave: s.wave, turns, frames, hp: s.hp, gold: s.gold, kills: s.kills, perks: s.perkOrder.join(',') };
  }

  it('termina em vitória ou derrota e é determinística com semente fixa', () => {
    const a = simulate(2026);
    expect(['won', 'lost']).toContain(a.phase);
    expect(a.turns).toBeLessThan(400);
    expect(a.kills).toBeGreaterThan(0);
    expect(simulate(2026)).toEqual(a);
  });
});
