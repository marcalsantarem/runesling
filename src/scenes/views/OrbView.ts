import Phaser from 'phaser';
import type { PhysicsEngine } from '../../core/PhysicsEngine';
import type { Ball } from '../../match/physicsTypes';
import { SquashSpring } from '../fx/fxMath';
import { ensureCanvasTexture } from './draw';
import { CSS } from './palette';

/** Pontos do rastro curto (slice: 7). */
const TRAIL = 7;
const TEX_R = 8;
const DEPTH = 10;

type OrbKind = 'main' | 'temp' | 'pierce';
const FILL: Record<OrbKind, string> = { main: CSS.cyan, temp: CSS.gold, pierce: '#c56cf0' };
const TRAIL_TINT: Record<OrbKind, number> = { main: 0x00cec9, temp: 0xfeca57, pierce: 0x9c6bff };
const TRAIL_ALPHA_DIV: Record<OrbKind, number> = { main: 10, temp: 12, pierce: 10 };

function kindOf(b: Ball): OrbKind {
  return b.pierce ? 'pierce' : b.temp ? 'temp' : 'main';
}

function orbTexture(scene: Phaser.Scene, kind: OrbKind, res: number): string {
  const s = TEX_R * 2 + 2;
  return ensureCanvasTexture(scene, `orb_${kind}`, s, s, res, (ctx) => {
    ctx.fillStyle = FILL[kind];
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, TEX_R - 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = CSS.white;
    ctx.lineWidth = 1.6;
    ctx.stroke();
  });
}

interface Slot {
  head: Phaser.GameObjects.Image;
  dots: Phaser.GameObjects.Image[];
  /** Rastro em anel: pares (x, y). */
  trail: Float32Array;
  count: number;
  next: number;
  kind: OrbKind | null;
  /** Id do orbe da física neste slot (-1 = vazio) e squash elástico do quique. */
  id: number;
  spring: SquashSpring;
}

/**
 * Orbes em voo + rastro curto. Pool fixo de `maxBalls` slots (sem alocação por frame).
 * Os índices do pool da física são estáveis durante o voo (clones entram no fim).
 */
export class OrbView {
  private readonly slots: Slot[] = [];
  private readonly keys: Record<OrbKind, string>;
  private active = 0;

  constructor(scene: Phaser.Scene, maxBalls: number, res: number) {
    this.keys = { main: orbTexture(scene, 'main', res), temp: orbTexture(scene, 'temp', res), pierce: orbTexture(scene, 'pierce', res) };
    const dotKey = ensureCanvasTexture(scene, 'fx_dot', 8, 8, res, (ctx) => {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(4, 4, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    for (let i = 0; i < maxBalls; i++) {
      const dots: Phaser.GameObjects.Image[] = [];
      for (let k = 0; k < TRAIL; k++) dots.push(scene.add.image(0, 0, dotKey).setVisible(false).setDepth(DEPTH));
      const head = scene.add.image(0, 0, this.keys.main).setVisible(false).setDepth(DEPTH);
      this.slots.push({ head, dots, trail: new Float32Array(TRAIL * 2), count: 0, next: 0, kind: null, id: -1, spring: new SquashSpring() });
    }
  }

  /** Zera os rastros (novo lançamento). */
  reset(): void {
    for (const s of this.slots) {
      s.count = s.next = 0;
      s.id = -1;
      s.spring.reset();
    }
  }

  /** Quique do orbe `ballId` (id da física): squash elástico. Ignora orbe sem slot. */
  impact(ballId: number, strength: number): void {
    for (let i = 0; i < this.active; i++) {
      const s = this.slots[i]!;
      if (s.id === ballId) {
        s.spring.kick(strength);
        return;
      }
    }
  }

  setReducedMotion(on: boolean): void {
    for (const s of this.slots) s.spring.reduced = on;
  }

  /** `frames` > 0: grava um ponto de rastro por frame lógico. */
  update(engine: PhysicsEngine, frames: number): void {
    const n = Math.min(engine.activeCount, this.slots.length);
    for (let i = 0; i < n; i++) {
      const b = engine.getBall(i);
      const s = this.slots[i]!;
      const kind = kindOf(b);
      if (s.id !== b.id) {
        // O pool da física compacta ao remover orbes: o slot passou a outro orbe.
        s.id = b.id;
        s.spring.reset();
      }
      s.spring.step(frames);
      if (s.kind !== kind) {
        s.kind = kind;
        s.head.setTexture(this.keys[kind]);
        for (const d of s.dots) d.setTint(TRAIL_TINT[kind]);
      }
      if (frames > 0) {
        s.trail[s.next * 2] = b.x;
        s.trail[s.next * 2 + 1] = b.y;
        s.next = (s.next + 1) % TRAIL;
        if (s.count < TRAIL) s.count++;
      }
      // Do mais antigo (k = 0, mais fraco) ao mais novo.
      const div = TRAIL_ALPHA_DIV[kind];
      for (let k = 0; k < TRAIL; k++) {
        const d = s.dots[k]!;
        if (k >= s.count) {
          if (d.visible) d.setVisible(false);
          continue;
        }
        const idx = (s.next - s.count + k + TRAIL) % TRAIL;
        const rr = Math.max(0.5, b.r * (k / s.count) * 0.85);
        d.setPosition(s.trail[idx * 2]!, s.trail[idx * 2 + 1]!).setDisplaySize(rr * 2, rr * 2).setAlpha(k / div).setVisible(true);
      }
      const size = (b.r / (TEX_R - 0.8)) * (TEX_R * 2 + 2);
      // Squash ao longo da velocidade (achata na direção do quique, alarga no través).
      const sp = s.spring;
      if (sp.active) s.head.setRotation(Math.atan2(b.vy, b.vx)).setDisplaySize(size * sp.scaleY, size * sp.scaleX);
      else s.head.setDisplaySize(size, size);
      s.head.setPosition(b.x, b.y);
      if (!s.head.visible) s.head.setVisible(true);
    }
    for (let i = n; i < this.active; i++) this.hide(this.slots[i]!);
    this.active = n;
  }

  private hide(s: Slot): void {
    s.head.setVisible(false);
    for (const d of s.dots) d.setVisible(false);
    s.count = s.next = 0;
    s.id = -1;
    s.spring.reset();
  }
}
