# BRF-055 — AG02 — T-065 Ressalvas do QA do M5
**Leia:** `docs/qa/qa-M5.md` (M5-01 e M5-02); `src/styles/ui-skin.css`; `src/styles/ui.css`; `src/ui/skin.ts`. **Regra:** respostas curtas; sem commit/push/branches.
**Fazer:**
- **M5-01:** se a imagem de uma peça falhar ao carregar (rede, 404), o botão/painel não pode ficar só com o texto: manter o fallback CSS por baixo da imagem (camadas de background) ou só aplicar a classe `skin-*` depois que a imagem carregar (`Image.decode()`/`onload`). Vale para todas as peças, não só a placa.
- **M5-02:** em 360×640 a dica da faixa ("Arraste na arena…") e os nomes de talentos saem cortados com reticências: quebrar em 2 linhas ou reduzir a fonte só em telas estreitas, sem cortar texto.
- Testes em `tests/ui/` (peça que falha mantém o fallback).
**Permitido:** `src/ui/`, `src/styles/`, `tests/ui/`. **Proibido:** o resto.
**Pronto quando:** `npm test` e `npm run build` passam; captura em 360×640 (Partida e Talentos) e uma com as peças bloqueadas na rede, no scratchpad. **Entrega:** até 4 linhas.
