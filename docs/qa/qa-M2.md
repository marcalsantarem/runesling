# QA M2 (v0.3.0): Núcleo puro

**Task:** T-008 (BRF-011). **Agente:** AG03. **Data:** 2026-11-25.
**Veredito: PASSA COM RESSALVAS.** Nenhum bloqueante nem grave. Os números batem com o GDD e com as decisões 13–15. As ressalvas são menores, interpretações herdadas do slice e o bump de versão que ainda falta para a tag.

## Validação feita
| Item | Resultado |
|---|---|
| `npm ci` | ok (as mesmas 4 vulnerabilidades moderadas de devDependencies do M1) |
| `npm run typecheck` | ok, sem erros (o `tsconfig` inclui `tests/`) |
| Suíte 3x antes dos testes do QA | 11 arquivos, **96/96** nas 3 rodadas (esperado: 96) |
| Suíte 3x com `tests/qa/` | 13 arquivos, **116/116** nas 3 rodadas (96 + 20 do QA), cerca de 2,5 s |
| `npm run build` | ok; `dist/` = **1.238.939 bytes (1,3 MB)**, igual ao M1; JS 1.196 kB (319 kB gzip). O núcleo ainda não entra no bundle (`main.ts` não o importa) |
| Pureza do núcleo | `src/core`, `src/match`, `src/meta` e `src/data` sem `phaser`, `window`, `document` nem `Math.random` |
| `deploy.yml` x decisão 11 | ok: dispara só em `push` para `main` e `dev`; `--prod` só na `main`, `--alias dev` na `dev`; não há mais gatilho por tag |

Testes novos: `tests/qa/m2-gdd-numbers.test.ts` (8) e `tests/qa/m2-rules.test.ts` (12). Os scripts de simulação e benchmark ficam fora do repositório, em `/tmp/claude-0/-home-user-runesling/757070c4-75c0-5ae2-865b-7eac2f8a7bba/scratchpad/qa-m2/` (`run20.sim.ts`, `bench.sim.ts`, `ghost.sim.ts`, saídas em `*.out`).

## Números x GDD e decisões
Conferidos com teste (`m2-gdd-numbers.test.ts`), sem divergência:
- §2.2 a trava de 0.14 rad, o cancelamento em 14 px e v0 = 9.5 + min(1, d/120)·3.8. §2.3 N = 4, γ 0.9935 → 0.962 após 340 ticks, γ^(1/N), anti-loop 0.25/1.5/0.04 e o teto de 28 orbes.
- §3.1 as 15 ondas, os drafts 2/4/6/7/9/11/13 com 3 opções e os chefes nas ondas 7 e 15. §3.2 o HP de todos os 9 inimigos nas ondas 1 a 15. §3.3 o raio, M_k e o ouro de cada um, mais as mecânicas (escudo 0.30, atirador 2/1, golem 92 px/2.5×, divisor ±20, clérigo 22%/130 px, mini-chefe 22 px/4 de dano/recuo de 72/invoca a cada 2, chefe atira 2 a cada 2). §3.4 o bumper com +15% e teto de 15.5, e o clone do anel com ±0.22 rad.
- §4 os parâmetros e gatilhos das 15 runas. §4.5 os multiplicadores 2.0/0.7/1.75/1.35 e o mínimo de 1. §5.1 o custo dos 5 talentos em todos os níveis, os níveis máximos, o efeito por nível e o bônus de vitória de +60.
- Decisão 13: `storm_orb` sozinho nunca dispara o raio; com `chain_lightning` a chance vira 0.60. Decisão 14: `ignite` não queima no turno seguinte sem acerto. Decisão 15: em 60 mil sorteios da onda 6, a frequência fica a até 1 p.p. dos pesos de `poolByWave`.

## Run simulada (20 sementes, mira aleatória, 2×, sem balanceamento)
Todas terminaram, nenhuma precisou de recall forçado e todas são determinísticas (2 execuções idênticas por semente). Toda run que chegou à onda 15 teve 7 drafts.
- **Escolhendo a 1ª runa:** onda final 15 em 12 runs (1 vitória e 11 derrotas), 14 em 2, 13 em 1, 12 em 3, 10 em 1 e 9 em 1. Entre 9 e 26 turnos; o voo mais longo durou 245 frames a 2×.
- **Escolhendo uma runa aleatória:** onda final 15 em 16 runs (todas derrotas), 13 em 1, 12 em 2 e 11 em 1.
A taxa de vitória reflete um bot que mira ao acaso, não a dificuldade real.

## Custo do `step()` (Node 22, esta máquina, indicativo)
Com 28 orbes ativos, cerca de 18 inimigos, a arena padrão e 7 runas de combate ativas (`Match.step`, física + combate):
- **1×: 0,067 ms/frame** em média (máximo 0,074). **2×: 0,14 ms/frame** (máximo 0,19).
- Só o motor: 0,061 ms (1×) e 0,106 ms (2×). É menos de 1% do orçamento de 16,6 ms. Falta medir num celular de entrada, com JIT e GC diferentes.

## Achados (nenhum bloqueante nem grave)
**Menores**
1. **M2-01, versão ainda em 0.2.0.** `package.json:4` e `tests/core/version.test.ts:11-16` fixam `0.2.0`. A tag v0.3.0 exige o bump e a atualização desse teste (AG00).
2. **M2-02, Orbe Fantasma ao sair de um Cavaleiro.** `src/core/PhysicsEngine.ts:371-383`: o orbe perfurante entra por cima (sem bloqueio) e acerta. Quando o centro passa do centro do inimigo, n_y > 0.30 e o mesmo contato vira `blocked`: o orbe é empurrado para baixo do escudo, sem reflexão, e emite um `blocked` espúrio. Passos: `ghost.sim.ts` (orbe em 180.5,160 com vy 6, Cavaleiro em 180,200) dá `enemyHit` no frame 2 e `enemyHit blocked` no frame 6. O slice faz o mesmo. Efeito: feedback de "bloqueado" falso no M3. Decidir se o fantasma atravessa só inimigos sem o comportamento `front_shield` (o texto do GDD, "inimigos sem escudo", permite as duas leituras).
3. **M2-03, ponta da previsão fora da margem.** `src/match/aim.ts:110-125`: quando o número de quiques passa do limite, o laço sai e grava o ponto final já fora de `[8, 352]` (até 4 px). É só visual; vale para o M3.
4. **M2-04, quique no chão conta para a Tabela Letal.** `src/core/PhysicsEngine.ts:243-248` marca `bounced` no chão (e no teto). O GDD §4.3 cita "paredes, bumpers ou pilares". O slice faz igual. Confirmar com o dono.
5. **M2-05, bônus de vitória multiplicado pela Cobiça.** `src/match/RunState.ts:123-126` calcula round((ouro + 60) × mult). O GDD §5.1 não diz se os +60 entram no multiplicador. Confirmar.

**Interpretações herdadas do slice (aceitas, registrar no GDD se o dono concordar)**
- O Núcleo de Magma amplia também a explosão do Golem, de 92 para 115 px (`CombatResolver.ts:287,312`). O Golem com `supernova` explode uma vez só, com os números do Golem (`:310-314`).
- O raio em cadeia acerta o 1º inimigo da lista dentro de 155 px, não o mais próximo (`CombatResolver.ts:267-277`), e o clérigo cura o 1º aliado ferido da lista (`:390`).
- O inimigo que recebe o Choque (cadeia ou bumper) já sofre o +35% da Voltagem Crítica no mesmo golpe (`CombatResolver.ts:212-213, 270-275`).
- O crítico só vale no acerto direto de orbe (`CombatResolver.ts:229`).

## Pendências conhecidas, classificadas
| Pendência | Classe | Observação |
|---|---|---|
| Dano resolvido depois do `step()` inteiro (`Match.ts:312-313`, `CombatResolver.ts:177-199`) | Menor, aceita no M2 | Provado por teste em `m2-rules.test.ts`: o orbe B é refletido por um goblin que o orbe A já matou no mesmo frame, e só 1 dano é contado. A janela é de até 4 sub-passos (8 a 2×). É determinístico e não dá dano extra; só muda a trajetória. Rever no M3 se o quique "fantasma" for visível na tela |
| Números do slice usados por falta no GDD (`rules.json:13-22`, `chapters.json:30-36`, `enemies.json` `barrierDmg`/`minHeal`/offsets, `perks.json:55`, `aim.ts:30-34`) | Menor, a registrar | Run inicial 12 HP/3 ATK/2 orbes/5% crit; restituição 0.96/0.94 (o GDD fala em reflexão "elástica"); `stopSpeed` 0.85; orbe 7.5 px; bumper mín. 7.5; folgas; clones de 6.8/6.5 px; leque 0.085; tamanho de onda; layout de spawn; dano na barreira 2; cura mín. 2. Sugestão: o dono confirma e o GDD ou uma decisão registra |
| `fire_splash` com Núcleo de Magma: 76 px x 75 px | Menor, aceita | O código segue o GDD §4.2, que diz 76 explicitamente (`perks.json:25`, `CombatResolver.ts:249`), e o teste do QA prova os 76. Fica inconsistente com "+25%" (60 × 1.25 = 75) e com a supernova, que usa ×1.25 (74 → 92,5). A diferença de 1 px é imperceptível; só uniformizar se o dono quiser |

## Não verificado
- O desempenho num aparelho real: o benchmark foi feito em Node, sem render.
- O balanceamento e a taxa de vitória de um jogador humano: o bot mira ao acaso.
- A integração com Phaser, UI e `SaveManager` numa run: o M2 não tem tela.
- O deploy real da `dev`/`main` com a nova regra da decisão 11 e o GitHub Actions rodando de fato.
- Ondas acima de 15 e capítulos além do 1.

## Roteiro para o dono (o M2 não tem tela)
1. Leia o veredito e a tabela "Pendências conhecidas" acima.
2. Decida os pontos marcados como "confirmar": M2-02 (fantasma x escudo), M2-04 (chão na Tabela Letal), M2-05 (+60 com Cobiça) e os números do slice a registrar no GDD.
3. Confira a "Run simulada": todas as runs terminam e se repetem com a mesma semente.
4. Para a tag v0.3.0, o AG00 precisa subir a versão para 0.3.0 e ajustar `tests/core/version.test.ts` (M2-01).

## Reteste (AG00, 2026-11-25)
T-013 (BRF-012) e T-014 (BRF-013): M2-02 e M2-03 corrigidos com testes; decisões 16 e 17 aplicadas; versão 0.3.0. Typecheck limpo, suíte 119/119, build ok. Restante conhecido (menor): Orbe Fantasma lento que fique mais de 14 frames dentro do Cavaleiro ainda pode emitir `blocked` ao sair; decisão 16 coberta só no evento de física.
