import Phaser from 'phaser';
import type { Rect } from '../../data/types';
import { COLOR } from './palette';

const HIT_FRAMES = 8;

/** Pilar de pedra (retângulo arredondado). */
export class PillarView {
  private readonly g: Phaser.GameObjects.Graphics;
  private readonly rect: Rect;
  private hit = 0;

  constructor(scene: Phaser.Scene, rect: Rect) {
    this.rect = rect;
    this.g = scene.add.graphics();
    this.draw(false);
  }

  private draw(hit: boolean): void {
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
