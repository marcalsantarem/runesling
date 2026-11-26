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
  pillarFit,
  alphaBounds,
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

  it('obstáculos: bumper/anel = 2r', () => {
    expect(circleObstacleScale(17, 192) * 192 * 0.92).toBeCloseTo(34, 6);
  });

  it('pilar (decisão 34): o conteúdo do frame ocupa exatamente o retângulo 68×16', () => {
    // Caixa medida no atlas atual: x 8..184, y 69..123 no quadro de 192.
    const box = { x: 8, y: 69, w: 177, h: 55 };
    const fit = pillarFit(68, 16, box, 192, 192);
    expect(fit.scaleX * box.w).toBeCloseTo(68, 9);
    expect(fit.scaleY * box.h).toBeCloseTo(16, 9);
    expect(fit.scaleY).toBeLessThan(fit.scaleX); // achata na vertical
    // Origem no centro do conteúdo: as bordas do conteúdo caem nas bordas do retângulo centrado.
    const cx = 100;
    const cy = 50;
    const left = cx - fit.originX * 192 * fit.scaleX + box.x * fit.scaleX;
    const top = cy - fit.originY * 192 * fit.scaleY + box.y * fit.scaleY;
    expect(left).toBeCloseTo(cx - 34, 9);
    expect(top).toBeCloseTo(cy - 8, 9);
  });

  it('pilar: caixa ou quadro inválido não gera escala infinita', () => {
    expect(pillarFit(68, 16, { x: 0, y: 0, w: 0, h: 10 }, 192, 192)).toEqual({ scaleX: 1, scaleY: 1, originX: 0.5, originY: 0.5 });
    expect(pillarFit(68, 16, { x: 0, y: 0, w: 10, h: 10 }, 0, 192).scaleX).toBe(1);
  });

  it('alphaBounds: caixa dos pixels visíveis; vazio = quadro inteiro', () => {
    const w = 6;
    const h = 4;
    const data = new Uint8ClampedArray(w * h * 4);
    data[(1 * w + 2) * 4 + 3] = 255;
    data[(2 * w + 4) * 4 + 3] = 200;
    data[(3 * w + 0) * 4 + 3] = 5; // abaixo do limiar
    expect(alphaBounds(data, w, h, 8)).toEqual({ x: 2, y: 1, w: 3, h: 2 });
    expect(alphaBounds(new Uint8ClampedArray(w * h * 4), w, h)).toEqual({ x: 0, y: 0, w, h });
  });

  it('chão e moldura: tileScale mapeia a textura para a medida do mundo', () => {
    expect(tileScaleFor(512, 150)).toBeCloseTo(150 / 512, 9);
    expect(tileScaleFor(64, 10)).toBeCloseTo(10 / 64, 9);
  });

  it('frame inválido (largura 0) não gera escala infinita', () => {
    expect(medallionScale(17, 0, false)).toBe(1);
    expect(circleObstacleScale(17, 0)).toBe(1);
    expect(tileScaleFor(0, 10)).toBe(1);
  });
});
