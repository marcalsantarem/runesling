# BRF-018 — AG01 — T-019 Game feel básico
**Leia:** `docs/decisoes.md` 21; `docs/gdd.md` §6.3 (feedback visual); seu `src/scenes/BattleScene.ts` e `src/scenes/views/`; no slice `reference/vertical-slice-v0.1.html` linhas 854–863 (partículas e números) e 1346–1524 (desenho dos efeitos). **Regra:** respostas curtas; sem commit/push/branches.
**Decisão do dono:** 21 — só o básico do slice: hit-flash (tint branco 50 ms), *squash & stretch* do medalhão (1.18× voltando com interpolação exponencial), números de dano flutuando (crítico em dourado e maior), tremida de tela proporcional (dano normal 0, explosão 7 px, invasão da barreira 12 px), partículas simples (faíscas no impacto, explosão, morte), raio do Raio em Cadeia e feixe do atirador. **Sem** aditivo/bloom/haptics/áudio (M5).
**Contrato:** usar os eventos de saída do `CombatResolver` já existentes; nada muda no `gameBus` nem na UI.
**Fazer:** (1) Efeitos em `src/scenes/fx/` (pool de partículas e textos; sem alocação por frame). (2) Ligar na `BattleScene`. (3) Respeitar o teto de desempenho: com 28 orbes e muitos efeitos, manter o passo fixo de 60 Hz. (4) Testes da lógica pura (pool, curva do squash, intensidade do shake).
**Permitido:** `src/scenes/BattleScene.ts`, `src/scenes/views/`, `src/scenes/fx/`, `tests/match/`. **Proibido:** o resto.
**Pronto quando:** typecheck, suíte e build verdes; captura conferida durante uma explosão/combo no navegador (`vite preview`; a UI já está ligada: clicar em JOGAR).
**Entrega:** até 6 linhas: arquivos, nº de testes, FPS observado, capturas, o que não foi verificado.
