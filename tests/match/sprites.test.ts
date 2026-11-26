import { describe, expect, it } from 'vitest';
import enemies from '../../src/data/enemies.json';
import {
  ATLAS_ENEMIES,
  BOSS_PX,
  circleObstacleScale,
  FRAME_BUMPER,
  FRAME_PILLAR,
  FRAME_RING,
  hasTexture,
  MEDALLION_PX,
  medallionScale,
  pillarScale,
  TEX_FLOOR,
  tileScaleFor,
  type TextureLookup,
} from '../../src/scenes/views/sprites';

function lookup(tex: Record<string, readonly string[]>): TextureLookup {
  return {
    exists: (k) => k in tex,
    get: (k) => ({ has: (f) => (tex[k] ?? []).includes(f) }),
  };
}

describe('Sprites do M4 — textura × procedural', () => {
  it('sem textura carregada cai no procedural', () => {
    const t = lookup({});
    expect(hasTexture(t, ATLAS_ENEMIES, 'enemy_goblin')).toBe(false);
    expect(hasTexture(t, TEX_FLOOR)).toBe(false);
  });

  it('atlas sem o frame pedido cai no procedural; com o frame usa o sprite', () => {
    const t = lookup({ [ATLAS_ENEMIES]: ['enemy_goblin', FRAME_BUMPER] });
    expect(hasTexture(t, ATLAS_ENEMIES, 'enemy_goblin')).toBe(true);
    expect(hasTexture(t, ATLAS_ENEMIES, FRAME_BUMPER)).toBe(true);
    expect(hasTexture(t, ATLAS_ENEMIES, 'boss_obsidian')).toBe(false);
    expect(hasTexture(t, ATLAS_ENEMIES, FRAME_RING)).toBe(false);
    expect(hasTexture(t, ATLAS_ENEMIES, FRAME_PILLAR)).toBe(false);
  });

  it('imagem simples (chão) só precisa existir', () => {
    expect(hasTexture(lookup({ [TEX_FLOOR]: [] }), TEX_FLOOR)).toBe(true);
  });

  it('todo spriteKey de enemies.json é um frame do contrato (enemy_*, miniboss_*, boss_*)', () => {
    for (const def of Object.values(enemies as Record<string, { spriteKey: string }>)) {
      expect(def.spriteKey).toMatch(/^(enemy|miniboss|boss)_[a-z_]+$/);
    }
  });
});

describe('Sprites do M4 — escala', () => {
  it('medalhão de 256: conteúdo (92%) = diâmetro da hitbox', () => {
    const s = medallionScale(17, MEDALLION_PX, false);
    expect(s * MEDALLION_PX * 0.92).toBeCloseTo(34, 6);
  });

  it('chefe com chifres no quadro de 384: o círculo equivale a 256 e os chifres passam do diâmetro', () => {
    const r = 36;
    const s = medallionScale(r, BOSS_PX, true);
    expect(s * MEDALLION_PX * 0.92).toBeCloseTo(r * 2, 6);
    expect(s * BOSS_PX).toBeGreaterThan(r * 2);
  });

  it('chefe sem chifres no quadro de 384: o círculo ocupa o quadro inteiro', () => {
    expect(medallionScale(31, BOSS_PX, false) * BOSS_PX * 0.92).toBeCloseTo(62, 6);
  });

  it('a escala independe da resolução do frame (atlas reduzido)', () => {
    expect(medallionScale(17, 128, false) * 128).toBeCloseTo(medallionScale(17, 256, false) * 256, 6);
  });

  it('obstáculos: bumper/anel = 2r e pilar = largura do retângulo', () => {
    expect(circleObstacleScale(17, 192) * 192 * 0.92).toBeCloseTo(34, 6);
    expect(pillarScale(68, 192) * 192 * 0.92).toBeCloseTo(68, 6);
  });

  it('chão e moldura: tileScale mapeia a textura para a medida do mundo', () => {
    expect(tileScaleFor(512, 150)).toBeCloseTo(150 / 512, 9);
    expect(tileScaleFor(64, 10)).toBeCloseTo(10 / 64, 9);
  });

  it('frame inválido (largura 0) não gera escala infinita', () => {
    expect(medallionScale(17, 0, false)).toBe(1);
    expect(circleObstacleScale(17, 0)).toBe(1);
    expect(pillarScale(68, 0)).toBe(1);
    expect(tileScaleFor(0, 10)).toBe(1);
  });
});
