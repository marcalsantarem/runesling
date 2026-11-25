# Decisões

Regras em [`modo_trabalho/Decisoes.md`](../modo_trabalho/Decisoes.md).

| # | Tema | Estado | Decisão | Origem e data |
|---|---|---|---|---|
| 1 | Bíblia do projeto | Decidido | O GDD v1.0 (`docs/gdd.md`) é o documento principal do projeto. | Definido pelo dono do projeto em 2026-11-25 |
| 2 | Modo de trabalho | Decidido | O projeto segue a pasta `modo_trabalho/`, copiada de `marcalsantarem/padrao`. | Definido pelo dono do projeto em 2026-11-25 |
| 3 | Stack | Decidido | TypeScript + Vite + Phaser 3 (sem Arcade/Matter), física própria em TS puro, UI em HTML/CSS sobre o canvas via EventBus, Capacitor.js para mobile, localForage para save (GDD §7.1). | Definido pelo dono do projeto em 2026-11-25 (GDD) |
| 4 | Vertical slice | Decidido | `reference/vertical-slice-v0.1.html` é a referência de comportamento e números para o port; o código novo não o reaproveita direto. | Definido pelo dono do projeto em 2026-11-25 |
| 5 | Time inicial | Decidido | Time base de 7 agentes (AG00, AG01, AG02, AG03, AG04, AG07, AG08) mais AG13 (Monetização) cedo, só para desenhar economia com o AG04, por ser free-to-play mobile. Demais reservados. | Regra de `modo_trabalho/Time_inicial.md`, 2026-11-25 |
| 6 | Hosting do link de teste | Substituída pela 8 | Deploy no Netlify, site `runesling.netlify.app`. Secrets já estão no repositório. Cada tag publica num endereço próprio da versão (`v0-2-0--runesling.netlify.app`), nunca em produção (`modo_trabalho/Deploy.md`). | Definido pelo dono do projeto em 2026-11-25 |
| 7 | PWA no M1 | Decidido | O M1 inclui os ajustes para o jogo funcionar como PWA (instalável e com cache offline). | Definido pelo dono do projeto em 2026-11-25 |
| 8 | Deploy em produção | Substituída pela 11 | Substitui a 6. Netlify, site `runesling.netlify.app`. Cada merge de PR na `main` publica em produção (`runesling.netlify.app`). Cada tag `vX.Y.Z` continua publicando o link da versão (`vX-Y-Z--runesling.netlify.app`). | Definido pelo dono do projeto em 2026-11-25 |
| 9 | Deploy da dev | Decidido | Cada push na `dev` publica em `dev--runesling.netlify.app` (alias `dev`, sem `--prod`). Complementa a 8. | Definido pelo dono do projeto em 2026-11-25 |
| 10 | Disparo de tasks | Decidido | O AG00 nunca dispara uma task (agente) por conta própria. Ele lista as tasks e só dispara as que o dono autorizar explicitamente, e somente essas. Prevalece sobre a autonomia de `modo_trabalho/Delegacao.md`. | Definido pelo dono do projeto em 2026-11-25 |
| 11 | Deploys só da main e da dev | Decidido | Substitui a 8. Só dois deploys: merge na `main` → `runesling.netlify.app` (produção) e push na `dev` → `dev--runesling.netlify.app` (decisão 9). Tag de versão não faz deploy. | Definido pelo dono do projeto em 2026-11-25 |
