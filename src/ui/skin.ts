/**
 * Peças de UI da direção A (contrato `_contrato-m5-ui.md`). Cada peça é uma variável CSS em
 * `src/styles/ui-skin.css` com fallback em CSS puro. Quando `public/assets/ui/<chave>.webp` existe
 * (lista `AVAILABLE_ASSETS`), a variável recebe a imagem e o container ganha a classe `skin-<chave>`,
 * que liga o `border-image`/`background` da peça. Sem arquivo: nenhuma requisição, só o fallback.
 */
import { AVAILABLE_ASSETS } from '../core/assetManifest';

export const UI_PIECES = [
  'ui_panel',
  'ui_panel_dark',
  'ui_btn_primary',
  'ui_btn_secondary',
  'ui_btn_action',
  'ui_ribbon',
  'ui_card_lightning',
  'ui_card_fire',
  'ui_card_spectral',
  'ui_card_core',
  'ui_hud_bar',
  'ui_gem_lightning',
  'ui_gem_fire',
  'ui_gem_spectral',
  'ui_gem_core',
  'ui_icon_coin',
  'ui_icon_heart',
  'ui_icon_pause',
  'ui_icon_gear',
  'ui_icon_sound',
  'ui_icon_sound_off',
  'ui_icon_star',
  'ui_icon_sword',
] as const;

export type UiPiece = (typeof UI_PIECES)[number];

export interface SliceInfo {
  slice: readonly [number, number, number, number];
  width?: number;
  height?: number;
}

/** `ui_btn_primary` → `--ui-btn-primary`. */
export function pieceVar(key: UiPiece): string {
  return `--${key.replace(/_/g, '-')}`;
}

export function piecePath(key: UiPiece): string {
  return `${import.meta.env.BASE_URL}assets/ui/${key}.webp`;
}

/** Peças cujo arquivo existe em `public/assets/ui/`. */
export function availablePieces(available: readonly string[] = AVAILABLE_ASSETS): UiPiece[] {
  const has = new Set(available);
  return UI_PIECES.filter((k) => has.has(`ui/${k}.webp`));
}

/** Aplica no container as variáveis das peças existentes e os insets do 9-slice (`ui.json`). */
export function applySkin(
  root: HTMLElement,
  available: readonly string[] = AVAILABLE_ASSETS,
  slices: Readonly<Record<string, SliceInfo>> = {},
): UiPiece[] {
  const pieces = availablePieces(available);
  for (const key of pieces) {
    const v = pieceVar(key);
    root.style.setProperty(v, `url("${piecePath(key)}")`);
    const s = slices[key]?.slice;
    if (s) {
      root.style.setProperty(`${v}-slice`, s.join(' '));
      // Arte em 2× (contrato M4): a moldura ocupa metade dos px do arquivo na tela.
      root.style.setProperty(`${v}-bw`, s.map((n) => `${n / 2}px`).join(' '));
    }
    root.classList.add(`skin-${key}`);
  }
  return pieces;
}

/** Liga as peças existentes; lê `ui.json` só se ele e alguma peça existirem. */
export function mountSkin(root: HTMLElement, available: readonly string[] = AVAILABLE_ASSETS): void {
  const pieces = applySkin(root, available);
  if (pieces.length === 0 || !available.includes('ui/ui.json') || typeof fetch === 'undefined') return;
  fetch(`${import.meta.env.BASE_URL}assets/ui/ui.json`)
    .then((r) => (r.ok ? (r.json() as Promise<Record<string, SliceInfo>>) : {}))
    .then((json) => applySkin(root, available, json))
    .catch(() => undefined);
}
