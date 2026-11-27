# BRF-042 — AG07 (com a parte de CSS da UI) — T-056 Comportamento de app
**Leia:** `docs/decisoes.md` 46; `index.html`; `src/styles/ui.css`; `src/ui/` (só para entender onde há rolagem e textos). **Regra:** respostas curtas; sem commit/push/branches.
**Problema (dono):** no celular o jogo se comporta como página: dá para arrastar a tela além da área visível (rolagem/"elástico"), dá zoom com toque duplo e dá para selecionar textos. Deve se comportar como aplicativo.
**Fazer:**
- Sem rolagem nem elástico da página: `overscroll-behavior: none` em `html`/`body`, `position: fixed`/altura em `100dvh` quando preciso; nenhuma área além da tela. Listas que precisam rolar por dentro (ex.: Talentos) continuam rolando, mas com `overscroll-behavior: contain` (sem puxar a página).
- Sem zoom: manter o viewport atual; `touch-action: manipulation` (ou `none` no canvas) para matar o zoom por toque duplo, inclusive no iOS Safari; bloquear `gesturestart`/pinça com `preventDefault` se o CSS não bastar; não quebrar a mira por arrastar no canvas.
- Sem seleção: `user-select: none` e `-webkit-user-select: none` globais, `-webkit-touch-callout: none`, `-webkit-tap-highlight-color: transparent`; menu de contexto (pressão longa/clique direito) desabilitado. Campos de texto, se existirem, continuam selecionáveis.
- Testes em `tests/` que conferem essas regras (CSS/meta/listeners) onde for viável com happy-dom.
**Permitido:** `index.html`, `src/styles/`, `src/main.ts`, `src/ui/` (só o necessário para os listeners/rolagem interna), `tests/`. **Proibido:** o resto.
**Pronto quando:** `npm test` e `npm run build` passam; conferido no Chromium com emulação de celular (toque duplo não dá zoom, página não rola, texto não seleciona, mira e botões continuam funcionando). **Entrega:** até 4 linhas, com o que não deu para verificar sem aparelho real (iOS).
