import Phaser from 'phaser';
import { predictTrajectory, type AimConfig } from '../../match/aim';
import { dashedPolyline } from './draw';
import { COLOR } from './palette';

const MAX_POINTS = 8;

/** Linha pontilhada da mira (predictTrajectory) e anel sob o polegar. */
export class AimView {
  private readonly g: Phaser.GameObjects.Graphics;
  private readonly pts = new Float32Array(MAX_POINTS * 2);
  private shown = false;

  constructor(scene: Phaser.Scene, private readonly cfg: Readonly<AimConfig>) {
    this.g = scene.add.graphics().setDepth(8);
  }

  show(x0: number, y0: number, angle: number, bounces: 1 | 2, thumbX: number, thumbY: number, t: number): void {
    const n = predictTrajectory(x0, y0, angle, bounces, this.pts, this.cfg);
    const g = this.g.clear();
    g.lineStyle(2.2, COLOR.cyan, 1);
    dashedPolyline(g, this.pts, n, 6, 5, -t * 0.04);
    g.lineStyle(1.5, COLOR.white, 0.22).strokeCircle(thumbX, thumbY, 16);
    this.shown = true;
  }

  hide(): void {
    if (!this.shown) return;
    this.g.clear();
    this.shown = false;
  }
}
