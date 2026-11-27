/**
 * Peças de UI da direção A (contrato `_contrato-m5-ui.md`). Cada peça é uma variável CSS em
 * `src/styles/ui-skin.css` com fallback em CSS puro. Quando `public/assets/ui/<chave>.webp` existe
 * (lista `AVAILABLE_ASSETS`) e a imagem carrega, a variável recebe a imagem e o container ganha a
 * classe `skin-<chave>`, que liga o `border-image`/`background` da peça. Sem arquivo ou com erro de
 * carregamento: só o fallback.
 */
import { AVAILABLE_ASSETS } from '../core/assetManifest';
import { assetUrl } from './assetUrl';

export const UI_PIECES = [
  'ui_panel',
  'ui_panel_dark',
  'ui_btn_primary',
  'ui_btn_secondary',
  'ui_btn_action',
  'ui_btn_mini',
  'ui_btn_round',
  'ui_btn_square',
  'ui_ribbon',
  'ui_ribbon_dark',
  'ui_pill',
  'ui_card_lightning',
  'ui_card_fire',
  'ui_card_spectral',
  'ui_card_core',
  'ui_hud_bar',
  'ui_map_bg',
  'ui_map_node',
  'ui_map_node_locked',
  'ui_defeat_shield',
  'ui_gem_lightning',
  'ui_gem_fire',
  'ui_gem_spectral',
  'ui_gem_core',
  'ui_socket',
  'ui_icon_coin',
  'ui_icon_heart',
  'ui_icon_pause',
  'ui_icon_gear',
  'ui_icon_sound',
  'ui_icon_sound_off',
  'ui_icon_star',
  'ui_icon_lock',
  'ui_icon_back',
  'ui_icon_check',
  'ui_icon_recall',
  'ui_icon_sword',
] as const;

export type UiPiece = (typeof UI_PIECES)[number];

export interface SliceInfo {
  /** `null` = peça inteira (sem 9-slice). */
  slice: readonly [number, number, number, number] | null;
  width?: number;
  height?: number;
}

/** `ui_btn_primary` → `--ui-btn-primary`. */
export function pieceVar(key: UiPiece): string {
  return `--${key.replace(/_/g, '-')}`;
}

export function piecePath(key: UiPiece): string {
  return assetUrl(`ui/${key}.webp`);
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

/** Carrega a imagem da peça; rejeita em erro de rede ou 404. */
export type PieceLoader = (url: string) => Promise<void>;

export const loadImage: PieceLoader = (url) =>
  new Promise<void>((resolve, reject) => {
    if (typeof Image === 'undefined') {
      reject(new Error('sem Image'));
      return;
    }
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`falhou: ${url}`));
    img.src = url;
  });

/**
 * Liga as peças existentes; lê `ui.json` só se ele e alguma peça existirem.
 * M5-01: a classe `skin-<chave>` (que esconde o fallback CSS) só entra depois que a imagem da peça
 * carrega. Peça que falha (rede, 404) fica no fallback. Devolve a promessa de todas as tentativas.
 */
export function mountSkin(
  root: HTMLElement,
  available: readonly string[] = AVAILABLE_ASSETS,
  load: PieceLoader = loadImage,
): Promise<UiPiece[]> {
  const pieces = availablePieces(available);
  if (pieces.length === 0) return Promise.resolve([]);
  const loaded: UiPiece[] = [];
  let slices: Readonly<Record<string, SliceInfo>> = {};
  const apply = () => {
    const ok = new Set(loaded);
    applySkin(root, UI_PIECES.filter((k) => ok.has(k)).map((k) => `ui/${k}.webp`), slices);
  };
  const json =
    available.includes('ui/ui.json') && typeof fetch !== 'undefined'
      ? fetch(assetUrl('ui/ui.json'))
          .then((r) => (r.ok ? (r.json() as Promise<Record<string, SliceInfo>>) : {}))
          .then((j) => {
            slices = j;
            if (loaded.length > 0) apply();
          })
          .catch(() => undefined)
      : Promise.resolve();
  const imgs = pieces.map((k) =>
    load(piecePath(k)).then(
      () => {
        loaded.push(k);
        apply();
      },
      () => undefined,
    ),
  );
  return Promise.all([json, ...imgs]).then(() => UI_PIECES.filter((k) => loaded.includes(k)));
}
