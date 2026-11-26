import Phaser from 'phaser';
import type { Circle } from '../../data/types';
import { ensureCanvasTexture } from './draw';
import { CSS } from './palette';

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

/** Bumper rúnico. Texturas `bumper_<r>` e `bumper_<r>_hit`. */
export class BumperView {
  private readonly img: Phaser.GameObjects.Image;
  private readonly key: string;
  private readonly hitKey: string;
  private readonly size: number;
  private readonly scaleHit: number;
  private hit = 0;

  constructor(scene: Phaser.Scene, c: Circle, res: number) {
    const s = (c.r + 4) * 2;
    this.size = s;
    this.key = ensureCanvasTexture(scene, `bumper_${c.r}`, s, s, res, (ctx) => paintBumper(ctx, c.r, false));
    this.hitKey = ensureCanvasTexture(scene, `bumper_${c.r}_hit`, s, s, res, (ctx) => paintBumper(ctx, c.r, true));
    this.img = scene.add.image(c.x, c.y, this.key).setDisplaySize(s, s);
    this.scaleHit = (c.r + 3) / c.r;
  }

  flash(): void {
    if (this.hit === 0) this.img.setTexture(this.hitKey).setDisplaySize(this.size * this.scaleHit, this.size * this.scaleHit);
    this.hit = HIT_FRAMES;
  }

  update(frames: number): void {
    if (this.hit <= 0) return;
    this.hit = Math.max(0, this.hit - frames);
    if (this.hit === 0) this.img.setTexture(this.key).setDisplaySize(this.size, this.size);
  }
}
