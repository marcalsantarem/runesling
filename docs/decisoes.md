# Decisões

Regras em [`modo_trabalho/Decisoes.md`](../modo_trabalho/Decisoes.md).

| # | Tema | Estado | Decisão | Origem e data |
|---|---|---|---|---|
| 1 | Bíblia do projeto | Decidido | O GDD v1.0 (`docs/gdd.md`) é o documento principal do projeto. | Definido pelo dono do projeto em 2026-11-25 |
| 2 | Modo de trabalho | Decidido | O projeto segue a pasta `modo_trabalho/`, copiada de `marcalsantarem/padrao`. | Definido pelo dono do projeto em 2026-11-25 |
| 3 | Stack | Decidido | TypeScript + Vite + Phaser 3 (sem Arcade/Matter), física própria em TS puro, UI em HTML/CSS sobre o canvas via EventBus, Capacitor.js para mobile, localForage para save (GDD §7.1). | Definido pelo dono do projeto em 2026-11-25 (GDD) |
| 4 | Vertical slice | Decidido | `reference/vertical-slice-v0.1.html` é a referência de comportamento e números para o port; o código novo não o reaproveita direto. | Definido pelo dono do projeto em 2026-11-25 |
| 5 | Time inicial | Decidido | Time base de 7 agentes (AG00, AG01, AG02, AG03, AG04, AG07, AG08) mais AG13 (Monetização) cedo, só para desenhar economia com o AG04, por ser free-to-play mobile. Demais reservados. | Regra de `modo_trabalho/Time_inicial.md`, 2026-11-25 |
| 6 | Hosting do link de teste | A definir | Onde a tag publica o build de teste (Netlify, Itch.io, GitHub Pages…). Necessário para o fechamento do M1. | — |
