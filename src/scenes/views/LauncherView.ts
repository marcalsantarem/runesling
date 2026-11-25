import Phaser from 'phaser';
import type { Point } from '../../data/types';
import { ensureCanvasTexture } from './draw';
import { COLOR, CSS } from './palette';

/** Lançador arcano na base: aro violeta + orbe carregado (visível só na mira). */
export class LauncherView {
  private readonly orb: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, p: Point, res: number) {
    scene.add.graphics().setDepth(9).lineStyle(1.5, COLOR.violet, 0.5).strokeCircle(p.x, p.y, 18);
    const key = ensureCanvasTexture(scene, 'launcher_orb', 20, 20, res, (ctx) => {
      const g = ctx.createRadialGradient(7, 7, 2, 10, 10, 10);
      g.addColorStop(0, CSS.white);
      g.addColorStop(0.5, CSS.cyan);
      g.addColorStop(1, '#6c5ce7');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(10, 10, 10, 0, Math.PI * 2);
      ctx.fill();
    });
    this.orb = scene.add.image(p.x, p.y, key).setDisplaySize(20, 20).setDepth(9);
  }

  setLoaded(loaded: boolean): void {
    if (this.orb.visible !== loaded) this.orb.setVisible(loaded);
  }
}
