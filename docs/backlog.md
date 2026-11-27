# Backlog

Regras em [`modo_trabalho/Tasks.md`](../modo_trabalho/Tasks.md). Tamanho: P (≤1 sessão), M (1–2), G (3+).

## M1 (v0.2.0): Fundação

| Id | Descrição | Marco | Agente(s) | Estado |
|---|---|---|---|---|
| T-001 | Estrutura do projeto: Vite + TS + Phaser 3, pastas do GDD, Vitest, scripts npm, cena placeholder (tam. M) | M1 | AG07 | feita |
| T-002 | CI no GitHub Actions: `npm ci`, testes e build em push/PR na `dev` (tam. P) | M1 | AG07 | feita (não rodou no Actions ainda) |
| T-003 | Deploy por tag no Netlify, endereço por versão (decisão 6) (tam. P) | M1 | AG07 | feita (deploy real só na tag) |
| T-009 | PWA: manifest, service worker com cache offline, ícones provisórios, instalável em retrato (decisão 7) (tam. P) | M1 | AG07 | feita (ícones provisórios) |
| T-010 | Deploy em produção a cada merge na `main` (decisão 8) (tam. P) | M1 | AG07 | feita (confirma no 1º merge) |
| T-011 | Deploy a cada push na `dev` em `dev--runesling.netlify.app` (decisão 9) (tam. P) | M1 | AG07 | feita |
| T-004 | Validação do M1 e tag v0.2.0 (tam. P) | M1 | AG03 + AG00 | feita (passa com ressalvas; falta a tag após o merge) |

## Fora de marco

| Id | Descrição | Marco | Agente(s) | Estado |
|---|---|---|---|---|
| T-012 | Remover o deploy por tag do `deploy.yml` (decisão 11) (tam. P) | M2 | AG07 | feita |

## M2 (v0.3.0): Núcleo puro

| Id | Descrição | Marco | Agente(s) | Estado |
|---|---|---|---|---|
| T-005 | JSONs de conteúdo do Capítulo 1 (enemies, perks, arenas, chapters, talents) e tipos/schemas (tam. M) | M2 | AG04 | feita |
| T-006 | `PhysicsEngine` puro com sub-stepping, círculo/AABB, escudo frontal, amortecimento e testes (tam. M) | M2 | AG01 | feita (chão e ghost/wall_clone vão na T-007) |
| T-007 | `CombatResolver`: dano, perks, sinergias, cadeia de mortes, fim de turno, com testes (tam. G) | M2 | AG01 | feita (regras confirmadas nas decisões 13–15) |
| T-013 | Ressalvas do QA do M2: Orbe Fantasma sobre Cavaleiro com `blocked` falso (M2-02) ponta da previsão fora da margem (M2-03), chão não ativa a Tabela Letal (decisão 16) e +60 da vitória sem a Cobiça (decisão 17) (tam. P) | M2 | AG01 | feita |
| T-014 | Versão 0.3.0 em `package.json` e no teste de versão (tam. P) | M2 | AG07 | feita |
| T-008 | Validação do M2 e tag v0.3.0 (tam. P) | M2 | AG03 + AG00 | feita (passa com ressalvas; falta versão e tag) |

## M3 (v0.4.0): Partida jogável

| Id | Descrição | Marco | Agente(s) | Estado |
|---|---|---|---|---|
| T-015 | Fluxo de cenas, contrato do EventBus partida ↔ UI e fontes .woff2 empacotadas (decisão 24) (tam. P) | M3 | AG07 | feita |
| T-016 | Save do jogador (ouro, melhor onda, talentos, configurações) e compra de talentos sobre o SaveManager (decisão 26) (tam. P) | M3 | AG04 | feita |
| T-017 | BattleScene: desenho procedural, mira em qualquer ponto, previsão, partida ligada ao Match, 2× e Recolher (decisão 19) (tam. G) | M3 | AG01 | feita |
| T-018 | UI: strings pt-BR, CSS com variáveis, HUD, barra inferior, Draft, Menu, Talentos, Fim de run, Pausa/configurações (decisões 22, 23, 25) (tam. G) | M3 | AG02 | feita |
| T-019 | Game feel básico: hit-flash, números flutuando, tremida de tela, partículas simples (decisão 21) (tam. P) | M3 | AG01 | feita |
| T-020 | Versão 0.4.0 (tam. P) | M3 | AG07 | feita |
| T-022 | Ressalvas do QA do M3 (UI): HUD não bloqueia a mira onde cobre o campo (M3-01); chaves de strings para os textos da cena (M3-02); rótulos 1× / 1,5× (decisão 27) (tam. P) | M3 | AG02 | feita |
| T-023 | Ressalvas do QA do M3 (cena): textos da cena via `strings.ts` (M3-02) e fonte 900 inexistente (M3-03); velocidade (decisão 27); recolher automático (decisão 28) (tam. P) | M3 | AG01 | feita |
| T-021 | Validação do M3 e tag v0.4.0 (tam. P) | M3 | AG03 + AG00 | feita (passa com ressalvas; falta a tag) |

## M4 (v0.5.0): Pipeline de arte

| Id | Descrição | Marco | Agente(s) | Estado |
|---|---|---|---|---|
| T-024 | Guia visual (`docs/arte.md`) e manifesto com o prompt exato de cada imagem, âncoras primeiro (decisões 29, 31, 32) (tam. P) | M4 | AG08 | feita |
| T-025 | Pipeline: ingestão das imagens do dono, recorte de fundo, trim/centro/máscara circular, atlases WebP e `preview.html` (decisão 30) (tam. M) | M4 | AG08 | feita |
| T-026 | Rodar o pipeline com as imagens do dono e gerar os atlases (depende das imagens) (tam. P) | M4 | AG08 | feita (31/31 imagens) |
| T-027 | Cena usa os sprites por `spriteKey` (com fallback procedural), chão e moldura da arena (tam. M) | M4 | AG01 | feita |
| T-028 | Ícones de runas e talentos na UI: Draft, Talentos, faixa de runas (decisão 32) (tam. P) | M4 | AG02 | feita |
| T-029 | Carregar atlases no Boot, ícone definitivo do PWA e versão 0.5.0 (tam. P) | M4 | AG07 | feita |
| T-031 | UI só pede ícones que existem (usar a lista de assets do build, `src/core/assetManifest.ts`) e favicon do site, para não gerar 404 no console (tam. P) | M4 | AG02 + AG07 | feita |
| T-032 | Pilar: sprite esticado para o retângulo exato da colisão (decisão 34) (tam. P) | M4 | AG01 | feita |
| T-033 | Revisar `icon_static_crit`: em 34 px se confunde com `icon_chain_lightning` (dono decide depois) (tam. P) | M4 | AG08 | a fazer |
| T-034 | PWA se atualiza sozinho: recarregar quando houver versão nova e checar atualização periodicamente (o aparelho do dono ficou preso numa versão antiga) (tam. P) | M4 | AG07 | feita |
| T-042 | Tirar do build a fonte do ícone do app (`app_icon.png`, 1,1 MB, só serve para gerar os ícones) e conferir o peso do build (dist em 3,8 MB, limite 4 MB) (tam. P) | M4 | AG07 + AG08 | feita (dist 2,1 MB) |
| T-043 | Largura da moldura lateral (hoje 10 px): dono decide depois de testar no celular (tam. P) | M4 | AG01 | adiada pelo dono |
| T-030 | Validação do M4 e tag v0.5.0 (tam. P) | M4 | AG03 + AG00 | feita (passa com ressalvas; falta a tag) |

## M5 (v0.6.0): Nova UI

| Id | Descrição | Marco | Agente(s) | Estado |
|---|---|---|---|---|
| T-035 | Mockups das 3 direções visuais da UI (Menu, HUD e Draft em cada) para o dono escolher (decisão 38) (tam. P) | M5 | AG08 | feita |
| T-036 | Guia de UI da direção A e prompts das peças de UI para o Gemini (molduras 9-slice, botões, fitas, cartas por sinergia, ícones do HUD) (tam. P) | M5 | AG08 | feita |
| T-037 | Menu e Talentos na direção A, primeiro com peças em CSS como no mockup (tam. M) | M5 | AG02 | feita (peças em CSS até a T-039) |
| T-038 | HUD, Draft, Fim de run e Pausa na direção A, com animações de UI (entrada dos modais, toque nos botões, cartas do Draft) (tam. M) | M5 | AG02 | feita (peças em CSS até a T-039) |
| T-039 | Processar as peças de UI geradas pelo dono e trocar o CSS provisório por elas (depende das imagens) (tam. M) | M5 | AG08 + AG02 | feita (36 peças) |
| T-044 | Ressalvas do QA do M4 na UI: "+" do ouro parece botão sem ação (M4-01); capturar e revisar a tela de derrota nova (M4-02) (tam. P) | M5 | AG02 | feita |
| T-052 | Mockups da nova tela inicial: 3 conceitos (cripta viva, mapa de expedição, lançador em destaque) × 2 variações cada (tam. P) | M5 | AG08 | feita (dono escolhe) |
| T-053 | Mais mockups da tela inicial em outros estilos: acampamento, grimório, arcano neon × 2 variações (tam. P) | M5 | AG08 | feita (dono escolhe) |
| T-054 | Mockup final da tela inicial: 2a com o título na posição da 2b (tam. P) | M5 | AG08 | feita |
| T-055 | Botão JOGAR menos genérico (4 variações) e mockups de Partida, Runas (Draft), Fim de run e Talentos no estilo da tela inicial final (tam. M) | M5 | AG08 | feita (dono escolhe o botão) |
| T-056 | Comportamento de app: sem arrastar além da tela, sem zoom por toque duplo/pinça, sem seleção de texto (decisão 46) (tam. P) | M5 | AG07 + AG02 | feita (falta conferir em iPhone real) |
| T-057 | Aplicar a UI validada (decisões 44 e 45): tela inicial em mapa, botão placa de ferro, Partida, Runas, Fim de run e Talentos, com peças em CSS (tam. G) | M5 | AG02 | feita (falta conferir no aparelho) |
| T-058 | Atualizar os prompts das peças de UI para o estilo validado (botão placa de ferro, fundo e nós do mapa, escudo rachado da derrota) antes de o dono gerar (tam. P) | M5 | AG08 | feita |
| T-060 | Refazer `ui_card_fire`, `ui_card_spectral` e `ui_card_core` no mesmo estilo da `ui_card_lightning` (geradas em IAs diferentes; dono refaz depois) (tam. P) | M5 | AG08 | adiada pelo dono |
| T-061 | Botão temporário na tela inicial para resetar o save (testar derrota); remover antes do M7 (tam. P) | M5 | AG02 + AG04 | feita (remover antes do M7) |
| T-062 | Peças de UI não aparecem no Safari/iPhone: URL relativa em variável CSS (tam. P) | M5 | AG02 | feita (falta conferir no iPhone) |
| T-063 | Recolher sempre visível na barra (desativado quando os orbes estão parados) e faixa de runas zerada ao iniciar nova partida (hoje mostra as da partida anterior até o 1º draft) (tam. P) | M5 | AG02 | feita |
| T-065 | Ressalvas do QA do M5: fallback CSS da placa se a imagem falhar (M5-01); textos cortados em 360×640 na dica e nos nomes de talentos (M5-02) (tam. P) | M6 | AG02 | em andamento |
| T-040 | Versão 0.6.0 (tam. P) | M5 | AG07 | feita |
| T-064 | Limitar o jogo na web a uma moldura de celular (largura/altura máximas, centralizada, fundo decorativo nas laterais) para não esticar HUD e barras em monitores grandes; corrigir a fita de onda cortada ("ON...") (tam. P) | M5 | AG07 + AG02 | feita |
| T-041 | Validação do M5 e tag v0.6.0 (tam. P) | M5 | AG03 + AG00 | feita (passa com ressalvas; falta a tag) |

## M6 (v0.7.0): Game feel

| Id | Descrição | Marco | Agente(s) | Estado |
|---|---|---|---|---|
| T-045 | Motor de som sintetizado (Web Audio): catálogo de efeitos por evento, tom pelo combo, variação ±8%, liberação no 1º toque, volume e mudo (decisão 39) (tam. M) | M6 | AG11 | em andamento |
| T-046 | Ligar os sons aos eventos da partida e da UI (impacto, bumper, explosão, raio, morte, barreira, draft, botões) (tam. P) | M6 | AG01 + AG02 | a fazer |
| T-047 | Partículas com brilho aditivo e bloom leve; squash e tremida de tela mais fortes (decisão 41) (tam. M) | M6 | AG09 | em andamento |
| T-048 | Contador de combo visível durante o voo, com cor e escala crescentes (decisão 41) (tam. P) | M6 | AG09 | a fazer |
| T-049 | Configurações: volume dos efeitos (o liga/desliga já existe) e "reduzir movimento" (decisão 42) (tam. P) | M6 | AG02 + AG04 | a fazer |
| T-050 | Versão 0.7.0 (tam. P) | M6 | AG07 | a fazer |
| T-051 | Validação do M6 e tag v0.7.0 (tam. P) | M6 | AG03 + AG00 | a fazer |
