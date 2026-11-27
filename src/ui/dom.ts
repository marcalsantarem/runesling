/** Helpers mínimos de DOM da UI (sem framework). Texto sempre por `textContent`. */
import { AVAILABLE_ASSETS } from '../core/assetManifest';
import { assetUrl } from './assetUrl';

export interface ElOptions {
  className?: string;
  text?: string;
  attrs?: Readonly<Record<string, string>>;
  onClick?: () => void;
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: ElOptions = {},
  children: readonly (Node | null | undefined)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (opts.className) node.className = opts.className;
  if (opts.text !== undefined) node.textContent = opts.text;
  if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
  const onClick = opts.onClick;
  if (onClick) node.addEventListener('click', () => onClick());
  for (const c of children) if (c) node.appendChild(c);
  return node;
}

/** Botão interativo (recebe toque; alvo mínimo de 44 px no CSS). */
export function button(
  className: string,
  label: string,
  onClick: () => void,
  attrs: Readonly<Record<string, string>> = {},
): HTMLButtonElement {
  return el('button', {
    className: `rs-btn ${className}`.trim(),
    text: label,
    attrs: { type: 'button', ...attrs },
    onClick: () => onClick(),
  });
}

/** Liga o estado pressionado (`is-down`) por ponteiro: no iOS o `:active` não dispara sem listener de toque. */
export function pressable<T extends HTMLElement>(node: T): T {
  const up = (): void => node.classList.remove('is-down');
  node.addEventListener('pointerdown', () => {
    if (!(node as unknown as HTMLButtonElement).disabled) node.classList.add('is-down');
  });
  for (const type of ['pointerup', 'pointercancel', 'pointerleave', 'blur']) node.addEventListener(type, up);
  return node;
}

/** Variantes do botão placa de ferro (decisão 44) e a peça de 9-slice de cada uma (contrato M5). */
export type PlateVariant = 'gold' | 'iron' | 'cyan';
export type PlateSize = 'lg' | 'md' | 'mini';
const PLATE_PIECE: Record<PlateVariant, string> = {
  gold: 'rs-btn-primary',
  iron: 'rs-btn-secondary',
  cyan: 'rs-btn-action',
};

export interface PlateOptions {
  attrs?: Readonly<Record<string, string>>;
  size?: PlateSize;
  className?: string;
  /** Ícone antes do texto (ex.: moeda na compra, seta no Recolher). */
  icon?: HTMLElement | null;
}

/**
 * Botão placa de ferro rebitada (variação A de `docs/mockups/botao-jogar.html`): moldura chanfrada,
 * miolo na cor da variante, 4 rebites e duas runas gravadas que acendem em ciano ao apertar.
 * `mini` (comprar, 1×, Recolher) não tem rebites nem runas. O texto fica só em `.rs-plate-txt`.
 */
export function plate(variant: PlateVariant, label: string, onClick: () => void, opts: PlateOptions = {}): HTMLButtonElement {
  const size = opts.size ?? 'md';
  const runes = size !== 'mini';
  const deco = (className: string, children: (Node | null)[] = []) =>
    el('span', { className, attrs: { 'aria-hidden': 'true' } }, children);
  const rune = (markup: string): HTMLElement => {
    const r = icon(markup, 22);
    r.classList.add('rs-plate-rn');
    return r;
  };
  const lbl = el('span', { className: 'rs-plate-lbl' }, [
    runes ? rune(RUNES.algiz) : null,
    opts.icon ?? null,
    el('span', { className: 'rs-plate-txt', text: label }),
    runes ? rune(RUNES.othala) : null,
  ]);
  const node = el(
    'button',
    {
      className: `rs-btn rs-plate rs-plate-${variant} rs-plate-${size} ${PLATE_PIECE[variant]} ${opts.className ?? ''}`.trim(),
      attrs: { type: 'button', ...opts.attrs },
      onClick: () => onClick(),
    },
    [
      deco('rs-plate-o'),
      deco('rs-plate-fr'),
      el('span', { className: 'rs-plate-pl' }, [deco('rs-plate-shine'), lbl]),
      ...(runes ? (['tl', 'bl', 'tr', 'br'] as const).map((p) => deco(`rs-plate-rv rs-rv-${p}`)) : []),
    ],
  );
  return pressable(node);
}

/** Troca o texto da placa sem desmontar a moldura. */
export function setPlateLabel(node: HTMLElement, text: string): void {
  const txt = node.querySelector('.rs-plate-txt');
  if (txt) txt.textContent = text;
  else node.textContent = text;
}

/** Botão redondo (ou quadrado) de ferro com ícone (pausa, som, ajustes, talentos, voltar). */
export function iconButton(
  markup: string,
  label: string,
  onClick: () => void,
  opts: { attrs?: Readonly<Record<string, string>>; piece?: string; square?: boolean; size?: number; className?: string } = {},
): HTMLButtonElement {
  const node = el(
    'button',
    {
      className: `rs-btn rs-btn-icon rs-ib${opts.square ? ' rs-ib-sq' : ''} ${opts.className ?? ''}`.trim(),
      attrs: { type: 'button', 'aria-label': label, ...opts.attrs },
      onClick: () => onClick(),
    },
    [icon(markup, opts.size ?? 24, opts.piece)],
  );
  return pressable(node);
}

/**
 * Ícone SVG estático (markup fixo deste módulo, nunca texto do usuário). Com `piece`, a peça
 * `ui_icon_*` substitui o SVG quando o arquivo existe (classe `skin-<peça>` no container, ui-skin.css).
 */
export function icon(markup: string, size = 18, piece?: string): HTMLSpanElement {
  const cls = piece ? `rs-icon rs-uicon rs-uicon-${piece}` : 'rs-icon';
  const span = el('span', { className: cls, attrs: { 'aria-hidden': 'true' } });
  span.style.setProperty('--rs-icon-size', `${size}px`);
  span.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24">${markup}</svg>`;
  return span;
}

/** Fita vermelha de título (peça `ui_ribbon`): faixa com pontas recortadas e filetes tracejados. */
export function ribbon(text: string, className = ''): { node: HTMLElement; label: HTMLElement } {
  const label = el('span', { className: 'rs-ribbon-text', text });
  return { node: el('div', { className: `rs-ribbon ${className}`.trim() }, [label]), label };
}

export function show(node: HTMLElement, visible: boolean): void {
  node.hidden = !visible;
}

export const ICONS = {
  coin: '<circle cx="12" cy="12" r="9" fill="var(--rs-gold)" stroke="var(--rs-gold-dark)" stroke-width="2"/><circle cx="12" cy="12" r="5" fill="none" stroke="#fff3c4" stroke-width="1.4"/>',
  heart:
    '<path d="M12 21s-7.5-4.7-9.5-9.2C1 8.4 3.2 5 6.8 5c2 0 3.7 1.1 5.2 2.8C13.5 6.1 15.2 5 17.2 5 20.8 5 23 8.4 21.5 11.8 19.5 16.3 12 21 12 21z" fill="var(--rs-crimson)"/>',
  pause: '<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>',
  soundOn:
    '<path fill="currentColor" d="M3 9h4l5-4v14l-5-4H3z"/><path fill="currentColor" d="M15.5 8.5a5 5 0 0 1 0 7l-1.4-1.4a3 3 0 0 0 0-4.2zM18.3 5.7a9 9 0 0 1 0 12.6l-1.4-1.4a7 7 0 0 0 0-9.8z"/>',
  soundOff:
    '<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  gear: '<path fill="currentColor" d="M13.5 2l.5 2.6a8 8 0 0 1 2 1.1l2.5-.9 1.5 2.6-2 1.7a8 8 0 0 1 0 2.3l2 1.7-1.5 2.6-2.5-.9a8 8 0 0 1-2 1.1l-.5 2.6h-3l-.5-2.6a8 8 0 0 1-2-1.1l-2.5.9L4 15.1l2-1.7a8 8 0 0 1 0-2.3l-2-1.7 1.5-2.6 2.5.9a8 8 0 0 1 2-1.1L10.5 2zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>',
  sword: '<path fill="currentColor" d="M14.5 3H21v6.5L10 20.5 7.5 18l-2 2L4 18.5l2-2L3.5 14z"/>',
  star: '<path fill="currentColor" d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21l1.6-7L2 9.2l7.1-.6z"/>',
  lock: '<path fill="currentColor" d="M7 10V7a5 5 0 0 1 10 0v3h1.5c.8 0 1.5.7 1.5 1.5v9c0 .8-.7 1.5-1.5 1.5h-13C4.7 22 4 21.3 4 20.5v-9C4 10.7 4.7 10 5.5 10zm2.5 0h5V7a2.5 2.5 0 0 0-5 0zm2.5 4a1.6 1.6 0 0 0-.8 3V19h1.6v-2a1.6 1.6 0 0 0-.8-3z"/>',
  back: '<path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>',
  check: '<path d="M5 12.5 10 17.5 19.5 7" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>',
  shield:
    '<defs><linearGradient id="rs-g-shield" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#88FFFF"/><stop offset=".5" stop-color="#00CEC9"/><stop offset="1" stop-color="#0984E3"/></linearGradient></defs><path fill="url(#rs-g-shield)" d="M12 2 20.5 5v6.5c0 5-3.6 9-8.5 10.5C7.1 20.5 3.5 16.5 3.5 11.5V5z"/><path d="M12 3.5 10.6 8 13.2 10.5 10.3 13.8 12.6 16.4 11.2 21" fill="none" stroke="#0A0B10" stroke-width="1.6" stroke-linejoin="round"/><path d="M10.6 8 7.5 9.2M13.2 10.5 16.6 9.6M10.3 13.8 7.4 15" fill="none" stroke="#0A0B10" stroke-width="1.1"/>',
  recall:
    '<path d="M12 4v10m0 0l-4-4m4 4l4-4M5 19h14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  chest:
    '<path fill="#8a5a2b" d="M3 10h18v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path fill="#b07438" d="M3 10a9 5 0 0 1 18 0z"/><path fill="none" stroke="var(--rs-gold)" stroke-width="1.8" d="M3 10h18M7 6.2V21M17 6.2V21"/><rect x="10" y="11.5" width="4" height="4.5" rx="1" fill="var(--rs-gold)" stroke="#3a2606" stroke-width="1"/>',
  skull:
    '<path fill="currentColor" d="M12 2C7 2 3.5 5.6 3.5 10.2c0 2.7 1.2 4.6 3 5.8V19a1 1 0 0 0 1 1h1.5v-2h1.5v2h3v-2h1.5v2h1.5a1 1 0 0 0 1-1v-3c1.8-1.2 3-3.1 3-5.8C20.5 5.6 17 2 12 2zm-3.5 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm7 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>',
} as const;

/** Runas gravadas na placa (Algiz e Othala, mockup do botão A). */
export const RUNES = {
  algiz: '<path d="M12 3v18M12 11 5.5 4M12 11l6.5-7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  othala:
    '<path d="M12 3 18 9 12 15 6 9zM6.5 21l5.5-6 5.5 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>',
} as const;

/**
 * Quadro de um atlas TexturePacker (`public/assets/atlases/<atlas>.json`) como fundo CSS do nó.
 * Só pede o atlas se a textura e o JSON existem; sem eles, o nó fica com o fallback do CSS.
 */
export function atlasFrame(node: HTMLElement, atlas: string, frame: string): void {
  const tex = `atlases/${atlas}.webp`;
  const json = `atlases/${atlas}.json`;
  if (!availableAssets.has(tex) || !availableAssets.has(json) || typeof fetch === 'undefined') return;
  type Atlas = { frames: Record<string, { frame: { x: number; y: number; w: number; h: number } }>; meta: { size: { w: number; h: number } } };
  fetch(assetUrl(json))
    .then((r) => (r.ok ? (r.json() as Promise<Atlas>) : null))
    .then((a) => {
      const f = a?.frames[frame]?.frame;
      if (!a || !f) return;
      node.style.setProperty('--fx', String(f.x));
      node.style.setProperty('--fy', String(f.y));
      node.style.setProperty('--fw', String(f.w));
      node.style.setProperty('--aw', String(a.meta.size.w));
      node.style.setProperty('--ah', String(a.meta.size.h));
      node.style.backgroundImage = `url("${assetUrl(tex)}")`;
      node.classList.add('has-art');
    })
    .catch(() => undefined);
}

/** Caminho do ícone avulso da UI (contrato M4): `public/assets/icons/<iconKey>.webp`. */
export function iconPath(iconKey: string): string {
  return `${import.meta.env.BASE_URL}assets/icons/${iconKey}.webp`;
}

/** Arquivos em `public/assets/` conhecidos no build (T-031): só pedimos ícones que existem. */
let availableAssets: ReadonlySet<string> = new Set(AVAILABLE_ASSETS);

/** Só para testes: troca a lista de assets existentes (sem argumento, volta à do build). */
export function setAvailableAssets(list: readonly string[] = AVAILABLE_ASSETS): void {
  availableAssets = new Set(list);
}

/** O arquivo `icons/<iconKey>.webp` existe em `public/assets/`? */
export function hasIconFile(iconKey: string): boolean {
  return availableAssets.has(`icons/${iconKey}.webp`);
}

/** Chaves cujo arquivo falhou nesta sessão: não pedimos de novo (evita 404 repetido a cada render). */
const missingIcons = new Set<string>();

/** Só para testes: esquece as falhas registradas. */
export function resetMissingIcons(): void {
  missingIcons.clear();
}

/**
 * Moldura do ícone de runa/talento. A moldura mantém a bolinha colorida (CSS de `className`)
 * como fallback; sem arquivo listado em `AVAILABLE_ASSETS`, nem cria `<img>` (sem requisição/404).
 * A imagem só aparece quando carrega (`has-art`). Se falhar, some sem quebrar layout.
 */
export function artIcon(iconKey: string, className: string): HTMLSpanElement {
  const frame = el('span', { className, attrs: { 'aria-hidden': 'true', 'data-icon': iconKey } });
  if (!iconKey || !hasIconFile(iconKey) || missingIcons.has(iconKey)) return frame;
  const img = el('img', {
    className: 'rs-art-img',
    attrs: { src: iconPath(iconKey), alt: '', width: '128', height: '128', decoding: 'async', draggable: 'false' },
  });
  img.addEventListener('load', () => frame.classList.add('has-art'));
  img.addEventListener('error', () => {
    missingIcons.add(iconKey);
    frame.classList.remove('has-art');
    img.remove();
  });
  frame.appendChild(img);
  return frame;
}
