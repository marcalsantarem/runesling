# BRF-005 — AG03 — T-004 Validação do M1
**Leia:** `docs/agentes/AG03_QA.md`, `modo_trabalho/Validacao.md`, `docs/backlog.md` (M1), `README.md`. **Regra:** respostas curtas; sem commit/push/branches.
**Decisão do dono:** 7 (PWA) e 8 (deploy: main → produção; tag → alias).
**Fazer:** (1) `npm ci`, typecheck e suíte 3 vezes; conferir contagem (19 esperados). (2) `npm run build` e medir `dist/` (< 4 MB). (3) `vite preview` + Playwright (Chromium já instalado; script fora do repositório, no scratchpad): carga sem erros, capturas em 360×640, 390×844 e 412×915 retrato; PWA: manifest, SW ativo e recarga offline. (4) Revisar `ci.yml` e `deploy.yml` contra as decisões (gatilhos, `--prod` só na main, alias na tag). (5) Classificar pendências conhecidas: ícones PWA provisórios; deploy não executado de verdade; 4 vulnerabilidades moderadas só em devDependencies; `chunkSizeWarningLimit` 1600 e `.npmrc` `legacy-peer-deps`. (6) Escrever `docs/qa/qa-M1.md` com veredito, achados (arquivo:linha) e roteiro curto para o dono testar no celular (instalar PWA, abrir offline).
**Permitido:** `docs/qa/`, `tests/` (só testes que provam defeito). **Proibido:** o resto. Capturas ficam fora do repositório.
**Pronto quando:** `docs/qa/qa-M1.md` escrito com veredito.
**Entrega:** até 6 linhas: veredito, nº de testes, tamanho, achados graves, o que não foi verificado.
