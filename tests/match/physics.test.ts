import { describe, expect, it } from 'vitest';
import { PhysicsEngine } from '../../src/core/PhysicsEngine';
import type { Arena, PhysicsEvent, PhysicsEventType } from '../../src/match/physicsTypes';
import { Rng } from '../../src/match/rng';

function emptyArena(): Arena {
  return { bumpers: [], pillars: [], rings: [], enemies: [] };
}

/** Sem amortecimento nem anti-loop: isola a colisão. */
const PURE = { dampEarly: 1, dampLate: 1, antiLoopNudge: 0, wallRestitution: 1, ceilingRestitution: 1 } as const;

function collect(engine: PhysicsEngine, frames: number, speed = 1): PhysicsEvent[] {
  const out: PhysicsEvent[] = [];
  for (let f = 0; f < frames; f++) {
    const n = engine.step(speed);
    for (let i = 0; i < n; i++) out.push({ ...engine.getEvent(i) });
  }
  return out;
}

function types(events: PhysicsEvent[]): PhysicsEventType[] {
  return events.map((e) => e.type);
}

describe('Rng', () => {
  it('é determinístico com a mesma semente e varia com outra', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    const c = new Rng(43);
    const sa = Array.from({ length: 5 }, () => a.next());
    const sb = Array.from({ length: 5 }, () => b.next());
    const sc = Array.from({ length: 5 }, () => c.next());
    expect(sa).toEqual(sb);
    expect(sa).not.toEqual(sc);
    for (const v of sa) expect(v >= 0 && v < 1).toBe(true);
  });
});

describe('PhysicsEngine — reflexão', () => {
  it('reflete na parede lateral e no teto com v·n < 0', () => {
    const e = new PhysicsEngine(emptyArena(), new Rng(1), PURE);
    const b = e.spawnBall(10, 300, -8, 0)!;
    const ev = collect(e, 1);
    expect(types(ev)).toContain('wallHit');
    expect(b.vx).toBeCloseTo(8);
    expect(b.bounced).toBe(true);

    const e2 = new PhysicsEngine(emptyArena(), new Rng(1), PURE);
    const c = e2.spawnBall(100, 10, 0, -8)!;
    const ev2 = collect(e2, 1);
    expect(types(ev2)).toContain('ceilingHit');
    expect(c.vy).toBeCloseTo(8);
    expect(c.ceilingHit).toBe(true);
  });

  it('reflete no pilar (AABB) segundo v − 2(v·n)n', () => {
    const arena = emptyArena();
    arena.pillars.push({ x: 150, y: 100, w: 60, h: 20 });
    const e = new PhysicsEngine(arena, new Rng(1), PURE);
    const b = e.spawnBall(180, 135, 3, -6)!; // vem de baixo, normal (0, 1)
    const ev = collect(e, 2);
    expect(types(ev)).toContain('pillarHit');
    expect(b.vx).toBeCloseTo(3);
    expect(b.vy).toBeCloseTo(6);
  });

  it('não reflete quando o orbe já se afasta (v·n ≥ 0)', () => {
    const arena = emptyArena();
    arena.pillars.push({ x: 150, y: 100, w: 60, h: 20 });
    const e = new PhysicsEngine(arena, new Rng(1), PURE);
    const b = e.spawnBall(180, 124, 0, 4)!; // sobreposto, mas descendo
    const ev = collect(e, 1);
    expect(types(ev)).not.toContain('pillarHit');
    expect(b.vy).toBeCloseTo(4);
  });

  it('quica no chão com restituição 0.94 e recall() remove todos os orbes', () => {
    const e = new PhysicsEngine(emptyArena(), new Rng(1), { ...PURE, floorRestitution: 0.94 });
    const b = e.spawnBall(100, 505, 0, 10)!;
    const ev = collect(e, 3);
    expect(types(ev)).toContain('floorHit');
    expect(b.vy).toBeCloseTo(-9.4);
    expect(e.activeCount).toBe(1);
    expect(e.isSettled()).toBe(false);
    e.recall();
    expect(e.activeCount).toBe(0);
    expect(e.isSettled()).toBe(true);
  });
});

describe('PhysicsEngine — tunneling', () => {
  it('não atravessa inimigo pequeno nem pilar fino em velocidade máxima (15.5), em 1× e 2×', () => {
    for (const speed of [1, 2]) {
      const arena = emptyArena();
      arena.enemies.push({ id: 7, x: 180, y: 200, r: 4 });
      const e = new PhysicsEngine(arena, new Rng(1), PURE);
      const b = e.spawnBall(180, 400, 0, -15.5)!;
      const ev = collect(e, 30, speed);
      expect(ev.some((x) => x.type === 'enemyHit' && x.enemyId === 7)).toBe(true);
      expect(b.y).toBeGreaterThan(200);

      const arena2 = emptyArena();
      arena2.pillars.push({ x: 100, y: 200, w: 160, h: 1 });
      const e2 = new PhysicsEngine(arena2, new Rng(1), PURE);
      const c = e2.spawnBall(180, 400, 0, -15.5)!;
      const ev2 = collect(e2, 30, speed);
      expect(types(ev2)).toContain('pillarHit');
      expect(c.y).toBeGreaterThan(200);
    }
  });
});

describe('PhysicsEngine — escudo frontal', () => {
  function shieldArena(): Arena {
    const a = emptyArena();
    a.enemies.push({ id: 1, x: 180, y: 200, r: 16, frontShield: { minNormalY: 0.3 } });
    return a;
  }

  it('bloqueia impacto vindo de baixo (n_y > minNormalY) e reflete', () => {
    const e = new PhysicsEngine(shieldArena(), new Rng(1), PURE);
    const b = e.spawnBall(180, 260, 0, -8)!;
    const hits = collect(e, 20).filter((x) => x.type === 'enemyHit');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]!.blocked).toBe(true);
    expect(b.vy).toBeGreaterThan(0);
  });

  it('não bloqueia impacto vindo de cima', () => {
    const e = new PhysicsEngine(shieldArena(), new Rng(1), PURE);
    const b = e.spawnBall(180, 140, 0, 8)!;
    const hits = collect(e, 20).filter((x) => x.type === 'enemyHit');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]!.blocked).toBe(false);
    expect(b.vy).toBeLessThan(0);
  });
});

describe('PhysicsEngine — bumper', () => {
  it('acelera 15% e respeita o teto de 15.5', () => {
    const arena = emptyArena();
    arena.bumpers.push({ x: 180, y: 200, r: 14 });
    const e = new PhysicsEngine(arena, new Rng(1), PURE);
    const b = e.spawnBall(180, 240, 0, -10)!;
    collect(e, 10);
    expect(Math.hypot(b.vx, b.vy)).toBeCloseTo(11.5);

    const e2 = new PhysicsEngine(arena, new Rng(1), PURE);
    const c = e2.spawnBall(180, 240, 0, -15)!;
    const ev = collect(e2, 10);
    expect(types(ev)).toContain('bumperHit');
    expect(Math.hypot(c.vx, c.vy)).toBeCloseTo(15.5);
  });
});

describe('PhysicsEngine — amortecimento', () => {
  it('aplica γ^(1/N) por sub-passo e γ tardio após 340 ticks', () => {
    const e = new PhysicsEngine(emptyArena(), new Rng(1), { antiLoopNudge: 0 });
    const b = e.spawnBall(180, 260, 0, 0.0001)!;
    b.vx = 0;
    b.vy = 1;
    e.step();
    expect(b.vy).toBeCloseTo(0.9935, 10);
    for (let i = 1; i < 340; i++) e.step();
    const before = b.vy;
    e.step();
    expect(b.vy / before).toBeCloseTo(0.962, 10);
  });

  it('o voo termina (todos os orbes param) mesmo em arena fechada', () => {
    const arena = emptyArena();
    arena.bumpers.push({ x: 90, y: 150, r: 14 }, { x: 270, y: 150, r: 14 });
    arena.pillars.push({ x: 150, y: 260, w: 60, h: 18 });
    const e = new PhysicsEngine(arena, new Rng(3), { worldHeight: 100000 });
    e.launch(180, 468, -1.2, 13.3, 5);
    let frames = 0;
    while (!e.isSettled() && frames < 5000) {
      e.step();
      frames++;
    }
    expect(e.isSettled()).toBe(true);
    expect(frames).toBeLessThan(1000);
  });
});

describe('PhysicsEngine — anel, teto de orbes e determinismo', () => {
  it('anel gera 1 clone temporário por orbe original', () => {
    const arena = emptyArena();
    arena.rings.push({ x: 180, y: 300, r: 20 });
    const e = new PhysicsEngine(arena, new Rng(5), PURE);
    e.spawnBall(180, 340, 0, -8);
    const passes = collect(e, 20).filter((x) => x.type === 'ringPass');
    expect(passes.length).toBe(1);
    expect(passes[0]!.cloneId).toBeGreaterThanOrEqual(0);
    expect(e.activeCount).toBe(2);
    const clone = e.getBall(1);
    expect(clone.temp).toBe(true);
    expect(clone.ringUsed).toBe(true);
  });

  it('respeita o teto de 28 orbes (clone pedido e recusado)', () => {
    const arena = emptyArena();
    arena.rings.push({ x: 180, y: 300, r: 30 });
    const e = new PhysicsEngine(arena, new Rng(5), PURE);
    expect(e.launch(180, 330, -Math.PI / 2, 2, 40, 0.001)).toBe(28);
    expect(e.spawnBall(10, 10, 0, 0)).toBeNull();
    const passes = collect(e, 10).filter((x) => x.type === 'ringPass');
    expect(passes.length).toBe(28);
    expect(passes.every((p) => p.cloneId === -1)).toBe(true);
    expect(e.activeCount).toBe(28);
  });

  it('mesma semente produz o mesmo resultado', () => {
    function run(seed: number): string {
      const arena: Arena = {
        bumpers: [{ x: 90, y: 180, r: 14 }],
        pillars: [{ x: 150, y: 120, w: 60, h: 18 }],
        rings: [{ x: 180, y: 330, r: 22 }, { x: 260, y: 220, r: 22 }],
        enemies: [{ id: 1, x: 120, y: 90, r: 15, frontShield: { minNormalY: 0.3 } }, { id: 2, x: 250, y: 120, r: 15 }],
      };
      const e = new PhysicsEngine(arena, new Rng(seed));
      e.launch(180, 468, -1.4, 13.3, 6);
      const ev = collect(e, 400, 2);
      const balls = Array.from({ length: e.activeCount }, (_, i) => e.getBall(i));
      return JSON.stringify({ ev, balls });
    }
    expect(run(99)).toBe(run(99));
  });
});
