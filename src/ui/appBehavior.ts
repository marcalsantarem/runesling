/**
 * Comportamento de app (decisão 46, T-056): sem zoom por pinça/toque duplo, sem menu de contexto
 * e sem seleção de texto. O CSS (index.html, ui.css) faz a maior parte; estes listeners cobrem
 * o que o CSS não segura (iOS Safari ignora `user-scalable=no` e emite `gesture*`).
 * Campos editáveis continuam selecionáveis e com menu de contexto.
 */

type Target = Pick<Document, 'addEventListener' | 'removeEventListener'>;

/** Campo de texto que precisa manter seleção e menu de contexto. */
export function isEditable(target: EventTarget | null): boolean {
  const node = target as (Partial<HTMLElement> & { closest?: (s: string) => Element | null }) | null;
  if (!node || typeof node.closest !== 'function') return false;
  return node.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]') !== null;
}

/** Instala os bloqueios e devolve a função que os remove. */
export function installAppBehavior(doc: Target = document): () => void {
  const block = (e: Event): void => {
    if (e.cancelable) e.preventDefault();
  };
  const blockOutsideFields = (e: Event): void => {
    if (!isEditable(e.target)) block(e);
  };
  // Pinça: dois ou mais dedos. Um dedo (mira, rolagem interna) passa.
  const blockMultiTouch = (e: Event): void => {
    const touches = (e as TouchEvent).touches;
    if (touches && touches.length > 1) block(e);
  };
  // Zoom por Ctrl+roda / pinça no trackpad (desktop).
  const blockCtrlWheel = (e: Event): void => {
    if ((e as WheelEvent).ctrlKey) block(e);
  };

  const active = { passive: false } as AddEventListenerOptions;
  const listeners: Array<[string, (e: Event) => void, AddEventListenerOptions]> = [
    ['gesturestart', block, active],
    ['gesturechange', block, active],
    ['gestureend', block, active],
    ['touchmove', blockMultiTouch, active],
    ['wheel', blockCtrlWheel, active],
    ['dblclick', block, active],
    ['contextmenu', blockOutsideFields, active],
    ['selectstart', blockOutsideFields, active],
    ['dragstart', blockOutsideFields, active],
  ];
  for (const [type, fn, opts] of listeners) doc.addEventListener(type, fn, opts);
  return () => {
    for (const [type, fn, opts] of listeners) doc.removeEventListener(type, fn, opts);
  };
}
