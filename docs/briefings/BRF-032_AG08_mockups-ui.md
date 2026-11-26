# BRF-032 — AG08 — T-035 Mockups das 3 direções de UI
**Leia:** `docs/decisoes.md` 35–38; `docs/gdd.md` §6.1 (paleta e tipografia); `docs/arte.md`; capturas atuais do jogo não estão no repo — rode `vite preview` e capture Menu, HUD e Draft para referência. Use as imagens reais já recortadas (`public/assets/icons/*.webp`, atlas de inimigos) nos mockups. **Regra:** respostas curtas; sem commit/push/branches.
**Decisão do dono:** a UI atual parece site genérico, não jogo mobile. O dono quer ver **um mockup de cada direção** antes de escolher:
- **A. Fantasia ornamentada:** molduras de ferro e ouro, placas de pedra, botões grossos com relevo e brilho, fitas/estandartes nos títulos (clima Darkest Dungeon, legibilidade de Archero/Clash Royale).
- **B. Mobile casual vibrante:** botões arredondados grandes, cores saturadas, contornos grossos, sombras chapadas, sensação de "bounce".
- **C. Minimalista escuro refinado:** base atual com mais peso, textura e acabamento.
**Fazer:** um único `docs/mockups/ui-direcoes.html` autocontido (CSS inline; fontes Cinzel/Plus Jakarta podem vir do Google Fonts só no mockup), mostrando lado a lado, em molduras de celular 390×844, as três telas (Menu, HUD da partida com a arena por trás, Draft com 3 cartas) para cada direção A, B e C, com títulos claros. Arte das peças de UI pode ser simulada em CSS/SVG (o definitivo virá do Gemini, decisão 36). Capturas PNG de cada direção em `docs/mockups/ui-A.png`, `ui-B.png`, `ui-C.png` (Playwright, deviceScaleFactor 2).
**Permitido:** `docs/mockups/`. **Proibido:** o resto.
**Pronto quando:** HTML abre sem erro e as 3 capturas conferidas a olho.
**Entrega:** até 4 linhas.
