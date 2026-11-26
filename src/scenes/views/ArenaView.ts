import Phaser from 'phaser';
import type { RandomSource } from '../../match/rng';
import { dashedPolyline, ensureCanvasTexture, glowTexture } from './draw';
import { COLOR } from './palette';
import { FLOOR_TILE_WORLD, hasTexture, TEX_FLOOR, TEX_WALL_TRIM, tileScaleFor, WALL_TRIM_WORLD } from './sprites';

const GRID = 45;
const TORCHES: readonly (readonly [number, number])[] = [
  [0, 180],
  [1, 180],
  [0, 350],
  [1, 350],
];
const TORCH_RADIUS = 115;
const DUST_COUNT = 26;

/** Paredes laterais e teto (limites da física). */
function strokeWalls(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.strokeStyle = 'rgba(124,108,246,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(1, height);
  ctx.lineTo(1, 1);
  ctx.lineTo(width - 1, 1);
  ctx.lineTo(width - 1, height);
  ctx.stroke();
}

/**
 * Fundo de obsidiana, grade, paredes, tochas, poeira arcana e linha da barreira. Chave de textura: `arena_bg`.
 * Com `floor_crypt`/`wall_trim_crypt` carregados (M4): chão tileable + vinheta (`arena_vignette`) e moldura lateral.
 */
export class ArenaView {
  private readonly torches: Phaser.GameObjects.Image[] = [];
  private readonly dust: Phaser.GameObjects.Image[] = [];
  private readonly dustSpeed: Float32Array;
  private readonly height: number;

  constructor(scene: Phaser.Scene, width: number, height: number, barrierY: number, res: number, rng: RandomSource) {
    this.height = height;
    if (hasTexture(scene.textures, TEX_FLOOR)) this.addFloor(scene, width, height, res);
    else this.addProceduralBg(scene, width, height, res);
    if (hasTexture(scene.textures, TEX_WALL_TRIM)) this.addWallTrim(scene, width, height);

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

  private addProceduralBg(scene: Phaser.Scene, width: number, height: number, res: number): void {
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
      strokeWalls(ctx, width, height);
    });
    scene.add.image(0, 0, bgKey).setOrigin(0).setDisplaySize(width, height);
  }

  /** Chão tileable (512 px → FLOOR_TILE_WORLD) sob uma vinheta da paleta, com as linhas das paredes. */
  private addFloor(scene: Phaser.Scene, width: number, height: number, res: number): void {
    const floor = scene.add.tileSprite(0, 0, width, height, TEX_FLOOR).setOrigin(0);
    const k = tileScaleFor(scene.textures.get(TEX_FLOOR).getSourceImage().width, FLOOR_TILE_WORLD);
    floor.setTileScale(k, k);
    const key = ensureCanvasTexture(scene, 'arena_vignette', width, height, res, (ctx) => {
      const g = ctx.createRadialGradient(width * 0.5, height * 0.38, 20, width * 0.5, height * 0.5, height * 0.68);
      g.addColorStop(0, 'rgba(13,16,32,0.15)');
      g.addColorStop(0.62, 'rgba(13,16,32,0.45)');
      g.addColorStop(1, 'rgba(7,9,18,0.9)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
      strokeWalls(ctx, width, height);
    });
    scene.add.image(0, 0, key).setOrigin(0).setDisplaySize(width, height);
  }

  /** Moldura nas paredes laterais: faixa vertical repetida, espelhada à direita. */
  private addWallTrim(scene: Phaser.Scene, width: number, height: number): void {
    const k = tileScaleFor(scene.textures.get(TEX_WALL_TRIM).getSourceImage().width, WALL_TRIM_WORLD);
    scene.add.tileSprite(0, 0, WALL_TRIM_WORLD, height, TEX_WALL_TRIM).setOrigin(0).setTileScale(k, k);
    scene.add
      .tileSprite(width, 0, WALL_TRIM_WORLD, height, TEX_WALL_TRIM)
      .setOrigin(1, 0)
      .setTileScale(k, k)
      .setFlipX(true);
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
