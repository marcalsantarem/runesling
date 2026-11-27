# QA M5 (v0.6.0): Nova UI

**Task:** T-041 (BRF-051), com a T-064 incluída. **Agente:** AG03. **Data:** 2026-11-27. **Commit validado:** `035e707` (`dev`).
**Veredito: PASSA COM RESSALVAS.** Nenhum bloqueante nem grave. Todas as telas do M5 funcionam nos 5 tamanhos e com área segura emulada; as 36 peças carregam com URL absoluta; sem 404 nem erro no console; o comportamento de app (decisão 46), a T-063 e a T-064 conferem; PWA offline e com atualização sozinha. As ressalvas são menores ou pendências já conhecidas, e falta a conferência em iPhone real.

## Validação feita
| Item | Resultado |
|---|---|
| `npm ci` | ok (as mesmas vulnerabilidades moderadas de devDependencies dos marcos anteriores) |
| `npm run typecheck` | ok, sem erros |
| Suíte (uma vez, decisão 18) | 32 arquivos, **279/279** (esperado: 279), 7,5 s. O QA não acrescentou testes |
| `npm run build` | ok; `dist/` = **2.353.431 bytes (2,4 MB)**, abaixo de 4 MB. JS 1.331 kB (364 kB gzip), CSS 48 kB. Precache: 79 entradas (2.278 KiB) |
| Versão | `package.json` 0.6.0 e `0.6.0` no bundle |
| `art-source/` fora do build | ok: nada em `dist/` nem em `dist/sw.js` |
| Navegador | `vite preview` (porta 4801) + Playwright/Chromium headless: 360×640, 390×844, 412×915 (toque, DPR 2), 1280×720 e 1920×930 (mouse); 390×844 DPR 3 com área segura do iPhone emulada (CDP, topo 47 px, base 34 px) |

Scripts e capturas fora do repositório, em `/tmp/claude-0/-home-user-runesling/757070c4-75c0-5ae2-865b-7eac2f8a7bba/scratchpad/t041/` (`qa.cjs`, `qa2.cjs`, `bot.cjs`, `pwa.cjs`; capturas `<tamanho>-menu|talents|talents-scrolled|settings|reset|hud|pause.png`, `bot-<lose|win>-<tamanho>-draft0|hud-runes|end|newrun.png`, `fallback-menu.png`, `safe-*.png`, `offline-hud.png`). Vitória e derrota foram obtidas jogando de verdade com um robô de mira (derrota: tiros rasantes; vitória: save com talentos no máximo gravado no IndexedDB). Nada foi alterado no código do jogo.

## Telas (comparadas com `tela-inicial-final.html`, `botao-jogar.html` A e `telas-estilo.html`)
| Tela | Resultado |
|---|---|
| Menu em mapa | ok nos 5 tamanhos: fundo do mapa, nós (liberado com chefe, trancados com cadeado), trilha, fita do capítulo, placa JOGAR com runas, Talentos com selo, som, engrenagem, "Resetar save" |
| Talentos | ok; a lista rola por dentro (`.rs-talent-list`, 360×640: 590 px de conteúdo em 372 px) e a página não rola |
| Partida/HUD | ok: barra de pedra, vida, ouro, fita ONDA, ATK/ORBES/CRIT, velocidade, Recolher |
| Runas (Draft) | ok em 360×640, 390×844 e 1280×720: 3 cartas horizontais com encaixe redondo, selo de sinergia, "Nova sinergia" |
| Vitória | ok (390×844): "CRIPTA CONQUISTADA", 15/15, +583 G, medalhão com check |
| Derrota | ok (360×640, 390×844, 1280×720): "BARREIRA ROMPIDA", escudo rachado, fita escura |
| Pausa / Configurações / modal de reset | ok nos 5 tamanhos |
| Área segura (iPhone emulado) | ok: `env(safe-area-inset-*)` = 47/34 px; pausa a 48 px do topo, Recolher termina a 76 px da base; nada sob o entalhe |

## Peças de UI (T-039, T-062)
| Item | Resultado |
|---|---|
| 36 peças | as 36 variáveis CSS estão no `.rs-ui`, todas com **URL absoluta** (`http://…/assets/ui/<chave>.webp`), e as 36 decodificam com o tamanho do contrato |
| Console | sem 404 e sem erro nos 5 tamanhos (só avisos de desempenho do driver GL do headless) |
| Fallback com peça faltando | parcial, ver M5-01 |

## Comportamento de app (decisão 46)
Ok nos 5 tamanhos: documento do tamanho da janela (sem rolagem; roda do mouse não rola), `overscroll-behavior: none`, `user-select: none`, `touch-action: manipulation`, viewport com `user-scalable=no`; `dblclick`, `selectstart` e `touchmove` com 2 dedos são cancelados (`src/ui/appBehavior.ts`). Gestos reais do Safari (`gesture*`, elástico) não são reproduzíveis no Chromium: ficam para o iPhone.

## T-063 e T-064
| Item | Resultado |
|---|---|
| Recolher sempre visível | ok: visível e `disabled` com os orbes parados nos 5 tamanhos |
| Faixa de runas na nova partida | ok: depois de vitória e derrota, "Jogar de novo" abre com `rs-rune-strip is-empty` (só a dica) e ONDA 1/15 (4 partidas) |
| Palco de celular (1920×930) | ok: `#app` 480×930 centralizado (x=720), fundo do mapa desfocado nas laterais (`body::before`), HUD sem esticar |
| Palco de celular (1280×720) | ok: `#app` 405×720 (9:16) centralizado, mesmo fundo |
| Fita da onda | ok: "ONDA 1/15" inteira em todos os tamanhos (`scrollWidth` = `clientWidth`) |

## PWA
| Item | Resultado |
|---|---|
| Offline | ok: com a rede cortada, recarga abre o menu, a partida começa e as 36 peças carregam do cache (75 entradas) |
| Versão nova | ok: com o `sw.js` alterado numa cópia do `dist/`, `registration.update()` instala o SW novo e a página recarrega **uma vez** sozinha |

## Achados
**Bloqueantes:** nenhum. **Graves:** nenhum.

**Menores**
- **M5-01 Fallback da placa some se a imagem falhar no carregamento.** `src/styles/ui-skin.css:78` e `:92-97`: com a peça em `AVAILABLE_ASSETS` (decidido no build), as camadas de CSS da placa são escondidas e o fundo zerado; se o arquivo der erro de rede, o botão fica só com o texto. Passo a passo: bloquear `ui_btn_primary.webp` → menu mostra "JOGAR" sem placa (`fallback-menu.png`). O fundo do mapa e os painéis voltam ao CSS normalmente. Risco baixo (as peças estão no precache), mas o contrato pede fallback.
- **M5-02 Textos cortados com reticências em 360×640.** Dica da faixa de runas "…solte para la…" (`src/styles/ui.css:591`) e nomes de talentos "Maestria de Or…", "Olho do Ricoc…", "Cobiça da Crip…" (`src/styles/ui.css:484`). Em 390+ cabem.

## Pendências conhecidas
| Pendência | Classificação |
|---|---|
| T-060 cartas `fire`/`spectral`/`core` em estilo diferente da `lightning` | adiada pelo dono; não bloqueia |
| T-061 botão temporário "Resetar save" | presente e funcionando; **remover antes do M7** |
| T-033 `icon_static_crit` parecido com `icon_chain_lightning` | menor, dono decide; segue no backlog (não reavaliada neste marco) |
| T-043 largura da moldura lateral | adiada pelo dono; sem mudança |
| T-056/T-057/T-062 em iPhone real | **pendente**: só o dono pode conferir (Safari real) |

## Roteiro curto para o dono (iPhone, Safari e app instalado na tela inicial)
1. Abrir o jogo: o mapa, a placa JOGAR e os botões redondos aparecem com a arte (não com CSS liso). Se aparecer liso, a T-062 não resolveu.
2. Tentar arrastar a tela para cima/baixo, dar toque duplo e pinça em qualquer lugar: nada pode rolar, dar zoom nem selecionar texto.
3. Talentos: a lista rola com o dedo, o resto da tela não. Voltar.
4. Jogar: conferir que nada fica sob o entalhe nem sob a barra de início; Recolher aparece apagado antes do 1º tiro e acende com orbes em voo.
5. Pegar uma runa no Draft, perder ou pausar e sair, e começar de novo: a faixa de runas tem que começar vazia.
6. Com o app instalado, abrir sem internet: o jogo tem que abrir e jogar.
