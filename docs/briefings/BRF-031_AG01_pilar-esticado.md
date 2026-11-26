# BRF-031 — AG01 — T-032 Pilar esticado para a colisão
**Leia:** `docs/decisoes.md` 34; seus `src/scenes/views/PillarView.ts` e `src/scenes/views/sprites.ts`. **Regra:** respostas curtas; sem commit/push/branches.
**Decisão do dono:** 34 — o sprite do pilar ocupa exatamente o retângulo da colisão (68×16), mesmo achatando a imagem. Use as dimensões reais do frame (trim) para a escala X e Y separadas.
**Fazer:** ajuste + teste da lógica pura em `tests/match/`; captura no `vite preview` (o atlas real já está em `public/assets/`) mostrando o pilar sobre a colisão.
**Permitido:** `src/scenes/views/`, `tests/match/`. **Proibido:** o resto.
**Pronto quando:** typecheck, suíte e build verdes; captura conferida. **Entrega:** até 3 linhas.
