import Phaser from 'phaser';

/**
 * Textura de canvas desenhada uma vez (cache do TextureManager pela chave).
 * Se a chave já existir (ex.: sprite real carregado no M4), nada é desenhado e a view usa a existente.
 * `res` = escala de renderização, para a textura ficar nítida com o zoom da câmera.
 */
export function ensureCanvasTexture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  res: number,
  paint: (ctx: CanvasRenderingContext2D) => void,
): string {
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, Math.ceil(w * res), Math.ceil(h * res));
  if (!tex) return key;
  const ctx = tex.getContext();
  ctx.save();
  ctx.scale(res, res);
  paint(ctx);
  ctx.restore();
  tex.refresh();
  return key;
}

/** Disco com brilho radial (auras, tochas). */
export function glowTexture(scene: Phaser.Scene, key: string, inner: string, res: number): string {
  const S = 64;
  return ensureCanvasTexture(scene, key, S, S, res, (ctx) => {
    const g = ctx.createRadialGradient(S / 2, S / 2, S * 0.08, S / 2, S / 2, S / 2);
    g.addColorStop(0, inner);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
  });
}

/**
 * Polilinha tracejada num Graphics (Phaser não tem setLineDash). `pts` = pares (x, y); `n` pontos.
 * `offset` desloca o padrão (animação de "marcha").
 */
export function dashedPolyline(
  g: Phaser.GameObjects.Graphics,
  pts: ArrayLike<number>,
  n: number,
  dash: number,
  gap: number,
  offset = 0,
): void {
  const period = dash + gap;
  let phase = ((offset % period) + period) % period; // posição dentro do período
  for (let i = 0; i + 1 < n; i++) {
    const x0 = pts[i * 2]!;
    const y0 = pts[i * 2 + 1]!;
    const dx = pts[i * 2 + 2]! - x0;
    const dy = pts[i * 2 + 3]! - y0;
    const len = Math.hypot(dx, dy);
    if (len === 0) continue;
    const ux = dx / len;
    const uy = dy / len;
    let d = 0;
    while (d < len) {
      const inDash = phase < dash;
      const run = Math.min(len - d, inDash ? dash - phase : period - phase);
      if (inDash) g.lineBetween(x0 + ux * d, y0 + uy * d, x0 + ux * (d + run), y0 + uy * (d + run));
      d += run;
      phase = (phase + run) % period;
    }
  }
}

