/** Famílias empacotadas no build (decisão 24); os @font-face ficam em index.html (só .woff2, subset latin). */
export const FONT_TITLE = 'Cinzel';
export const FONT_UI = 'Plus Jakarta Sans';

/** Pilhas CSS com fallback. */
export const FONT_TITLE_STACK = `'${FONT_TITLE}', serif`;
export const FONT_UI_STACK = `'${FONT_UI}', system-ui, sans-serif`;

/** Pesos empacotados por família. */
export const FONT_WEIGHTS = {
  [FONT_TITLE]: [700, 900],
  [FONT_UI]: [600, 700, 800],
} as const;

export const FONT_TIMEOUT_MS = 3000;

/** Descritores para `document.fonts.load` (ex.: `700 16px 'Cinzel'`). */
export function fontDescriptors(): string[] {
  return Object.entries(FONT_WEIGHTS).flatMap(([family, weights]) =>
    weights.map((w) => `${w} 16px '${family}'`),
  );
}

type FontSetLike = Pick<FontFaceSet, 'load' | 'ready'>;

/**
 * Carrega os pesos empacotados e espera `fonts.ready`, com timeout.
 * Nunca rejeita: em falha ou timeout o jogo segue com o fallback. Retorna `true` se carregou a tempo.
 */
export function waitForFonts(
  fonts: FontSetLike | undefined = globalThis.document?.fonts,
  timeoutMs: number = FONT_TIMEOUT_MS,
): Promise<boolean> {
  if (!fonts) return Promise.resolve(false);
  const loaded = Promise.all(fontDescriptors().map((d) => fonts.load(d)))
    .then(() => fonts.ready)
    .then(
      () => true,
      () => false,
    );
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<boolean>((resolve) => {
    timer = setTimeout(() => resolve(false), timeoutMs);
  });
  return Promise.race([loaded, timeout]).finally(() => clearTimeout(timer));
}
