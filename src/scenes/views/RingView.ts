import Phaser from 'phaser';
import type { Circle } from '../../data/types';
import { FONT_UI_STACK } from '../../core/fonts';
import { ensureCanvasTexture } from './draw';
import { COLOR, CSS } from './palette';

const HIT_FRAMES = 10;
const SPIN = 0.0018; // rad/ms (slice)

/** Anel multiplicador ×2: tracejado dourado girando. Textura `ring_<r>`. */
export class RingView {
  private readonly img: Phaser.GameObjects.Image;
  private readonly size: number;
  private readonly hitScale: number;
  private hit = 0;

  constructor(scene: Phaser.Scene, c: Circle, res: number) {
    const s = (c.r + 6) * 2;
    this.size = s;
    this.hitScale = (c.r + 3) / c.r;
    const key = ensureCanvasTexture(scene, `ring_${c.r}`, s, s, res, (ctx) => {
      ctx.translate(s / 2, s / 2);
      ctx.strokeStyle = CSS.white;
      ctx.lineWidth = 2.2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, c.r, 0, Math.PI * 2);
      ctx.stroke();
    });
    this.img = scene.add.image(c.x, c.y, key).setDisplaySize(s, s).setTint(COLOR.gold);
    scene.add
      .text(c.x, c.y, '×2', { fontFamily: FONT_UI_STACK, fontSize: '10px', fontStyle: '900', color: CSS.gold, resolution: res })
      .setOrigin(0.5)
      .setAlpha(0.85);
  }

  flash(): void {
    if (this.hit === 0) this.img.clearTint().setDisplaySize(this.size * this.hitScale, this.size * this.hitScale);
    this.hit = HIT_FRAMES;
  }

  update(t: number, frames: number): void {
    this.img.rotation = t * SPIN;
    if (this.hit <= 0) return;
    this.hit = Math.max(0, this.hit - frames);
    if (this.hit === 0) this.img.setTint(COLOR.gold).setDisplaySize(this.size, this.size);
  }
}
