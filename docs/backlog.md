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
| T-026 | Rodar o pipeline com as imagens do dono e gerar os atlases (depende das imagens) (tam. P) | M4 | AG08 | em andamento (âncoras; lote conforme chega) |
| T-027 | Cena usa os sprites por `spriteKey` (com fallback procedural), chão e moldura da arena (tam. M) | M4 | AG01 | feita |
| T-028 | Ícones de runas e talentos na UI: Draft, Talentos, faixa de runas (decisão 32) (tam. P) | M4 | AG02 | feita |
| T-029 | Carregar atlases no Boot, ícone definitivo do PWA e versão 0.5.0 (tam. P) | M4 | AG07 | feita |
| T-031 | UI só pede ícones que existem (usar a lista de assets do build, `src/core/assetManifest.ts`) e favicon do site, para não gerar 404 no console (tam. P) | M4 | AG02 + AG07 | em andamento |
| T-032 | Pilar: sprite esticado para o retângulo exato da colisão (decisão 34) (tam. P) | M4 | AG01 | em andamento |
| T-033 | Revisar `icon_static_crit`: em 34 px se confunde com `icon_chain_lightning` (dono decide depois) (tam. P) | M4 | AG08 | a fazer |
| T-034 | PWA se atualiza sozinho: recarregar quando houver versão nova e checar atualização periodicamente (o aparelho do dono ficou preso numa versão antiga) (tam. P) | M4 | AG07 | em andamento |
| T-030 | Validação do M4 e tag v0.5.0 (tam. P) | M4 | AG03 + AG00 | a fazer |
