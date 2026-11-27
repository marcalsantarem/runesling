/**
 * URL absoluta de um arquivo em `public/assets/` (T-062). O WebKit resolve `url()` relativo dentro de
 * variável CSS pela folha onde o `var()` é usado (`/assets/index-*.css`), não pelo documento; por isso
 * toda URL que vai para `url()` montado por JS sai absoluta. Sem `document` (testes em node), cai na raiz.
 */
export function assetUrl(rel: string): string {
  const path = `${import.meta.env.BASE_URL}assets/${rel}`;
  if (typeof document !== 'undefined' && document.baseURI) {
    try {
      return new URL(path, document.baseURI).href;
    } catch {
      /* segue para o fallback */
    }
  }
  return new URL(path, 'http://x/').pathname;
}
