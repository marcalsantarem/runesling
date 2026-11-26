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
| 12 | Rodada de definição do marco | Decidido | A partir do M3, antes de quebrar um marco em tasks, o AG00 analisa o marco e faz uma rodada de perguntas e definições com o dono. Só depois cria as tasks, para evitar retrabalho. | Definido pelo dono do projeto em 2026-11-25 |
| 13 | Orbe Tempestuoso | Decidido | `storm_orb` dá +1 orbe; o +15% de chance só vale com `chain_lightning` (GDD). | Definido pelo dono do projeto em 2026-11-25 |
| 14 | Chama Persistente | Decidido | `ignite` queima só no fim do turno em que o inimigo foi atingido. | Definido pelo dono do projeto em 2026-11-25 |
| 15 | Spawn das ondas | Decidido | Inimigos de cada onda sorteados pelos pesos de `poolByWave` em `chapters.json` (GDD), não pelas faixas do slice. | Definido pelo dono do projeto em 2026-11-25 |
| 16 | Tabela Letal e chão | Decidido | O quique no chão não ativa a Tabela Letal; só paredes, teto, bumpers e pilares (GDD §4.3). | Definido pelo dono do projeto em 2026-11-25 |
| 17 | Bônus de vitória | Decidido | Os +60 de ouro da vitória são somados fixos, sem o multiplicador da Cobiça da Cripta (GDD §5.1). | Definido pelo dono do projeto em 2026-11-25 |
| 18 | Suíte na validação | Decidido | As tasks de validação de marco rodam a suíte de testes **uma vez** só (antes eram 3 rodadas, por `modo_trabalho/Validacao.md`). | Definido pelo dono do projeto em 2026-11-25 |
| 19 | Visual do M3 | Decidido | Inimigos, orbes, bumpers, anel, pilar e arena desenhados por código no estilo do vertical slice; a cena fica pronta para trocar por sprites no M4. | Definido pelo dono do projeto em 2026-11-25 (rodada do M3) |
| 20 | Áudio | Decidido | Sem áudio no M3; os efeitos sonoros entram só no M5, já no formato final. | Definido pelo dono do projeto em 2026-11-25 (rodada do M3) |
| 21 | Game feel no M3 | Decidido | Entra o básico do slice: hit-flash, números de dano flutuando, tremida de tela e partículas simples. Aditivo, bloom e haptics ficam para o M5. | Definido pelo dono do projeto em 2026-11-25 (rodada do M3) |
| 22 | Idioma | Decidido | pt-BR no M3, com todos os textos centralizados num módulo de strings pronto para inglês; o inglês entra antes da publicação (M6). | Definido pelo dono do projeto em 2026-11-25 (rodada do M3) |
| 23 | Telas do M3 | Decidido | Partida (HUD, barra inferior com 2× e Recolher, modal de Draft), Menu principal, Talentos, Fim de run, Pausa e configurações. | Definido pelo dono do projeto em 2026-11-25 (rodada do M3) |
| 24 | Fontes | Decidido | Cinzel e Plus Jakarta Sans empacotadas no build (.woff2), funcionando offline no PWA. | Definido pelo dono do projeto em 2026-11-25 (rodada do M3) |
| 25 | CSS da UI | Decidido | CSS puro com variáveis da paleta do GDD; sem Tailwind. | Definido pelo dono do projeto em 2026-11-25 (rodada do M3) |
| 26 | Save do slice | Decidido | Não migrar o save do vertical slice; o jogo novo começa do zero. | Definido pelo dono do projeto em 2026-11-25 (rodada do M3) |
| 27 | Velocidade do jogo | Decidido | A velocidade normal passa a ser a antiga 2× (2 ciclos de 4 sub-passos por frame). O botão de acelerar leva à antiga 3× (3 ciclos). No botão: "1×" (normal) e "1,5×" (rápido). | Definido pelo dono do projeto em 2026-11-26 |
| 28 | Recolher automático | Decidido | Quando não há mais nenhum inimigo vivo durante o voo, os orbes são recolhidos automaticamente e o turno termina na hora. O botão Recolher continua para os outros casos. | Definido pelo dono do projeto em 2026-11-26 |
| 29 | Fonte da arte | Decidido | O dono gera as imagens manualmente no Gemini, com os prompts exatos entregues pelo AG00 (escritos pelo AG08 no manifesto). Não há chamada de API no pipeline: a etapa `assets:gen` do GDD §8.4 vira a ingestão das imagens enviadas pelo dono. | Definido pelo dono do projeto em 2026-11-26 (rodada do M4) |
| 30 | Remoção de fundo | Decidido | Feita por código no pipeline (o método fica com o AG08: recorte por fundo chapado ou rembg). O dono não recorta nada. | Definido pelo dono do projeto em 2026-11-26 (rodada do M4) |
| 31 | Âncoras de estilo | Decidido | Antes do lote, o dono gera variações do medalhão-âncora (Cavaleiro) e do ícone-âncora (Raio em Cadeia) e escolhe; as escolhidas viram referência de estilo nos demais prompts. | Definido pelo dono do projeto em 2026-11-26 (rodada do M4) |
| 32 | Escopo extra do M4 | Decidido | Além dos assets do GDD §8.9: ícones das 4 runas faltantes (static_crit, storm_orb, molten_core, arcane_sight), ícones na UI (Draft, Talentos, faixa de runas) e ícone definitivo do PWA. | Definido pelo dono do projeto em 2026-11-26 (rodada do M4) |
| 33 | Originais no repositório | Decidido | As imagens originais enviadas pelo dono ficam versionadas em `art-source/raw/` (não são regeneráveis), em vez de ignoradas pelo git. | Proposta do AG00; aprovada pelo dono em 2026-11-26 |
| 34 | Sprite do pilar | Decidido | O sprite do pilar é esticado para caber exatamente na colisão (68×16), mesmo achatando a pedra (~24% na vertical). | Definido pelo dono do projeto em 2026-11-26 |
| 35 | Marco da nova UI | Decidido | O redesign da UI vira o M5 (v0.6.0), logo após o M4. Os marcos seguintes avançam um número (Game feel M6, MVP Web M7 v1.0.0, Retenção M8, Novos capítulos M9, Mobile nativo M10). | Definido pelo dono do projeto em 2026-11-26 (rodada do M5) |
| 36 | Produção da UI | Decidido | Peças de UI (molduras, botões, painéis, fitas, cartas) geradas pelo dono no Gemini com prompts nossos, recortadas pelo pipeline e usadas no CSS (9-slice). | Definido pelo dono do projeto em 2026-11-26 (rodada do M5) |
| 37 | Telas do redesign | Decidido | Menu principal e Talentos, HUD da partida, Draft, Fim de run e Pausa. | Definido pelo dono do projeto em 2026-11-26 (rodada do M5) |
| 38 | Direção visual da UI | Decidido | Direção A, fantasia ornamentada (`docs/mockups/ui-direcoes.html`): molduras de ferro e ouro, placas de pedra, fitas vermelhas nos títulos, botões grossos com relevo, cartas de runa verticais com moldura por sinergia. | Definido pelo dono do projeto em 2026-11-26 (rodada do M5) |
