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

/**
 * Escala do pilar: largura do conteúdo do quadro = largura do retângulo da física (escala uniforme,
 * sem distorcer a arte; supõe a laje desenhada na proporção dentro do quadro de 192).
 */
export function pillarScale(w: number, frameWidth: number): number {
  return frameWidth <= 0 ? 1 : w / (frameWidth * CONTENT);
}

/** `tileScale` que faz `textureWidth` px da textura ocupar `worldWidth` unidades do mundo. */
export function tileScaleFor(textureWidth: number, worldWidth: number): number {
  return textureWidth <= 0 ? 1 : worldWidth / textureWidth;
}
