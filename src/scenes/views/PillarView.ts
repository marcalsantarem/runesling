import Phaser from 'phaser';
import type { Rect } from '../../data/types';
import { COLOR } from './palette';
import { ATLAS_ENEMIES, FRAME_PILLAR, hasTexture, pillarScale } from './sprites';

const HIT_FRAMES = 8;
/** Tom ciano leve no acerto do sprite (o tint multiplica: não escurece muito a pedra). */
const PILLAR_HIT_TINT = 0x9ff3f0;

/** Pilar de pedra: sprite `obstacle_pillar_obsidian` do atlas ou, sem ele, retângulo arredondado. */
export class PillarView {
  private readonly g: Phaser.GameObjects.Graphics | null;
  private readonly img: Phaser.GameObjects.Image | null;
  private readonly rect: Rect;
  private hit = 0;

  constructor(scene: Phaser.Scene, rect: Rect) {
    this.rect = rect;
    if (hasTexture(scene.textures, ATLAS_ENEMIES, FRAME_PILLAR)) {
      this.g = null;
      this.img = scene.add.image(rect.x + rect.w / 2, rect.y + rect.h / 2, ATLAS_ENEMIES, FRAME_PILLAR);
      this.img.setScale(pillarScale(rect.w, this.img.frame.realWidth));
    } else {
      this.img = null;
      this.g = scene.add.graphics();
    }
    this.draw(false);
  }

  private draw(hit: boolean): void {
    if (this.img) {
      if (hit) this.img.setTint(PILLAR_HIT_TINT);
      else this.img.clearTint();
      return;
    }
    if (!this.g) return;
    const { x, y, w, h } = this.rect;
    this.g.clear();
    this.g.fillStyle(hit ? COLOR.pillarHit : COLOR.pillar, 1);
    this.g.lineStyle(2, hit ? COLOR.cyan : COLOR.pillarRim, 1);
    this.g.fillRoundedRect(x, y, w, h, 6);
    this.g.strokeRoundedRect(x, y, w, h, 6);
  }

  flash(): void {
    if (this.hit === 0) this.draw(true);
    this.hit = HIT_FRAMES;
  }

  update(frames: number): void {
    if (this.hit <= 0) return;
    this.hit = Math.max(0, this.hit - frames);
    if (this.hit === 0) this.draw(false);
  }
}
