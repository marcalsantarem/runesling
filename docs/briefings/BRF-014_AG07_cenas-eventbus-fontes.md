# BRF-014 — AG07 — T-015 Fluxo de cenas, contrato do EventBus e fontes
**Leia:** `docs/agentes/AG07_Arquiteto.md`, `docs/decisoes.md` 19–26, `src/core/EventBus.ts`, `src/main.ts`, `src/scenes/BootScene.ts`. **Regra:** respostas curtas; sem commit/push/branches.
**Decisão do dono:** 24 (fontes no build), 25 (CSS puro), 22 (telas).
**Contrato (o AG01 e o AG02 implementam em cima dele na próxima onda; o AG04 trabalha em paralelo em `src/meta/profile.ts`):**
`src/core/events.ts` exporta `GameEvents` (tipos abaixo) e um bus único `gameBus = new EventBus<GameEvents>()`.
- Jogo → UI: `app:ready {}`; `run:state {hp, maxHp, atk, orbs, wave, totalWaves, gold, speed: 1|2, phase: 'aim'|'flight'|'resolving'|'draft'|'ended'}`; `run:banner {text}`; `draft:open {choices: PerkId[]}`; `run:ended {won, wave, goldEarned}`.
- UI → Jogo: `ui:startRun {}`; `ui:toggleSpeed {}`; `ui:recall {}`; `ui:pickPerk {perkId: PerkId}`; `ui:pause {paused: boolean}`; `ui:quitRun {}`.
- `PerkId` vem de `src/data/types.ts`.
**Fazer:**
(1) `src/core/events.ts` com o contrato acima e testes do tipo/uso básico.
(2) Fluxo de cenas: `BootScene` espera as fontes (`document.fonts.ready`, com timeout) e emite `app:ready`; em `ui:startRun` inicia a cena `'Battle'`; em `ui:quitRun` para a cena `'Battle'`. Crie `src/scenes/BattleScene.ts` **só como stub** (classe com key `'Battle'`, sem lógica) — o AG01 é o dono e vai substituí-lo. Registre as cenas em `src/main.ts`.
(3) Fontes: Cinzel (700, 900) e Plus Jakarta Sans (600, 700, 800) empacotadas (ex.: pacotes `@fontsource/*` com versão fixa, só os pesos e o subset latin), carregadas por CSS no build e incluídas no precache do PWA. Exporte as famílias em `src/core/fonts.ts` (`FONT_TITLE`, `FONT_UI`).
(4) Garanta que `#ui-root` cubra o canvas, com `pointer-events: none` no container e o AG02 liga por elemento.
**Permitido:** `src/core/events.ts`, `src/core/fonts.ts`, `src/main.ts`, `src/scenes/BootScene.ts`, `src/scenes/BattleScene.ts` (stub), `index.html`, `vite.config.ts`, `package.json`/lock (só fontes), `tests/core/`. **Proibido:** o resto (inclusive `src/meta/`, `src/match/`, `src/ui/`).
**Pronto quando:** typecheck, suíte e build verdes; build medido; fontes no `dist/` e no precache.
**Entrega:** até 6 linhas: arquivos, tamanho do `dist/`, peso das fontes, o que não foi verificado.
