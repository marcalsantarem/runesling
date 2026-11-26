import Phaser from 'phaser';
import type { Rect } from '../../data/types';
import { COLOR } from './palette';
import { alphaBounds, ATLAS_ENEMIES, FRAME_PILLAR, hasTexture, pillarFit, type FrameBox } from './sprites';

const HIT_FRAMES = 8;
/** Tom ciano leve no acerto do sprite (o tint multiplica: não escurece muito a pedra). */
const PILLAR_HIT_TINT = 0x9ff3f0;
/** Alfa mínimo para contar como conteúdo ao medir um frame não aparado. */
const ALPHA_THRESHOLD = 8;

/** Caixa do conteúdo por frame (medida uma vez por textura carregada). */
const boxCache = new WeakMap<Phaser.Textures.Frame, FrameBox>();

/**
 * Conteúdo real do frame no quadro não aparado: o trim do atlas se houver;
 * senão, a caixa dos pixels visíveis medida na imagem-fonte. Falha na medição: o quadro inteiro.
 */
function contentBox(frame: Phaser.Textures.Frame): FrameBox {
  const cached = boxCache.get(frame);
  if (cached) return cached;
  let box: FrameBox = { x: 0, y: 0, w: frame.realWidth, h: frame.realHeight };
  if (frame.trimmed) {
    // Frame aparado: `x`/`y` = deslocamento do trim e `width`/`height` = tamanho aparado.
    box = { x: frame.x, y: frame.y, w: frame.width, h: frame.height };
  } else {
    try {
      const src = frame.source.image as CanvasImageSource;
      const canvas = document.createElement('canvas');
      canvas.width = frame.cutWidth;
      canvas.height = frame.cutHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(src, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, 0, 0, frame.cutWidth, frame.cutHeight);
        const data = ctx.getImageData(0, 0, frame.cutWidth, frame.cutHeight).data;
        box = alphaBounds(data, frame.cutWidth, frame.cutHeight, ALPHA_THRESHOLD);
      }
    } catch {
      // Imagem indisponível para leitura: mantém o quadro inteiro.
    }
  }
  boxCache.set(frame, box);
  return box;
}

/** Pilar de pedra: sprite `obstacle_pillar_obsidian` esticado na colisão (decisão 34) ou, sem ele, retângulo arredondado. */
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
      const frame = this.img.frame;
      const fit = pillarFit(rect.w, rect.h, contentBox(frame), frame.realWidth, frame.realHeight);
      this.img.setOrigin(fit.originX, fit.originY);
      this.img.setScale(fit.scaleX, fit.scaleY);
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
