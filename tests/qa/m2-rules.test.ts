/** QA M2 (BRF-011): regras sem cobertura direta, decisões 13–15 e pendências conhecidas. */
import { describe, expect, it } from 'vitest';
import { CombatResolver } from '../../src/core/CombatResolver';
import { PhysicsEngine } from '../../src/core/PhysicsEngine';
import { loadGameData, type PerkId } from '../../src/data/types';
import { Match } from '../../src/match/Match';
import type { Arena, PhysicsEvent } from '../../src/match/physicsTypes';
import { Rng, type RandomSource } from '../../src/match/rng';
import { addEnemy, createRunState, type RunState } from '../../src/match/RunState';
import { pickWeighted, poolForWave } from '../../src/match/waves';

const data = loadGameData();
const chapter = data.chapters['chapter_1']!;
const zero: RandomSource = { next: () => 0 };
const high: RandomSource = { next: () => 0.99 };

function setup(rng: RandomSource, perks: PerkId[] = []): { s: RunState; c: CombatResolver } {
  const s = createRunState(data);
  const c = new CombatResolver(s, data, chapter, rng);
  for (const p of perks) c.acquirePerk(p);
  return { s, c };
}

function hit(enemyId: number): PhysicsEvent {
  return { type: 'enemyHit', ballId: 0, index: -1, enemyId, cloneId: -1, blocked: false, x: 0, y: 0, bounced: false, temp: false };
}

function engineWith(events: PhysicsEvent[]): PhysicsEngine {
  return {
    eventsCount: events.length,
    getEvent: (i: number) => events[i]!,
    getArena: () => ({ bumpers: [], pillars: [], rings: [], enemies: [] }),
  } as unknown as PhysicsEngine;
}

function count(c: CombatResolver, type: string): number {
  let n = 0;
  for (let i = 0; i < c.eventsCount; i++) if (c.getEvent(i).type === type) n++;
  return n;
}

describe('QA M2 — decisões 13, 14 e 15', () => {
  it('decisão 13: storm_orb sem chain_lightning dá +1 orbe e nunca dispara raio', () => {
    const { s, c } = setup(zero, ['storm_orb']);
    expect(s.orbs).toBe(data.rules.runStart.orbs + 1);
    const a = addEnemy(s, data, 'goblin', 100, 100);
    addEnemy(s, data, 'goblin', 130, 100);
    c.processPhysics(engineWith([hit(a.id)]));
    expect(count(c, 'chain')).toBe(0);
  });

  it('decisão 13: com chain_lightning a chance vira 0.60 (rng 0.59 dispara, 0.61 não)', () => {
    for (const [v, n] of [[0.59, 1], [0.61, 0]] as const) {
      let k = 0;
      const vals = [0.99, v]; // crítico (falha), depois a rolagem do raio
      const { s, c } = setup({ next: () => vals[k++] ?? 0.99 }, ['chain_lightning', 'storm_orb']);
      const a = addEnemy(s, data, 'goblin', 100, 100);
      addEnemy(s, data, 'goblin', 130, 100);
      c.processPhysics(engineWith([hit(a.id)]));
      expect(count(c, 'chain')).toBe(n);
    }
  });

  it('decisão 14: ignite queima só no fim do turno em que o inimigo foi atingido', () => {
    const { s, c } = setup(high, ['ignite']);
    const a = addEnemy(s, data, 'shield', 100, 60, 15);
    c.processPhysics(engineWith([hit(a.id)]));
    const afterHit = a.hp;
    c.clearEvents();
    c.endTurn(180, 436);
    expect(afterHit - a.hp).toBe(s.atk);
    const afterBurn = a.hp;
    c.clearEvents();
    c.endTurn(180, 436); // turno sem acerto: não queima de novo
    expect(a.hp).toBe(afterBurn);
    expect(count(c, 'damage')).toBe(0);
  });

  it('decisão 15: sorteio segue os pesos de poolByWave (onda 6, 60 mil sorteios, ±1 p.p.)', () => {
    const w = poolForWave(chapter, 6);
    const total = Object.values(w).reduce((a, b) => a + b, 0);
    const rng = new Rng(15);
    const hits: Record<string, number> = {};
    const N = 60000;
    for (let i = 0; i < N; i++) {
      const id = pickWeighted(w, rng);
      hits[id] = (hits[id] ?? 0) + 1;
    }
    for (const [id, wt] of Object.entries(w)) expect(Math.abs(hits[id]! / N - wt / total)).toBeLessThan(0.01);
    expect(Object.keys(hits).sort()).toEqual(Object.keys(w).sort());
  });
});

describe('QA M2 — regras de run', () => {
  it('vitória exige o chefe e todos os inimigos restantes mortos (onda 15)', () => {
    const { s, c } = setup(high);
    s.wave = 15;
    addEnemy(s, data, 'goblin', 180, 60);
    expect(c.endTurn(180, 436)).toBe('continue');
    s.enemies.length = 0;
    expect(c.endTurn(180, 436)).toBe('won');
  });

  it('invocação respeita o teto de 10 inimigos na arena', () => {
    const { s, c } = setup(high);
    const mb = addEnemy(s, data, 'miniboss_iron', 180, 60);
    for (let i = 0; i < 9; i++) addEnemy(s, data, 'goblin', 40 + i * 30, 20);
    mb.summonCd = 1;
    c.endTurn(180, 10000);
    expect(s.enemies.length).toBe(10);
  });

  it('20 sementes: toda run termina (vitória/derrota), 7 drafts ao chegar na onda 15, e é determinística', () => {
    const sim = (seed: number) => {
      const rng = new Rng(seed);
      const m = new Match(data, 'chapter_1', rng);
      let turns = 0;
      let drafts = 0;
      while (m.state.phase !== 'won' && m.state.phase !== 'lost' && turns < 400) {
        if (m.state.phase === 'draft') {
          drafts++;
          m.pickPerk(m.state.draftOptions[0]!);
          continue;
        }
        m.launch(-Math.PI / 2 + (rng.next() - 0.5) * 2.4, 9.5 + rng.next() * 3.8);
        let f = 0;
        while (m.state.phase === 'flight') {
          m.step(2);
          if (++f > 3000) m.recall();
        }
        turns++;
      }
      return { phase: m.state.phase, wave: m.state.wave, turns, drafts, hp: m.state.hp, kills: m.state.kills, gold: m.state.gold };
    };
    for (let i = 1; i <= 20; i++) {
      const a = sim(i * 7919);
      expect(['won', 'lost']).toContain(a.phase);
      if (a.wave === 15) expect(a.drafts).toBe(7);
      expect(sim(i * 7919)).toEqual(a);
    }
  });

  it('lançamento com mais de 28 orbes é limitado a 28', () => {
    const arena: Arena = { bumpers: [], pillars: [], rings: [], enemies: [] };
    const e = new PhysicsEngine(arena, new Rng(1), { maxBalls: 28 });
    expect(e.launch(180, 468, -Math.PI / 2, 12, 40)).toBe(28);
    expect(e.activeCount).toBe(28);
  });
});

describe('QA M2 — pendências conhecidas (documentam o comportamento atual)', () => {
  it('[pendência] dano resolvido após o step(): orbe quica em inimigo já morto no mesmo frame', () => {
    const s = createRunState(data);
    const en = addEnemy(s, data, 'goblin', 180, 200);
    en.hp = 1;
    const arena: Arena = { bumpers: [], pillars: [], rings: [], enemies: s.enemies };
    const e = new PhysicsEngine(arena, new Rng(1), { dampEarly: 1, dampLate: 1, antiLoopNudge: 0 });
    const c = new CombatResolver(s, data, chapter, high);
    e.spawnBall(180, 230, 0, -10); // A: sobe e mata
    const b = e.spawnBall(180, 170, 0, 10)!; // B: desce no mesmo frame
    e.step(1);
    c.processPhysics(e);
    expect(count(c, 'kill')).toBe(1);
    expect(count(c, 'damage')).toBe(1);
    expect(b.vy).toBeLessThan(0); // B foi refletido pelo inimigo morto
  });

  it('[pendência] fire_splash com Núcleo de Magma usa 76 px (GDD) e não 60 × 1.25 = 75', () => {
    const { s, c } = setup(high, ['fire_splash', 'molten_core']);
    const a = addEnemy(s, data, 'goblin', 100, 100);
    const o = addEnemy(s, data, 'goblin', 100 + 75.5 + 17, 100); // fora de 75, dentro de 76
    o.hp = 1000;
    c.processPhysics(engineWith([hit(a.id)]));
    expect(o.hp).toBeLessThan(1000);
    let r = 0;
    for (let i = 0; i < c.eventsCount; i++) if (c.getEvent(i).source === 'splash' && c.getEvent(i).type === 'explosion') r = c.getEvent(i).radius;
    expect(r).toBe(76);
  });

  it('[interpretação] Núcleo de Magma amplia também a explosão do Golem (92 → 115 px), como no slice', () => {
    const { s, c } = setup(high, ['molten_core']);
    const g = addEnemy(s, data, 'bomb', 100, 100);
    g.hp = 0;
    c.processDeaths();
    let r = 0;
    for (let i = 0; i < c.eventsCount; i++) if (c.getEvent(i).source === 'golem') r = c.getEvent(i).radius;
    expect(r).toBe(115);
  });

  it('[interpretação] Orbe Fantasma atravessa o Cavaleiro quando o acerto não é frontal', () => {
    const s = createRunState(data);
    const k = addEnemy(s, data, 'shield', 180, 200);
    const arena: Arena = { bumpers: [], pillars: [], rings: [], enemies: s.enemies };
    const e = new PhysicsEngine(arena, new Rng(1), { dampEarly: 1, dampLate: 1, antiLoopNudge: 0 });
    const b = e.spawnBall(180, 160, 0, 6)!; // vindo de cima (n_y < 0): não bloqueia
    b.pierce = true;
    for (let i = 0; i < 14; i++) e.step(1);
    expect(b.vy).toBeGreaterThan(0); // atravessou sem refletir
    expect(b.y).toBeGreaterThan(k.y);
  });
});
