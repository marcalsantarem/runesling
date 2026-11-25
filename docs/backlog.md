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
| T-013 | Ressalvas do QA do M2: Orbe Fantasma sobre Cavaleiro com `blocked` falso (M2-02) ponta da previsão fora da margem (M2-03), chão não ativa a Tabela Letal (decisão 16) e +60 da vitória sem a Cobiça (decisão 17) (tam. P) | M2 | AG01 | a fazer |
| T-014 | Versão 0.3.0 em `package.json` e no teste de versão (tam. P) | M2 | AG07 | a fazer |
| T-008 | Validação do M2 e tag v0.3.0 (tam. P) | M2 | AG03 + AG00 | feita (passa com ressalvas; falta versão e tag) |
