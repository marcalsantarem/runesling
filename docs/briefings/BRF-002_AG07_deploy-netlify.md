# BRF-002 — AG07 — T-003 Deploy por tag no Netlify
**Leia:** `docs/agentes/AG07_Arquiteto.md`, `modo_trabalho/Deploy.md` (seção Deploy), `.github/workflows/ci.yml`. **Regra:** respostas curtas; sem commit/push/branches.
**Decisão do dono:** 6 — Netlify, site `runesling.netlify.app`, secrets já no repositório.
**Fazer:** (1) `.github/workflows/deploy.yml`: em push de tag `v*`, `npm ci`, testes, build e deploy de `dist/` no Netlify com alias da versão (`v0.2.0` → alias `v0-2-0`, link `https://v0-2-0--runesling.netlify.app`), **sem** `--prod`. Use a Netlify CLI fixada em versão no workflow. Secrets esperados: `NETLIFY_AUTH_TOKEN` e `NETLIFY_SITE_ID` (se usar outros nomes, diga). (2) O link da versão sai no resumo do job. (3) `netlify.toml` mínimo (publish `dist`, cabeçalhos de cache: `index.html` e service worker sem cache longo; `/assets/*` imutável).
**Permitido:** `.github/workflows/deploy.yml`, `netlify.toml`. **Proibido:** o resto.
**Pronto quando:** YAML válido (confira com uma ferramenta de lint de YAML se houver) e a suíte local continua verde.
**Entrega:** até 5 linhas, incluindo nomes dos secrets usados e o que não foi verificado.
