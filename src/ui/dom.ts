/** Helpers mínimos de DOM da UI (sem framework). Texto sempre por `textContent`. */
import { AVAILABLE_ASSETS } from '../core/assetManifest';

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

/** Fita vermelha de título (peça `ui_ribbon`). */
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
    '<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  soundOff:
    '<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  gear: '<path fill="currentColor" d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm9 4.7v-2.4l-2.4-.6-.6-1.5 1.3-2.1-1.7-1.7-2.1 1.3-1.5-.6L13.2 3h-2.4l-.6 2.4-1.5.6-2.1-1.3-1.7 1.7 1.3 2.1-.6 1.5L3 10.8v2.4l2.4.6.6 1.5-1.3 2.1 1.7 1.7 2.1-1.3 1.5.6.6 2.4h2.4l.6-2.4 1.5-.6 2.1 1.3 1.7-1.7-1.3-2.1.6-1.5z"/>',
  sword: '<path fill="currentColor" d="M14.5 3H21v6.5L10 20.5 7.5 18l-2 2L4 18.5l2-2L3.5 14z"/>',
  star: '<path fill="currentColor" d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21l1.6-7L2 9.2l7.1-.6z"/>',
  recall:
    '<path d="M12 4v10m0 0l-4-4m4 4l4-4M5 19h14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  skull:
    '<path fill="currentColor" d="M12 2C7 2 3.5 5.6 3.5 10.2c0 2.7 1.2 4.6 3 5.8V19a1 1 0 0 0 1 1h1.5v-2h1.5v2h3v-2h1.5v2h1.5a1 1 0 0 0 1-1v-3c1.8-1.2 3-3.1 3-5.8C20.5 5.6 17 2 12 2zm-3.5 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm7 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>',
} as const;

/**
 * Quadro de um atlas TexturePacker (`public/assets/atlases/<atlas>.json`) como fundo CSS do nó.
 * Só pede o atlas se a textura e o JSON existem; sem eles, o nó fica com o fallback do CSS.
 */
export function atlasFrame(node: HTMLElement, atlas: string, frame: string): void {
  const tex = `atlases/${atlas}.webp`;
  const json = `atlases/${atlas}.json`;
  if (!availableAssets.has(tex) || !availableAssets.has(json) || typeof fetch === 'undefined') return;
  const base = import.meta.env.BASE_URL;
  type Atlas = { frames: Record<string, { frame: { x: number; y: number; w: number; h: number } }>; meta: { size: { w: number; h: number } } };
  fetch(`${base}assets/${json}`)
    .then((r) => (r.ok ? (r.json() as Promise<Atlas>) : null))
    .then((a) => {
      const f = a?.frames[frame]?.frame;
      if (!a || !f) return;
      node.style.setProperty('--fx', String(f.x));
      node.style.setProperty('--fy', String(f.y));
      node.style.setProperty('--fw', String(f.w));
      node.style.setProperty('--aw', String(a.meta.size.w));
      node.style.setProperty('--ah', String(a.meta.size.h));
      node.style.backgroundImage = `url("${base}assets/${tex}")`;
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
