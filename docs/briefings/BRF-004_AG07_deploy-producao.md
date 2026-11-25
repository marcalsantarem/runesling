# BRF-004 — AG07 — T-010 Deploy em produção na main
**Leia:** `.github/workflows/deploy.yml`, `.github/workflows/ci.yml`. **Regra:** respostas curtas; sem commit/push/branches.
**Decisão do dono:** 8 (substitui a 6) — merge na `main` publica em produção `runesling.netlify.app`; tags `v*` mantêm o link da versão por alias.
**Fazer:** (1) No `deploy.yml`, adicionar o gatilho push na `main` com deploy `--prod` (mesmos passos: `npm ci`, typecheck, testes, build). Tag continua com `--alias`, sem `--prod`. (2) Evitar deploys duplicados/concorrentes (`concurrency` por ref). (3) Link publicado no resumo do job nos dois casos.
**Permitido:** `.github/workflows/deploy.yml`. **Proibido:** o resto.
**Pronto quando:** YAML válido e lógica dos dois gatilhos conferida.
**Entrega:** até 4 linhas, incluindo o que não foi verificado.
