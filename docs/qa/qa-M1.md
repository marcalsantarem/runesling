# QA M1 (v0.2.0): Fundação

**Task:** T-004 (BRF-005). **Agente:** AG03. **Data:** 2026-11-25.
**Veredito: PASSA COM RESSALVAS.** Nenhum bloqueante nem grave. As ressalvas são pendências conhecidas e itens menores, mais o deploy real, que ainda não rodou.

## Validação feita
| Item | Resultado |
|---|---|
| `npm ci` | ok (avisa 4 vulnerabilidades moderadas) |
| `npm run typecheck` | ok, sem erros |
| `npm test` 3x | 4 arquivos, **19/19** nas 3 rodadas (contagem esperada: 19) |
| `npm run build` | ok; `dist/` = **1.238.939 bytes (1,3 MB)** < 4 MB; JS 1.196 kB (319 kB gzip); precache 12 entradas (1.193 KiB) |
| `vite preview` + Playwright/Chromium (retrato, mobile, touch, DPR 2) | carga sem erro de página, console nem rede em 360×640, 390×844 e 412×915. Canvas 720×1040 (lógico 360×520, DPR 2), `Scale.FIT` centralizado com faixas acima e abaixo |
| Manifest | `./manifest.webmanifest` 200, `application/manifest+json`, `display: fullscreen`, `orientation: portrait`, 3 ícones 200 `image/png` |
| Service worker | `sw.js` `activated`, controla a página depois do reload; o precache tem index, JS, manifest e ícones |
| Offline | o reload offline carrega o jogo (canvas e título); uma rota profunda offline cai no `index.html` (`navigateFallback`) |
| `npm audit --omit=dev` | 0 vulnerabilidades em produção |

As capturas ficam fora do repositório, em `/tmp/claude-0/-home-user-runesling/757070c4-75c0-5ae2-865b-7eac2f8a7bba/scratchpad/qa-m1/` (`m1-360x640.png`, `m1-390x844.png`, `m1-412x915.png`, `m1-offline-390x844.png`). Script: `qa.cjs` na mesma pasta.

## Revisão de `ci.yml` e `deploy.yml` contra as decisões 7, 8 e 9
- `ci.yml`: push e PR em `dev` e `main`, rodando `npm ci`, typecheck, testes, build e medição do `dist/`. Ok.
- `deploy.yml:8-9`: dispara em push na `main`, push na `dev` e tags `v*`.
- `--prod` só com `ref_type == branch && ref_name == main` (`deploy.yml:39`). Ok (decisão 8).
- `dev`: `--alias dev`, sem `--prod`, link `https://dev--runesling.netlify.app` (`deploy.yml:58-73`). Ok (decisão 9).
- Tag: alias derivado do nome (`v0.2.0` vira `v0-2-0`), sem `--prod`, link `v0-2-0--runesling.netlify.app` (`deploy.yml:76-98`). Ok (decisões 6 e 8).
- `concurrency` por ref, sem cancelar o deploy em andamento. Ok.

## Achados (nenhum bloqueante nem grave)
**Menores**
1. **M1-01, deploy nunca executado.** `deploy.yml` (todo o arquivo): os secrets, o login no Netlify, o alias `dev` e o `--prod` não foram exercitados. Confirmar no 1º push na `dev` (T-011), no 1º merge na `main` (T-010) e na tag v0.2.0. Se o site do Netlify também estiver ligado ao repositório com builds automáticos, pode haver um deploy duplo ou um conflito no `dev--`. O `netlify.toml` diz que o Netlify não roda build, mas o painel não foi conferido.
2. **M1-02, gatilho mais amplo que a decisão 8.** `deploy.yml:8`: qualquer push na `main` publica em produção, não só um merge de PR. Isso é aceitável se a `main` for protegida. Sugestão: proteção de branch no GitHub (decisão do dono).
3. **M1-03, limite de tamanho só avisa.** `ci.yml:30-31`: acima de 4 MB, o CI emite `::warning::` e não falha. É coerente com "medir", mas não barra uma regressão.
4. **M1-04, fonte da cena placeholder.** `src/scenes/BootScene.ts:27` usa `fontFamily: 'Cinzel, serif'`, mas a Cinzel não é carregada: nas capturas aparece a serif genérica. Placeholder do M1; resolver junto com a UI (AG02/AG08).
5. **M1-05, `display: fullscreen` no iOS.** `vite.config.ts:12-13`: o iOS ignora `fullscreen` e usa `standalone`. O `apple-touch-icon` e os metas Apple estão presentes. Conferir no roteiro.
6. **M1-06, `.gitkeep` no `dist/`.** `public/assets/{atlases,audio,tiles}/.gitkeep` vão para o build. São inofensivos, de 0 bytes.

## Pendências conhecidas, classificadas
| Pendência | Classe | Observação |
|---|---|---|
| Ícones PWA provisórios (`vite.config.ts:18-20`, `public/icons/`) | Menor, aceita | Tamanhos e tipos corretos (192, 512, maskable 512, apple 180). Os definitivos são do AG08 |
| Deploy não executado de verdade | Menor, a confirmar | Ver M1-01. Fecha no 1º push na `dev`, no 1º merge e na tag |
| 4 vulnerabilidades moderadas | Menor, aceita | Só em devDependencies (`glob`/`minimatch` via `vite-plugin-pwa`); `--omit=dev` dá 0. O fix sugerido rebaixa o `vite-plugin-pwa` para 1.1.0 (breaking): não aplicar agora |
| `chunkSizeWarningLimit: 1600` (`vite.config.ts:30`) | Menor, aceita | O chunk único de 1.196 kB é o Phaser. Revisar quando houver code-splitting |
| `.npmrc` `legacy-peer-deps=true` | Menor, risco técnico | Mascara conflitos de peer (provavelmente o `vite-plugin-pwa` 2.0.0 com o vite 8). O `npm ci` e o build passam. Reavaliar ao atualizar dependências |

## Não verificado
- O deploy real no Netlify (main, dev e tag) e os headers do `netlify.toml` em produção.
- O GitHub Actions rodando de fato.
- A instalação da PWA num aparelho real (prompt de instalação, ícone na tela inicial, iOS/Safari). Lighthouse não foi rodado.
- A atualização do SW entre duas versões (`autoUpdate`).
- O desempenho no aparelho. As capturas usam renderização por software headless; os avisos "GPU stall due to ReadPixels" vêm das capturas, não do jogo.

## Roteiro para o dono (celular)
1. Abra o link da versão (`https://v0-2-0--runesling.netlify.app`, depois da tag) ou `https://dev--runesling.netlify.app`. Esperado: fundo escuro e o texto dourado "RuneSling v0.2.0" centralizado, em retrato.
2. Android/Chrome: menu ⋮ → "Instalar app". iPhone/Safari: Compartilhar → "Adicionar à Tela de Início". O ícone provisório deve aparecer na tela inicial.
3. Abra pelo ícone: o jogo deve abrir sem barra do navegador, em retrato.
4. Feche o app, ligue o modo avião e abra de novo pelo ícone: deve carregar igual (offline).
5. Gire o aparelho e anote o que acontece. Se algum passo falhar, informe o aparelho, o navegador e o passo.
