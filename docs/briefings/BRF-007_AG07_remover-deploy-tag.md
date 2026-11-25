# BRF-007 — AG07 — T-012 Remover deploy por tag
**Leia:** `.github/workflows/deploy.yml`. **Regra:** respostas curtas; sem commit/push/branches.
**Decisão do dono:** 11 (substitui a 8) — só dois deploys: `main` → `--prod` (`runesling.netlify.app`) e `dev` → `--alias dev`. Tag não faz deploy.
**Fazer:** remover o gatilho `tags` e os passos de alias da versão; atualizar os comentários com as decisões 9 e 11.
**Permitido:** `.github/workflows/deploy.yml`. **Proibido:** o resto.
**Pronto quando:** YAML válido; só os caminhos main e dev restam.
**Entrega:** até 3 linhas.
