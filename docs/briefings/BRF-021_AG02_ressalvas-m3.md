# BRF-021 — AG02 — T-022 Ressalvas do QA do M3 (UI)
**Leia:** `docs/qa/qa-M3.md` (M3-01, M3-02), `docs/decisoes.md` 27; só os trechos citados de `src/ui/` e `src/styles/`. **Regra:** respostas curtas; sem commit/push/branches.
**Decisão do dono:** 27 — o botão de velocidade mostra "1×" no normal (`speed: 1` no `run:state`) e "1,5×" no rápido (`speed: 2`).
**Contrato (AG01 em paralelo):** acrescente em `src/ui/strings.ts` as chaves para os textos hoje soltos na cena (`RunController.ts:46,48`, `FxDirector.ts:56`: veja quais textos são): `run.bannerWave` ("ONDA {wave}/{total}"), `run.bannerBoss` ("{name}"), e `fx.ring` ("×2!"), mais o que mais houver nessas linhas. O AG01 vai importar `t` de `src/ui/strings.ts` com essas chaves exatas.
**Fazer:** (1) M3-01: onde o HUD/faixa de runas cobre o campo (telas baixas e desktop), só os botões recebem toque; faixas e painéis com `pointer-events: none` (`src/styles/ui.css:205-207`); confira que a mira funciona arrastando sobre a faixa de runas. (2) Chaves do contrato. (3) Rótulos da decisão 27 (`hud.speed` por nível) e `aria-label`. (4) Testes em `tests/ui/` atualizados.
**Permitido:** `src/ui/`, `src/styles/`, `tests/ui/`. **Proibido:** o resto.
**Pronto quando:** typecheck e suíte verdes.
**Entrega:** até 4 linhas, incluindo as chaves criadas e o que não foi verificado.
