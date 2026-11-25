import { describe, expect, it } from 'vitest';
import { PhysicsEngine } from '../../src/core/PhysicsEngine';
import type { Arena, PhysicsEvent } from '../../src/match/physicsTypes';
import { Rng } from '../../src/match/rng';

const PURE = { dampEarly: 1, dampLate: 1, antiLoopNudge: 0, wallRestitution: 1, ceilingRestitution: 1 } as const;

function collect(engine: PhysicsEngine, frames: number): PhysicsEvent[] {
  const out: PhysicsEvent[] = [];
  for (let f = 0; f < frames; f++) {
    const n = engine.step();
    for (let i = 0; i < n; i++) out.push({ ...engine.getEvent(i) });
  }
  return out;
}

describe('PhysicsEngine — ghost_ball (pierce)', () => {
  it('atravessa inimigo sem escudo com 1 acerto e cooldown de 14 frames', () => {
    const arena: Arena = { bumpers: [], pillars: [], rings: [], enemies: [{ id: 3, x: 180, y: 200, r: 30 }] };
    const e = new PhysicsEngine(arena, new Rng(1), PURE);
    const b = e.spawnBall(180, 260, 0, -1)!;
    b.pierce = true;
    const hits = collect(e, 40).filter((x) => x.type === 'enemyHit');
    // Atravessa (vy continua negativo) e acerta a cada 14 frames enquanto sobreposto.
    expect(b.vy).toBeLessThan(0);
    expect(hits.length).toBeGreaterThanOrEqual(1);
    expect(hits.length).toBeLessThanOrEqual(3);
  });

  it('é refletido quando o escudo bloqueia', () => {
    const arena: Arena = {
      bumpers: [], pillars: [], rings: [],
      enemies: [{ id: 1, x: 180, y: 200, r: 16, frontShield: { minNormalY: 0.3 } }],
    };
    const e = new PhysicsEngine(arena, new Rng(1), PURE);
    const b = e.spawnBall(180, 260, 0, -8)!;
    b.pierce = true;
    const hits = collect(e, 20).filter((x) => x.type === 'enemyHit');
    expect(hits[0]!.blocked).toBe(true);
    expect(b.vy).toBeGreaterThan(0);
  });
});

describe('PhysicsEngine — wall_clone', () => {
  it('1º quique no teto do orbe principal cria 1 clone temporário; o 2º não', () => {
    const e = new PhysicsEngine({ bumpers: [], pillars: [], rings: [], enemies: [] }, new Rng(1), PURE);
    e.setWallClone({ radius: 6.5, vxMult: -0.9, offsetY: 4 });
    const b = e.spawnBall(100, 30, 2, -8)!;
    const ev = collect(e, 3);
    const ceil = ev.filter((x) => x.type === 'ceilingHit');
    expect(ceil.length).toBe(1);
    expect(ceil[0]!.cloneId).toBeGreaterThanOrEqual(0);
    expect(e.activeCount).toBe(2);
    const c = e.getBall(1);
    expect(c.temp).toBe(true);
    expect(c.r).toBe(6.5);
    expect(c.vx).toBeCloseTo(-1.8);
    // Segundo quique no teto: sem novo clone; clones não clonam.
    b.y = 10;
    b.vy = -8;
    c.y = 10;
    c.vy = -8;
    collect(e, 2);
    expect(e.activeCount).toBe(2);
  });
});
