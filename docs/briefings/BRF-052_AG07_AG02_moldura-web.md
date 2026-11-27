# BRF-052 — AG07 (com a parte de UI) — T-064 Limitar o tamanho do jogo na web
**Leia:** `index.html`, `src/main.ts` (Phaser `Scale.FIT`, `CENTER_BOTH`), `src/ui/layout.ts`, `src/ui/hud.ts`, `src/styles/ui.css`, `src/ui/appBehavior.ts` (decisão 46). **Regra:** respostas curtas; sem commit/push/branches.
**Problema (dono, monitor 1920×~930):** o canvas da arena fica centralizado, mas o HUD do topo e a barra inferior esticam na largura toda, a faixa de pedra vira uma tira gigante e a fita do anúncio de onda aparece cortada ("ON..."). "Limitar em algum tamanho máximo a execução do jogo na web para não ficar ruim os gráficos em monitores maiores."
**Fazer:**
- Um "palco" único (`#app`) com proporção de celular em retrato (ex.: largura máx. ~480 px e altura máx. ~1000 px, ou travar 9:19,5 a 9:16; escolha e justifique), centralizado; canvas e `#ui-root` dentro dele, ambos limitados ao palco. Em celular o palco ocupa a tela toda como hoje (com área segura).
- Fora do palco: fundo decorativo (ex.: `public/assets/ui/ui_map_bg.webp` escurecido/desfocado, ou gradiente da paleta), sem interação; a decisão 46 (sem rolagem, sem zoom, sem seleção) continua valendo.
- HUD, barra inferior, modais, Draft, Talentos e Menu passam a se medir pelo palco, não pela janela (`vw`/`vh` → unidades do container ou variáveis); a fita do anúncio de onda mostra o texto inteiro.
- Testes onde viável (`tests/`).
**Permitido:** `index.html`, `src/main.ts`, `src/ui/`, `src/styles/`, `tests/`. **Proibido:** o resto (em especial `src/scenes/` — se precisar, descreva na entrega).
**Pronto quando:** `npm test` e `npm run build` passam; capturas do jogo real em 1920×930, 1280×720, 390×844 e 360×640 (Menu, Partida com anúncio de onda, Runas, Talentos, Fim de run) conferidas a olho, no scratchpad. **Entrega:** até 4 linhas.
