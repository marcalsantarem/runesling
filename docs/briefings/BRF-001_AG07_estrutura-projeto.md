# BRF-001 — AG07 — T-001 e T-002 Estrutura do projeto e CI
**Leia:** `docs/agentes/AG07_Arquiteto.md`; `docs/gdd.md` §7.1, §7.2 e §8.7; em `reference/vertical-slice-v0.1.html` só as linhas 640–660 (mundo lógico 360×520, DPR ≤ 2). **Regra:** respostas curtas; sem commit/push/branches.
**Decisão do dono:** 3 (stack) e 4 (slice é só referência).
**Contrato:** donos das pastas conforme `docs/agentes/`: `src/core/PhysicsEngine.ts` e `CombatResolver.ts`, `src/match/`, `src/scenes/BattleScene.ts` → AG01; `src/ui/`, `src/styles/`, `index.html` → AG02; `src/data/`, `src/meta/`, `tools/sim/` → AG04; `art-source/`, `scripts/`, `public/assets/` → AG08. Crie essas pastas só com `.gitkeep` (sem código delas), exceto o mínimo de `index.html` para montar o jogo.
**Fazer:**
(1) Projeto Vite + TypeScript estrito + Phaser 3 (versão estável fixa), sem Arcade/Matter. Scripts npm: `dev`, `build` (`tsc && vite build`), `preview`, `test` (Vitest), `typecheck`. Deixe os scripts `assets:*` e `mobile:sync` do GDD §8.7 de fora por ora (pipeline e Capacitor vêm depois).
(2) Pastas do GDD §7.2 + `src/match/`, `src/meta/`, `src/styles/`, `tests/{core,match,meta,ui}/`, `tools/sim/`.
(3) `src/main.ts`: inicia Phaser (WebGL com fallback Canvas, escala FIT em retrato, mundo 360×520, fundo `#0D1020`) e uma camada `#ui-root` HTML sobre o canvas.
(4) `src/core/EventBus.ts` tipado (mapa de eventos genérico, `on/off/emit`) com testes.
(5) `src/core/SaveManager.ts` com interface assíncrona sobre localForage (`load/save/reset`, dados versionados) e testes (mock de storage).
(6) `src/scenes/BootScene.ts` placeholder que mostra "RuneSling v<versão>" lendo a versão de `package.json` (versão `0.2.0`), e teste que confere a versão.
(7) `.gitignore` (node_modules, dist, `.env`, `art-source/raw/`, `art-source/cut/`, `art-source/.cache.json`).
(8) T-002: `.github/workflows/ci.yml` — em push e PR na `dev`/`main`: `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, e reporta o tamanho de `dist/`.
(9) `README.md` curto: como rodar (`npm install`, `npm run dev`, `npm test`).
**Permitido:** raiz do repositório (configs), `.github/`, `src/main.ts`, `src/core/EventBus.ts`, `src/core/SaveManager.ts`, `src/scenes/BootScene.ts`, `tests/core/`, `index.html`, `README.md`, `.gitkeep` nas pastas acima. **Proibido:** `docs/`, `modo_trabalho/`, `reference/`, `CLAUDE.md`, `.claude/`, código nas pastas de outros agentes.
**Pronto quando:** `npm ci && npm run typecheck && npm test && npm run build` passam sem erro nem aviso de teste ignorado; `dist/` medido.
**Entrega:** até 8 linhas: arquivos criados, versões das dependências, nº de testes, tamanho do `dist/`, o que não foi verificado (ex.: execução no navegador).
