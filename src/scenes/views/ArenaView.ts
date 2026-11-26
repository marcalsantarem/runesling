import Phaser from 'phaser';
import type { RandomSource } from '../../match/rng';
import { dashedPolyline, ensureCanvasTexture, glowTexture } from './draw';
import { COLOR } from './palette';

const GRID = 45;
const TORCHES: readonly (readonly [number, number])[] = [
  [0, 180],
  [1, 180],
  [0, 350],
  [1, 350],
];
const TORCH_RADIUS = 115;
const DUST_COUNT = 26;

/** Fundo de obsidiana, grade, paredes, tochas, poeira arcana e linha da barreira. Chave de textura: `arena_bg`. */
export class ArenaView {
  private readonly torches: Phaser.GameObjects.Image[] = [];
  private readonly dust: Phaser.GameObjects.Image[] = [];
  private readonly dustSpeed: Float32Array;
  private readonly height: number;

  constructor(scene: Phaser.Scene, width: number, height: number, barrierY: number, res: number, rng: RandomSource) {
    this.height = height;
    const bgKey = ensureCanvasTexture(scene, 'arena_bg', width, height, res, (ctx) => {
      const bg = ctx.createRadialGradient(width * 0.5, height * 0.38, 20, width * 0.5, height * 0.5, height * 0.68);
      bg.addColorStop(0, COLOR.bgCenter);
      bg.addColorStop(0.62, COLOR.bgMid);
      bg.addColorStop(1, COLOR.bgEdge);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(130,145,220,0.055)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = GRID; x < width; x += GRID) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = GRID; y < height; y += GRID) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
      // Paredes laterais e teto (limites da física).
      ctx.strokeStyle = 'rgba(124,108,246,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(1, height);
      ctx.lineTo(1, 1);
      ctx.lineTo(width - 1, 1);
      ctx.lineTo(width - 1, height);
      ctx.stroke();
    });
    scene.add.image(0, 0, bgKey).setOrigin(0).setDisplaySize(width, height);

    const torchKey = glowTexture(scene, 'fx_torch', 'rgba(255,140,50,0.18)', res);
    for (const [side, y] of TORCHES) {
      this.torches.push(scene.add.image(side * width, y, torchKey).setDisplaySize(TORCH_RADIUS * 2, TORCH_RADIUS * 2));
    }

    const dotKey = ensureCanvasTexture(scene, 'fx_dot', 8, 8, res, (ctx) => {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(4, 4, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    this.dustSpeed = new Float32Array(DUST_COUNT);
    for (let i = 0; i < DUST_COUNT; i++) {
      const r = 0.6 + rng.next() * 1.4;
      const d = scene.add
        .image(rng.next() * width, rng.next() * height, dotKey)
        .setDisplaySize(r * 2, r * 2)
        .setTint(COLOR.cyan)
        .setAlpha(0.28);
      this.dust.push(d);
      this.dustSpeed[i] = 0.1 + rng.next() * 0.3;
    }

    const barrier = scene.add.graphics();
    barrier.lineStyle(1.5, COLOR.crimson, 0.5);
    const pts = [12, barrierY, width - 12, barrierY];
    dashedPolyline(barrier, pts, 2, 6, 6);
  }

  /** `t` em ms; `frames` = frames lógicos desde o último update. */
  update(t: number, frames: number): void {
    const fl = 0.9 + Math.sin(t * 0.008) * 0.1;
    const size = TORCH_RADIUS * 2 * fl;
    for (const torch of this.torches) torch.setDisplaySize(size, size);
    for (let i = 0; i < this.dust.length; i++) {
      const d = this.dust[i]!;
      d.y -= this.dustSpeed[i]! * frames;
      if (d.y < 0) d.y = this.height;
    }
  }
}
