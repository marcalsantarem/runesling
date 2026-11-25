/**
 * PhysicsEngine: física vetorial própria com sub-passos (GDD §2.3, §3.4). TS puro, sem Phaser.
 * Não calcula dano: emite eventos por sub-passo para o CombatResolver consumir.
 * Sem alocação no laço: orbes e eventos vêm de pools pré-alocados.
 */
import { fanAngle } from '../match/aim';
import {
  DEFAULT_PHYSICS_CONFIG,
  type Arena,
  type Ball,
  type PhysicsConfig,
  type PhysicsEvent,
  type PhysicsEventType,
} from '../match/physicsTypes';
import type { RandomSource } from '../match/rng';

const EPS_CIRCLE = 0.001;
const EPS_AABB = 0.0001;
const INITIAL_EVENT_CAPACITY = 256;

function makeBall(): Ball {
  return { id: -1, x: 0, y: 0, vx: 0, vy: 0, r: 0, bounced: false, temp: false, ringUsed: false, ceilingHit: false };
}

function makeEvent(): PhysicsEvent {
  return { type: 'wallHit', ballId: -1, index: -1, enemyId: -1, cloneId: -1, blocked: false, x: 0, y: 0 };
}

export class PhysicsEngine {
  readonly config: Readonly<PhysicsConfig>;
  private arena: Arena;
  private readonly rng: RandomSource;

  /** Pool fixo de orbes; os `ballCount` primeiros estão ativos. */
  private readonly pool: Ball[];
  private ballCount = 0;
  private nextBallId = 0;

  private readonly eventPool: PhysicsEvent[] = [];
  private eventCount = 0;

  /** Frames lógicos desde o lançamento (um por ciclo de N sub-passos). */
  flightTicks = 0;

  constructor(arena: Arena, rng: RandomSource, config: Partial<PhysicsConfig> = {}) {
    this.config = Object.freeze({ ...DEFAULT_PHYSICS_CONFIG, ...config });
    this.arena = arena;
    this.rng = rng;
    this.pool = [];
    for (let i = 0; i < this.config.maxBalls; i++) this.pool.push(makeBall());
    for (let i = 0; i < INITIAL_EVENT_CAPACITY; i++) this.eventPool.push(makeEvent());
  }

  setArena(arena: Arena): void {
    this.arena = arena;
  }

  getArena(): Arena {
    return this.arena;
  }

  /** Remove um inimigo morto da arena (por id). */
  removeEnemy(enemyId: number): void {
    const list = this.arena.enemies;
    for (let i = 0; i < list.length; i++) {
      if (list[i]!.id === enemyId) {
        list.splice(i, 1);
        return;
      }
    }
  }

  get activeCount(): number {
    return this.ballCount;
  }

  /** Orbe ativo i (0 ≤ i < activeCount). Referência viva do pool. */
  getBall(i: number): Ball {
    return this.pool[i]!;
  }

  get eventsCount(): number {
    return this.eventCount;
  }

  /** Evento i do último step(). Objeto reutilizado: copie se precisar guardar. */
  getEvent(i: number): PhysicsEvent {
    return this.eventPool[i]!;
  }

  /**
   * Adiciona um orbe. Retorna o orbe ou null se o teto de orbes foi atingido.
   */
  spawnBall(x: number, y: number, vx: number, vy: number, r: number = this.config.ballRadius, temp = false): Ball | null {
    if (this.ballCount >= this.config.maxBalls) return null;
    const b = this.pool[this.ballCount++]!;
    b.id = this.nextBallId++;
    b.x = x;
    b.y = y;
    b.vx = vx;
    b.vy = vy;
    b.r = r;
    b.bounced = false;
    b.temp = temp;
    b.ringUsed = temp;
    b.ceilingHit = false;
    return b;
  }

  /** Lança `count` orbes em leque simétrico; zera orbes anteriores e o contador de ticks. */
  launch(x: number, y: number, angle: number, power: number, count: number, spread?: number): number {
    this.clear();
    this.flightTicks = 0;
    let n = 0;
    for (let i = 0; i < count; i++) {
      const a = spread === undefined ? fanAngle(angle, i, count) : fanAngle(angle, i, count, spread);
      if (this.spawnBall(x, y, Math.cos(a) * power, Math.sin(a) * power)) n++;
    }
    return n;
  }

  /** Remove todos os orbes (botão Recolher / fim de turno). */
  clear(): void {
    this.ballCount = 0;
    this.eventCount = 0;
  }

  /** Verdadeiro quando não há orbes ou todos estão abaixo de stopSpeed. */
  isSettled(): boolean {
    const stop = this.config.stopSpeed;
    for (let i = 0; i < this.ballCount; i++) {
      const b = this.pool[i]!;
      if (Math.hypot(b.vx, b.vy) > stop) return false;
    }
    return true;
  }

  /**
   * Avança um frame. speedMultiplier 2 = 2 ciclos de N sub-passos.
   * Retorna o número de eventos emitidos (ler com getEvent).
   */
  step(speedMultiplier = 1): number {
    this.eventCount = 0;
    const cycles = Math.max(1, Math.round(speedMultiplier));
    for (let c = 0; c < cycles; c++) this.cycle();
    return this.eventCount;
  }

  private cycle(): void {
    const cfg = this.config;
    this.flightTicks++;
    const damp = this.flightTicks > cfg.dampSwitchTick ? cfg.dampLate : cfg.dampEarly;
    const N = cfg.subSteps;
    const subDamp = Math.pow(damp, 1 / N);
    // Clones criados neste ciclo entram no fim do pool e só se movem no próximo ciclo.
    const count = this.ballCount;
    let lost = false;

    for (let i = 0; i < count; i++) {
      const b = this.pool[i]!;
      for (let s = 0; s < N; s++) {
        if (this.subStep(b, subDamp, N)) {
          lost = true;
          break;
        }
      }
    }

    if (lost) this.compact();
  }

  /** Um sub-passo de um orbe. Retorna true se o orbe saiu pelo chão. */
  private subStep(b: Ball, subDamp: number, N: number): boolean {
    const cfg = this.config;
    const W = cfg.worldWidth;
    const H = cfg.worldHeight;

    b.x += b.vx / N;
    b.y += b.vy / N;
    b.vx *= subDamp;
    b.vy *= subDamp;

    // Anti-loop horizontal
    if (Math.abs(b.vy) < cfg.antiLoopMaxVy && Math.abs(b.vx) > cfg.antiLoopMinVx) {
      b.vy += b.y < H / 2 ? cfg.antiLoopNudge : -cfg.antiLoopNudge;
    }

    // Paredes laterais (normal ±x; reflete só se v·n < 0)
    if (b.x < b.r) {
      b.x = b.r;
      if (b.vx < 0) b.vx = -b.vx * cfg.wallRestitution;
      b.bounced = true;
      this.emit('wallHit', b);
    } else if (b.x > W - b.r) {
      b.x = W - b.r;
      if (b.vx > 0) b.vx = -b.vx * cfg.wallRestitution;
      b.bounced = true;
      this.emit('wallHit', b);
    }

    // Teto
    if (b.y < b.r) {
      b.y = b.r;
      if (b.vy < 0) b.vy = -b.vy * cfg.wallRestitution;
      b.bounced = true;
      b.ceilingHit = true;
      this.emit('ceilingHit', b);
    }

    // Chão: saída encerra o orbe
    if (b.y - b.r > H) {
      this.emit('ballLost', b);
      b.id = -1;
      return true;
    }

    this.collideRings(b);
    this.collideBumpers(b);
    this.collidePillars(b);
    this.collideEnemies(b);
    return false;
  }

  private collideRings(b: Ball): void {
    if (b.ringUsed) return;
    const rings = this.arena.rings;
    const cfg = this.config;
    for (let k = 0; k < rings.length; k++) {
      const rg = rings[k]!;
      if (Math.hypot(b.x - rg.x, b.y - rg.y) >= rg.r) continue;
      b.ringUsed = true;
      let cloneId = -1;
      if (this.ballCount < cfg.maxBalls) {
        const ang = Math.atan2(b.vy, b.vx) + (this.rng.next() > 0.5 ? cfg.cloneAngle : -cfg.cloneAngle);
        const spd = Math.hypot(b.vx, b.vy);
        const c = this.spawnBall(b.x, b.y, Math.cos(ang) * spd, Math.sin(ang) * spd, cfg.cloneRadius, true);
        if (c) {
          c.bounced = b.bounced;
          cloneId = c.id;
        }
      }
      const e = this.emit('ringPass', b);
      e.index = k;
      e.cloneId = cloneId;
      return;
    }
  }

  private collideBumpers(b: Ball): void {
    const bumpers = this.arena.bumpers;
    const cfg = this.config;
    for (let k = 0; k < bumpers.length; k++) {
      const bp = bumpers[k]!;
      const dx = b.x - bp.x;
      const dy = b.y - bp.y;
      const dist = Math.hypot(dx, dy);
      if (dist >= b.r + bp.r || dist <= EPS_CIRCLE) continue;
      const nx = dx / dist;
      const ny = dy / dist;
      const spd = Math.min(cfg.bumperMaxSpeed, Math.max(cfg.bumperMinSpeed, Math.hypot(b.vx, b.vy) * cfg.bumperBoost));
      b.vx = nx * spd;
      b.vy = ny * spd;
      b.x = bp.x + nx * (b.r + bp.r + cfg.bumperGap);
      b.y = bp.y + ny * (b.r + bp.r + cfg.bumperGap);
      b.bounced = true;
      this.emit('bumperHit', b).index = k;
    }
  }

  private collidePillars(b: Ball): void {
    const pillars = this.arena.pillars;
    const gap = this.config.pillarGap;
    for (let k = 0; k < pillars.length; k++) {
      const pl = pillars[k]!;
      const cx = Math.max(pl.x, Math.min(b.x, pl.x + pl.w));
      const cy = Math.max(pl.y, Math.min(b.y, pl.y + pl.h));
      let nx: number;
      let ny: number;
      let px: number;
      let py: number;
      const pdx = b.x - cx;
      const pdy = b.y - cy;
      const pdist = Math.hypot(pdx, pdy);
      if (pdist > EPS_AABB) {
        if (pdist >= b.r) continue;
        nx = pdx / pdist;
        ny = pdy / pdist;
        px = cx;
        py = cy;
      } else {
        // Centro dentro do AABB: sai pela face mais próxima.
        const dl = b.x - pl.x;
        const dr = pl.x + pl.w - b.x;
        const dt = b.y - pl.y;
        const db = pl.y + pl.h - b.y;
        const m = Math.min(dl, dr, dt, db);
        nx = 0;
        ny = 0;
        px = b.x;
        py = b.y;
        if (m === dl) {
          nx = -1;
          px = pl.x;
        } else if (m === dr) {
          nx = 1;
          px = pl.x + pl.w;
        } else if (m === dt) {
          ny = -1;
          py = pl.y;
        } else {
          ny = 1;
          py = pl.y + pl.h;
        }
      }
      const dot = b.vx * nx + b.vy * ny;
      if (dot < 0) {
        b.vx -= 2 * dot * nx;
        b.vy -= 2 * dot * ny;
        b.bounced = true;
        this.emit('pillarHit', b).index = k;
      }
      b.x = px + nx * (b.r + gap);
      b.y = py + ny * (b.r + gap);
    }
  }

  private collideEnemies(b: Ball): void {
    const enemies = this.arena.enemies;
    const gap = this.config.enemyGap;
    for (let k = 0; k < enemies.length; k++) {
      const en = enemies[k]!;
      const dx = b.x - en.x;
      const dy = b.y - en.y;
      const dist = Math.hypot(dx, dy);
      if (dist >= b.r + en.r || dist <= EPS_CIRCLE) continue;
      const nx = dx / dist;
      const ny = dy / dist;
      const blocked = en.frontShield !== undefined && ny > en.frontShield.minNormalY;
      const dot = b.vx * nx + b.vy * ny;
      if (dot < 0) {
        b.vx -= 2 * dot * nx;
        b.vy -= 2 * dot * ny;
      }
      b.x = en.x + nx * (b.r + en.r + gap);
      b.y = en.y + ny * (b.r + en.r + gap);
      const e = this.emit('enemyHit', b);
      e.enemyId = en.id;
      e.blocked = blocked;
    }
  }

  private emit(type: PhysicsEventType, b: Ball): PhysicsEvent {
    if (this.eventCount >= this.eventPool.length) {
      // Cresce só quando a capacidade é excedida (raro); não aloca em regime.
      const n = this.eventPool.length;
      for (let i = 0; i < n; i++) this.eventPool.push(makeEvent());
    }
    const e = this.eventPool[this.eventCount++]!;
    e.type = type;
    e.ballId = b.id;
    e.index = -1;
    e.enemyId = -1;
    e.cloneId = -1;
    e.blocked = false;
    e.x = b.x;
    e.y = b.y;
    return e;
  }

  /** Remove orbes perdidos (id = −1) preservando a ordem; troca referências sem alocar. */
  private compact(): void {
    let w = 0;
    for (let r = 0; r < this.ballCount; r++) {
      const b = this.pool[r]!;
      if (b.id === -1) continue;
      if (w !== r) {
        const tmp = this.pool[w]!;
        this.pool[w] = b;
        this.pool[r] = tmp;
      }
      w++;
    }
    this.ballCount = w;
  }
}
