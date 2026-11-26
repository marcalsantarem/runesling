import Phaser from 'phaser';
import type { Circle } from '../../data/types';
import { FONT_UI_STACK } from '../../core/fonts';
import { ensureCanvasTexture } from './draw';
import { COLOR, CSS } from './palette';
import { ATLAS_ENEMIES, circleObstacleScale, FRAME_RING, hasTexture } from './sprites';

const HIT_FRAMES = 10;
const SPIN = 0.0018; // rad/ms (slice)

/** Anel multiplicador ×2 girando por código: sprite `obstacle_ring_multiplier` do atlas ou tracejado dourado (`ring_<r>`). */
export class RingView {
  private readonly img: Phaser.GameObjects.Image;
  /** Escala base (sprite) ou tamanho de exibição (procedural). */
  private readonly size: number;
  private readonly sprite: boolean;
  private readonly hitScale: number;
  private hit = 0;

  constructor(scene: Phaser.Scene, c: Circle, res: number) {
    this.hitScale = (c.r + 3) / c.r;
    this.sprite = hasTexture(scene.textures, ATLAS_ENEMIES, FRAME_RING);
    if (this.sprite) {
      this.img = scene.add.image(c.x, c.y, ATLAS_ENEMIES, FRAME_RING);
      this.size = circleObstacleScale(c.r, this.img.frame.realWidth);
      this.img.setScale(this.size);
    } else {
      this.img = this.proceduralRing(scene, c, res);
      this.size = (c.r + 6) * 2;
    }
    scene.add
      .text(c.x, c.y, '×2', { fontFamily: FONT_UI_STACK, fontSize: '10px', fontStyle: '800', color: CSS.gold, resolution: res })
      .setOrigin(0.5)
      .setAlpha(0.85);
  }

  private proceduralRing(scene: Phaser.Scene, c: Circle, res: number): Phaser.GameObjects.Image {
    const s = (c.r + 6) * 2;
    const key = ensureCanvasTexture(scene, `ring_${c.r}`, s, s, res, (ctx) => {
      ctx.translate(s / 2, s / 2);
      ctx.strokeStyle = CSS.white;
      ctx.lineWidth = 2.2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, c.r, 0, Math.PI * 2);
      ctx.stroke();
    });
    return scene.add.image(c.x, c.y, key).setDisplaySize(s, s).setTint(COLOR.gold);
  }

  flash(): void {
    if (this.hit === 0) this.show(true);
    this.hit = HIT_FRAMES;
  }

  update(t: number, frames: number): void {
    this.img.rotation = t * SPIN;
    if (this.hit <= 0) return;
    this.hit = Math.max(0, this.hit - frames);
    if (this.hit === 0) this.show(false);
  }

  /** Acerto: cresce e, no procedural, perde o tom dourado (fica branco); no sprite, clareia. */
  private show(hit: boolean): void {
    const k = hit ? this.hitScale : 1;
    if (this.sprite) {
      if (hit) this.img.setTintFill(COLOR.white).setAlpha(0.9);
      else this.img.clearTint().setAlpha(1);
      this.img.setScale(this.size * k);
    } else {
      if (hit) this.img.clearTint();
      else this.img.setTint(COLOR.gold);
      this.img.setDisplaySize(this.size * k, this.size * k);
    }
  }
}
