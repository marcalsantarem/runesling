# BRF-006 — AG07 — T-011 Deploy da dev
**Leia:** `.github/workflows/deploy.yml`. **Regra:** respostas curtas; sem commit/push/branches.
**Decisão do dono:** 9 — cada push na `dev` publica em `https://dev--runesling.netlify.app` (alias `dev`, sem `--prod`). Main (`--prod`) e tag (alias da versão) continuam iguais.
**Fazer:** adicionar o gatilho `dev` no `deploy.yml` com deploy `--alias dev`, link no resumo do job; manter `concurrency` por ref.
**Permitido:** `.github/workflows/deploy.yml`. **Proibido:** o resto.
**Pronto quando:** YAML válido; os três caminhos (main, dev, tag) conferidos.
**Entrega:** até 3 linhas, incluindo o que não foi verificado.
