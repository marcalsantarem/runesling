# QA M3 (v0.4.0): Partida jogável

**Task:** T-021 (BRF-020). **Agente:** AG03. **Data:** 2026-11-25.
**Veredito: PASSA COM RESSALVAS.** Nenhum bloqueante nem grave. O fluxo completo funciona nos 4 tamanhos: Menu → Talentos → JOGAR → mira → Draft → Fim de run (derrota e vitória) → perfil gravado → Menu → jogar de novo, sem erro no console e sem duplicar nada. As ressalvas são de layout em telas baixas e no desktop, textos fora do módulo de strings e as pendências conhecidas.

## Validação feita
| Item | Resultado |
|---|---|
| `npm ci` | ok (as mesmas vulnerabilidades moderadas de devDependencies dos marcos anteriores) |
| `npm run typecheck` | ok, sem erros |
| Suíte (uma vez, decisão 18) | 22 arquivos, **189/189** (esperado: 189), 2,7 s. O QA não acrescentou testes |
| `npm run build` | ok; `dist/` = **1.427.997 bytes (1,4 MB)**, abaixo de 4 MB. JS 1.307 kB (356 kB gzip), CSS 10,8 kB, 5 fontes .woff2 (66 kB). Precache do SW: 18 entradas (1.378 KiB) |
| Navegador | `vite preview` + Playwright (Chromium headless). 360×640, 390×844 e 412×915 com toque (CDP, DPR 2) e 1280×720 com mouse |

Scripts e capturas fora do repositório, em `/tmp/claude-0/-home-user-runesling/757070c4-75c0-5ae2-865b-7eac2f8a7bba/scratchpad/qa-m3/` (`flow.cjs`, `aim.cjs`, `offline.cjs`, `fps.cjs`, `probe*.cjs`; saídas em `*.json`; capturas `<tamanho>-1-menu` a `-8-menu-after.png`).

## Fluxo no navegador (os 4 tamanhos, salvo indicação)
| Passo | Resultado |
|---|---|
| Menu | ok: ouro 40, melhor onda 0/15, atributos iniciais, JOGAR |
| Talentos | ok: comprar Barreira Rúnica (20 G) → ouro 40→20, nível 0/10→1/10, custo 20→38 G; botões sem ouro ficam desabilitados; **tudo persiste ao recarregar**; o HP comprado aparece no Menu (14) e no HUD (14/14) |
| JOGAR | ok: banner "ONDA 1/15", HUD com HP, onda, ouro, ATK/ORBES/CRIT e 1× |
| Mira por toque/mouse | ok em todo o canvas: cantos do topo, centro, cantos da base e o lançador. Exceção: onde a faixa de runas ou botões do HUD cobrem o campo (M3-01) |
| Cancelamento | ok: puxões de 5, 10 e 13 px de mundo cancelam; 15 px dispara |
| 2× | ok: alterna 1×↔2× e vale para as ondas seguintes; a nova run começa em 1× |
| Recolher | ok: só aparece no voo; encerra o voo em 0,1–0,4 s |
| Pausa | ok: abre, congela a run (2,5 s em voo sem mudar HP, ouro nem fase; Recolher ignorado), Continuar retoma; o som alterna "SOM: LIGADO/DESLIGADO" e grava `settings.muted`; Sair volta ao Menu |
| Draft | ok: 3 cartas com sinergia, nome e descrição; a runa escolhida entra na faixa; 7 drafts por run |
| Fim de run, derrota (390×844) | ok: "BARREIRA ROMPIDA", onda 15/15, +93 G. Perfil: ouro 20→113, melhor onda 15; o Menu mostra 113 e 15/15 |
| Fim de run, vitória (1280×720, save com talentos no máximo) | ok: "CRIPTA CONQUISTADA", 15/15, +603 G (543 do HUD + 60 fixos, decisão 17). Perfil: ouro 5000→5603, melhor onda 15, `cleared` = true |
| Jogar de novo | ok pelos dois caminhos (Fim → JOGAR DE NOVO e Fim → Menu → JOGAR): 1 canvas, 1 UI, onda 1/15, HP cheio, 2× alterna uma vez só, o disparo funciona, sem modal preso |
| Console | sem erros nem avisos do jogo (só avisos de desempenho do driver GL do headless) |
| PWA offline (390×844) | ok: SW controla a página, as 5 .woff2 estão no cache, o Menu e a partida abrem offline com as fontes carregadas |

## Decisões 19–26
| Decisão | Resultado |
|---|---|
| 19 Visual procedural | ok: inimigos, orbes, bumpers, anel, pilar e arena desenhados por código (`src/scenes/views/`); `dist/assets/atlases` vazio |
| 20 Sem áudio | ok: nenhum arquivo de áudio nem `AudioContext`; o botão de som só grava a preferência |
| 21 Game feel básico | ok: hit-flash, números flutuando, tremida e partículas (`src/scenes/fx/`), vistos nas capturas. Squash: ver pendências |
| 22 Strings centralizadas | **ressalva (M3-02)**: 3 textos fora de `src/ui/strings.ts` |
| 23 Telas | ok: Partida (HUD, barra inferior, Draft), Menu, Talentos, Fim de run, Pausa/configurações |
| 24 Fontes empacotadas e offline | ok (Cinzel 700/900, Plus Jakarta Sans 600/700/800). Ressalva menor M3-03 |
| 25 CSS sem Tailwind | ok: CSS puro com variáveis em `src/styles/tokens.css`; nada de Tailwind no código nem no build |
| 26 Sem migração do save | ok: o perfil usa IndexedDB (`runesling`/`save`, chave `runesling.save`); o save do slice (localStorage) não é lido |

## HUD x campo
| Tamanho | Campo (canvas) | Sobreposição |
|---|---|---|
| 360×640 | y 60–580 | **topo 30 px** (faixa de runas, y 64–90); base 0 |
| 390×844 | y 140–703 | nenhuma |
| 412×915 | y 159–754 | nenhuma |
| 1280×720 | x 390–888, y 0–720 | **topo 90 px** (barra + faixa de runas), **base 58 px** (barra inferior) |

## Achados (nenhum bloqueante nem grave)
**Menores**
1. **M3-01, HUD sobre o campo bloqueia a mira.** `src/styles/ui.css:205-207` dá `pointer-events: auto` à faixa de runas (para rolar na horizontal), e os botões do HUD também capturam o toque. Onde o HUD cobre o campo, o arrasto que começa ali não mira. Passos: 360×640, JOGAR, arrastar a partir de (18, 81) ou (342, 81) (sobre a dica "Arraste na arena…", `src/ui/strings.ts:41`) → não dispara; 1 px abaixo da faixa dispara. No desktop, o mesmo nos 90 px do topo e sobre ouro/pausa/2×. É o detalhe novo da pendência conhecida "HUD sobre o campo em telas baixas".
2. **M3-02, textos fora do módulo de strings (decisão 22).** `src/match/RunController.ts:46` ("CHEFE FINAL: …", "MINI-CHEFE: …") e `:48` ("ONDA n/total", que já existe como `hud.wave` em `strings.ts:32`); `src/scenes/fx/FxDirector.ts:56` ("ESCUDO", visível na captura `360x640-6-draft.png`). Os nomes dos chefes vêm de `enemies.json`. Precisam ir para `strings.ts` antes do inglês (M6).
3. **M3-03, peso de fonte não empacotado.** `src/scenes/views/EnemyView.ts:154` e `src/scenes/views/RingView.ts:32` pedem Plus Jakarta Sans 900, que não está no build (só 600/700/800). O navegador usa a 800. Cosmético: incluir a 900 ou trocar para 800.

## Pendências conhecidas, classificadas
| Pendência | Classe | Observação |
|---|---|---|
| HUD sobre o campo em telas baixas | Menor | Medido acima. Agrava com M3-01 (bloqueia a mira na faixa). Só 360×640 e desktop; 390×844 e 412×915 limpos |
| Banners por onda | Menor, aceitável | Aparece "ONDA n/15" em toda onda, por 1,8 s, no centro do campo. Não bloqueia a mira. Decidir com o dono se fica só para chefes |
| Sair da run não grava | Menor, a decidir | Confirmado: Pausa → Sair volta ao Menu com ouro e melhor onda iguais (20 e 0/15). O GDD não trata desistência. Decidir se o ouro da run parcial conta |
| Ouro do HUD sem os +60 | Menor | Confirmado: HUD 543, Fim de run +603. O HUD já aplica a Cobiça; só a vitória soma 60 no fim. Cosmético |
| FPS no headless | Indicativo | GL por software: 60 fps no Menu; na partida 44–49 fps em retrato com DPR 2 (canvas 720×1040) e 60 fps no desktop com DPR 1. Medir no aparelho |
| Squash pouco visível | Menor, M5 | Existe (`EnemyView.ts:167-170`, pico 1.18×). Não avaliado a olho na captura; rever com o game feel do M5 |

## Não verificado
- Aparelho real (toque nativo, safe areas, notch, desempenho, instalação do PWA): o teste foi em Chromium headless com toque emulado por CDP.
- Safari/iOS e Firefox.
- Squash e legibilidade dos efeitos a olho, em movimento.
- Balanceamento: o bot mira ao acaso e chegou à onda 15 sem talentos; a dificuldade real fica para o dono.
- O deploy em `dev--runesling.netlify.app` (testado só o build local).

## Roteiro curto para o dono (celular, `dev--runesling.netlify.app`)
1. Abrir no celular em retrato. Conferir se o Menu mostra ouro 40, melhor onda 0/15 e as fontes com serifa nos títulos.
2. Talentos: comprar Barreira Rúnica (20 G). O ouro vai a 20, o nível a 1/10 e o custo a 38 G. Fechar a aba, abrir de novo e conferir que ficou.
3. JOGAR: arrastar o dedo de vários pontos da arena (topo, meio, perto do lançador) e soltar. Um puxão bem curto não dispara.
4. No voo: tocar 2× e Recolher. Pausar, alternar o som, Continuar. Pausar de novo e Sair: o Menu volta sem gravar ouro.
5. Jogar uma run até o fim, escolhendo runas no Draft. No Fim, conferir a onda e o ouro, ir ao Menu e ver o ouro somado e a melhor onda.
6. JOGAR de novo e conferir que tudo começa do zero (onda 1, HP cheio, 1×).
7. Ligar o modo avião, reabrir o site (ou o app instalado) e ver se abre e joga.
8. Anotar: o HUD cobre inimigos? Os efeitos (flash, números, tremida) aparecem bem? O jogo fica fluido?

## Reteste (AG00, 2026-11-26)
T-022 (BRF-021) e T-023 (BRF-022): M3-01, M3-02 e M3-03 corrigidos; decisões 27 (velocidade) e 28 (recolher automático) aplicadas com testes. Typecheck limpo, suíte 197/197, build ok; fluxo Menu → JOGAR → mira → Draft sem erros no navegador (390×844). Restante menor: "×2" desenhado no anel (`RingView.ts:32`) sem chave de string.
