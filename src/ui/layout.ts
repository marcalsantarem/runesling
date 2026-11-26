/**
 * Posição do campo de jogo dentro do #ui-root. O canvas usa Phaser `Scale.FIT` + `CENTER_BOTH` no mesmo
 * retângulo do #ui-root, então o campo é o maior retângulo com a proporção do mundo (360×520) centrado.
 * O HUD vai nas faixas acima/abaixo do campo (variáveis CSS `--rs-field-*`).
 */
import { loadGameData } from '../data/types';

export interface FieldRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function computeFieldRect(viewW: number, viewH: number, worldW: number, worldH: number): FieldRect {
  if (viewW <= 0 || viewH <= 0) return { x: 0, y: 0, w: 0, h: 0 };
  const scale = Math.min(viewW / worldW, viewH / worldH);
  const w = worldW * scale;
  const h = worldH * scale;
  return { x: (viewW - w) / 2, y: (viewH - h) / 2, w, h };
}

export function applyFieldVars(root: HTMLElement, rect: FieldRect): void {
  root.style.setProperty('--rs-field-x', `${rect.x}px`);
  root.style.setProperty('--rs-field-y', `${rect.y}px`);
  root.style.setProperty('--rs-field-w', `${rect.w}px`);
  root.style.setProperty('--rs-field-h', `${rect.h}px`);
}

/** Mantém as variáveis do campo atualizadas com o tamanho do root. Devolve a função de desligar. */
export function watchLayout(root: HTMLElement, target: HTMLElement = root): () => void {
  const { width, height } = loadGameData().rules.world;
  const update = () => applyFieldVars(target, computeFieldRect(root.clientWidth, root.clientHeight, width, height));
  update();
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(update);
    ro.observe(root);
    return () => ro.disconnect();
  }
  window.addEventListener('resize', update);
  return () => window.removeEventListener('resize', update);
}
