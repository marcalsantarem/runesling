/**
 * Escolha textura real × desenho procedural e escalas dos sprites do M4 (contrato `_contrato-m4-assets.md`).
 * Lógica pura (sem Phaser em runtime): a cena passa o `TextureManager`, que satisfaz `TextureLookup`.
 */

/** Atlas de inimigos, chefes e obstáculos (frames = `spriteKey` / `obstacle_*`). */
export const ATLAS_ENEMIES = 'enemies';
/** Imagens do cenário. */
export const TEX_FLOOR = 'floor_crypt';
export const TEX_WALL_TRIM = 'wall_trim_crypt';
export const FRAME_BUMPER = 'obstacle_bumper_rune';
export const FRAME_PILLAR = 'obstacle_pillar_obsidian';
export const FRAME_RING = 'obstacle_ring_multiplier';

/** Margem interna do pipeline (GDD §8.6: 4% de cada lado): o conteúdo ocupa 92% do quadro. */
export const SPRITE_PAD = 0.04;
const CONTENT = 1 - SPRITE_PAD * 2;
/** Quadro do medalhão comum e do chefe (GDD §8.6). */
export const MEDALLION_PX = 256;
export const BOSS_PX = 384;
/** Chão: 512 px de textura cobrem esta largura do mundo lógico (360 de largura → ~2,4 repetições). */
export const FLOOR_TILE_WORLD = 150;
/** Largura da moldura lateral no mundo lógico. */
export const WALL_TRIM_WORLD = 10;

/** Subconjunto do `Phaser.Textures.TextureManager` usado aqui. */
export interface TextureLookup {
  exists(key: string): boolean;
  get(key: string): { has(frame: string): boolean };
}

/** Textura `key` carregada e, se `frame` for dado, com esse frame. Sem isso a view usa o desenho procedural. */
export function hasTexture(textures: TextureLookup, key: string, frame?: string): boolean {
  if (!textures.exists(key)) return false;
  return frame === undefined || textures.get(key).has(frame);
}

/**
 * Escala do sprite de medalhão para o círculo de arte coincidir com o diâmetro da hitbox (2r).
 * Medalhão comum (e chefe sem chifres): o círculo é o conteúdo do quadro (92%).
 * Chefe com chifres: o círculo ocupa o equivalente a um medalhão de 256 dentro do quadro de 384;
 * o resto do quadro é dos chifres, que passam do círculo.
 */
export function medallionScale(radius: number, frameWidth: number, horned: boolean): number {
  if (frameWidth <= 0) return 1;
  const circlePx = horned ? frameWidth * (MEDALLION_PX / BOSS_PX) * CONTENT : frameWidth * CONTENT;
  return (radius * 2) / circlePx;
}

/** Escala de obstáculo circular (bumper, anel): conteúdo do quadro = diâmetro 2r. */
export function circleObstacleScale(radius: number, frameWidth: number): number {
  return frameWidth <= 0 ? 1 : (radius * 2) / (frameWidth * CONTENT);
}

/** Retângulo em px dentro do quadro do frame (coordenadas do quadro não aparado). */
export interface FrameBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Ajuste do sprite a um retângulo: escalas X/Y separadas e origem no centro do conteúdo. */
export interface StretchFit {
  scaleX: number;
  scaleY: number;
  originX: number;
  originY: number;
}

/**
 * Decisão 34: o conteúdo real do sprite do pilar (`box`, o trim) ocupa exatamente o retângulo
 * da colisão `w`×`h`, mesmo achatando a arte. `frameW`/`frameH` = quadro não aparado
 * (`realWidth`/`realHeight`); a origem fica no centro do conteúdo para posicionar no centro do retângulo.
 */
export function pillarFit(w: number, h: number, box: FrameBox, frameW: number, frameH: number): StretchFit {
  if (box.w <= 0 || box.h <= 0 || frameW <= 0 || frameH <= 0) {
    return { scaleX: 1, scaleY: 1, originX: 0.5, originY: 0.5 };
  }
  return {
    scaleX: w / box.w,
    scaleY: h / box.h,
    originX: (box.x + box.w / 2) / frameW,
    originY: (box.y + box.h / 2) / frameH,
  };
}

/**
 * Caixa dos pixels com alfa > `threshold` em `data` (RGBA, `width`×`height`).
 * Usada quando o atlas não vem aparado (`trimmed: false`). Sem pixel visível: o quadro inteiro.
 */
export function alphaBounds(data: ArrayLike<number>, width: number, height: number, threshold = 0): FrameBox {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if ((data[(y * width + x) * 4 + 3] ?? 0) > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return { x: 0, y: 0, w: width, h: height };
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/** `tileScale` que faz `textureWidth` px da textura ocupar `worldWidth` unidades do mundo. */
export function tileScaleFor(textureWidth: number, worldWidth: number): number {
  return textureWidth <= 0 ? 1 : worldWidth / textureWidth;
}
