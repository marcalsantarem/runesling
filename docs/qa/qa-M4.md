# QA M4 (v0.5.0): Pipeline de arte (+ UI do M5 já na `dev`)

**Task:** T-030 (BRF-036). **Agente:** AG03. **Data:** 2026-11-26. **Commit validado:** `e9d9dce` (`dev`).
**Veredito: PASSA COM RESSALVAS.** Nenhum bloqueante nem grave. Todos os inimigos, chefes e obstáculos aparecem como sprite, com chão e moldura; os ícones aparecem no Draft, nos Talentos e na faixa de runas; sem 404 nem erro no console; o desenho procedural assume quando um atlas falta; o PWA usa os ícones novos, funciona offline e se atualiza sozinho. A nova UI (direção A, M5) funciona nos 4 tamanhos, com alvos de toque ≥ 44 px. As ressalvas são menores ou pendências já conhecidas.

## Validação feita
| Item | Resultado |
|---|---|
| `npm ci` | ok (as mesmas vulnerabilidades moderadas de devDependencies dos marcos anteriores) |
| `npm run typecheck` | ok, sem erros |
| Suíte (uma vez, decisão 18) | 29 arquivos, **248/248** (esperado: 248), 7,1 s. O QA não acrescentou testes |
| `npm run build` | ok; `dist/` = **2.113.869 bytes (2,1 MB)**. JS 1.322 kB (361 kB gzip), CSS 31 kB, 5 .woff2. Precache: 42 entradas (2.046 KiB) |
| `art-source/` fora do build | ok: nenhum arquivo nem referência a `art-source`/`app_icon` em `dist/` nem no precache |
| Navegador | `vite preview` + Playwright (Chromium headless): 360×640, 390×844, 412×915 com toque (CDP, DPR 2) e 1280×720 com mouse |

Scripts e capturas fora do repositório, em `/tmp/claude-0/-home-user-runesling/757070c4-75c0-5ae2-865b-7eac2f8a7bba/scratchpad/qa-m4/` (`lib.cjs`, `flow.cjs`, `fallback.cjs`, `pwa.mjs`, `serve.cjs`; saídas `f*.json`, `fb-*.json`, `win1280.json`; capturas `<tamanho>-1-menu` a `-8-end.png`, `fallback-*.png`, `pwa-offline-run.png`). Para ler a cena, o QA reescreve o bundle só no teste (`window.__G`) e força as ondas mexendo no estado da run; nada disso está no código do jogo.

## M4: arte no jogo
| Item | Resultado |
|---|---|
| Atlases | `enemies` (9 inimigos/chefes + 3 obstáculos) e `icons` (16 `icon_*`) carregados; os 16 `iconKey` de `perks.json`/`talents.json` têm atlas e arquivo avulso em `assets/icons/` |
| Inimigos e chefes como sprite | ok nos 4 tamanhos: `enemy_goblin`, `shield`, `shooter`, `bomb`, `splitter`, `healer`, `mini` (do splitter), `miniboss_iron` (onda 7 forçada) e `boss_obsidian` (onda 15 forçada), todos com frame do atlas `enemies`; nenhum caiu no procedural |
| Bumper, pilar, anel | ok: `obstacle_bumper_rune` ×2, `obstacle_ring_multiplier`, `obstacle_pillar_obsidian`. O pilar tem o conteúdo encaixado no retângulo da colisão (decisão 34, `src/scenes/views/PillarView.ts:57-61`); nas capturas fica uma barra de pedra fina no lugar do retângulo do M3 |
| Chão e moldura | ok: `floor_crypt` (TileSprite) e `wall_trim_crypt` nas duas laterais (10 px, T-043 adiada) |
| Ícones na UI | ok: Talentos (5, 40 px), Draft (3 por oferta, 44 px em 360 e 54 px nos demais), faixa de runas (24 px); todas as imagens carregadas |
| Console | sem 404 e sem erros nos 4 tamanhos (só avisos de desempenho do driver GL do headless) |
| Fallback procedural | ok: com `enemies` em 404, os inimigos e obstáculos viram desenho procedural; com `icons` em 404, o jogo segue; com atlases, tiles e ícones todos em 404, a arena volta ao fundo procedural e a UI esconde os ícones. Em todos os casos, 5 ondas jogadas sem `pageerror` (os únicos erros são os 404 provocados) |
| Vitória (1280×720, save com talentos no máximo) | ok: "CRIPTA CONQUISTADA", 15/15, +607 G |

## M4: PWA
| Item | Resultado |
|---|---|
| Manifest | ok: `fullscreen`, retrato, ícones 192, 512 e maskable 512 (tamanhos reais conferem), `apple-touch-icon-180` e `favicon.ico` sem 404 |
| Offline | ok (390×844): com a rede cortada, o Menu abre com fontes e ícones e a partida começa (onda 1/15), com sprites do precache |
| Recarga na versão nova (T-034) | ok: build A servido e instalado; troca para um build B (cópia do repo com um `console.log` a mais, fora do repositório); ao voltar ao primeiro plano a página passou sozinha para o bundle B em ~4,5 s, com **uma** navegação (sem laço) |

## M5: nova UI (direção A, peças em CSS)
| Tela | Resultado |
|---|---|
| Menu | ok: ouro, som, configurações, chefe, melhor onda, atributos, JOGAR, navegação Expedição/Talentos com selo |
| Configurações | ok: abre, som, Fechar |
| Talentos | ok: compra (ouro 40→15), botão sem ouro desabilitado |
| HUD | ok: HP, onda, ouro, pausa, faixa de runas, ATK/ORBES/CRIT, 1×; banner "ONDA n/15" em fita |
| Draft | ok: cartas por sinergia com ícone, nome, descrição e "NOVA SINERGIA" |
| Pausa | ok: Som, Sair da run (volta ao Menu), Continuar |
| Fim de run | ok na vitória (ver acima) |
| Alvos ≥ 44 px | ok: nenhum botão visível menor que 44 px em Menu, Configurações, Talentos, HUD, Draft, Pausa e Fim, nos 4 tamanhos |
| Textos só via strings | ok: nenhum texto visível fora de `src/ui/strings.ts` (M3-02 resolvido: banner e "ESCUDO" já usam `t()`) |

## HUD x campo
| Tamanho | Campo (canvas) | Sobreposição |
|---|---|---|
| 360×640 | y 60–580 | **topo 30 px** (faixa de runas); base 0 |
| 390×844 | y 140–703 | nenhuma |
| 412×915 | y 159–754 | nenhuma |
| 1280×720 | x 390–888, y 0–720 | **topo 90 px**, **base 60 px** |

## Achados (nenhum bloqueante nem grave)
**Menores**
1. **M4-01, "+" ao lado do ouro sem ação (M5).** `src/ui/menu.ts:91`: o "+" é um `span` decorativo (`aria-hidden`), mas tem cara de botão (placa dourada com relevo). Passos: Menu → tocar no "+" → nada acontece. Sugestão: tirar até existir loja/anúncio ou deixar claro que é enfeite.
2. **M4-02, Fim de run com derrota não capturado na nova UI.** A derrota não foi forçada nesta validação (só vitória e "Sair da run"); a lógica é a mesma do M3, mas a tela nova da derrota fica para a T-041.

## Pendências conhecidas (classificação)
| Pendência | Classe | Observação |
|---|---|---|
| T-033 Voltagem Crítica parecida com Raio em Cadeia | menor, M4 | segue aberta (backlog); o QA não comparou os dois lado a lado. Dono decide |
| T-043 moldura lateral fina (10 px) | menor, M4, adiada pelo dono | confirmar no celular |
| Chão "movimentado" | menor, M4 (estético) | nas capturas os medalhões e números seguem legíveis sobre as lajes; é decisão de gosto do dono no aparelho |
| HUD cobrindo o topo em 360×640 | menor, M5 | medido: 30 px (faixa de runas, y 60–90 da tela) sobre o campo; os inimigos nascem abaixo, mas a mira não começa ali (mesmo caso do M3-01). No desktop: 90 px no topo e 60 px na base |
| Peças de UI ainda em CSS (T-039) | M5, esperado | não é defeito; depende das imagens do dono |

## Roteiro curto para o dono (celular)
1. Abrir o site instalado; se estiver na versão antiga, deixar o app em segundo plano e voltar: deve recarregar sozinho uma vez (versão 0.5.0).
2. Menu: conferir ouro, chefe, JOGAR e a engrenagem; tocar no "+" do ouro (M4-01) e dizer se incomoda.
3. Talentos: comprar um; conferir os ícones.
4. JOGAR: ver goblins como medalhões, bumpers, pilar fino e anel ×2; julgar o chão e a moldura lateral (T-043).
5. Primeiro Draft: comparar Raio em Cadeia e Voltagem Crítica se aparecerem (T-033) e ver o ícone na faixa.
6. Jogar até a onda 7 (mini-chefe) e, se der, até o chefe na 15. Pausa → Sair; ativar modo avião e abrir de novo: deve funcionar offline.
