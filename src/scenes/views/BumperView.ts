import Phaser from 'phaser';
import type { Circle } from '../../data/types';
import { ensureCanvasTexture } from './draw';
import { COLOR, CSS } from './palette';
import { ATLAS_ENEMIES, circleObstacleScale, FRAME_BUMPER, hasTexture } from './sprites';

const HIT_FRAMES = 8;

function paintBumper(ctx: CanvasRenderingContext2D, r: number, hit: boolean): void {
  const c = r + 4;
  ctx.translate(c, c);
  ctx.fillStyle = hit ? CSS.cyan : '#151b33';
  ctx.strokeStyle = CSS.violet;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = hit ? CSS.white : CSS.cyan;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(8, 0);
  ctx.lineTo(0, 8);
  ctx.lineTo(-8, 0);
  ctx.closePath();
  ctx.stroke();
}

/** Bumper rúnico: sprite `obstacle_bumper_rune` do atlas ou, sem ele, texturas `bumper_<r>` e `bumper_<r>_hit`. */
export class BumperView {
  private readonly img: Phaser.GameObjects.Image;
  private readonly key: string;
  private readonly hitKey: string;
  /** Escala base (sprite) ou tamanho de exibição (procedural). */
  private readonly base: number;
  private readonly sprite: boolean;
  private readonly scaleHit: number;
  private hit = 0;

  constructor(scene: Phaser.Scene, c: Circle, res: number) {
    this.scaleHit = (c.r + 3) / c.r;
    this.sprite = hasTexture(scene.textures, ATLAS_ENEMIES, FRAME_BUMPER);
    if (this.sprite) {
      this.key = this.hitKey = ATLAS_ENEMIES;
      this.img = scene.add.image(c.x, c.y, ATLAS_ENEMIES, FRAME_BUMPER);
      this.base = circleObstacleScale(c.r, this.img.frame.realWidth);
      this.img.setScale(this.base);
      return;
    }
    const s = (c.r + 4) * 2;
    this.base = s;
    this.key = ensureCanvasTexture(scene, `bumper_${c.r}`, s, s, res, (ctx) => paintBumper(ctx, c.r, false));
    this.hitKey = ensureCanvasTexture(scene, `bumper_${c.r}_hit`, s, s, res, (ctx) => paintBumper(ctx, c.r, true));
    this.img = scene.add.image(c.x, c.y, this.key).setDisplaySize(s, s);
  }

  flash(): void {
    if (this.hit === 0) this.show(true);
    this.hit = HIT_FRAMES;
  }

  update(frames: number): void {
    if (this.hit <= 0) return;
    this.hit = Math.max(0, this.hit - frames);
    if (this.hit === 0) this.show(false);
  }

  private show(hit: boolean): void {
    const k = hit ? this.scaleHit : 1;
    if (this.sprite) {
      if (hit) this.img.setTintFill(COLOR.cyan);
      else this.img.clearTint();
      this.img.setScale(this.base * k);
    } else {
      this.img.setTexture(hit ? this.hitKey : this.key).setDisplaySize(this.base * k, this.base * k);
    }
  }
}
