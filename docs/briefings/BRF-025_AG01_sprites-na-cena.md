# BRF-025 — AG01 — T-027 Sprites na cena
**Leia:** `docs/briefings/_contrato-m4-assets.md`; seus `src/scenes/views/` e `src/scenes/BattleScene.ts`. **Regra:** respostas curtas; sem commit/push/branches.
**Contrato:** as texturas `'enemies'` (atlas, frames = `spriteKey`, `obstacle_*`) e `'floor_crypt'`, `'wall_trim_crypt'` serão carregadas pelo Boot (T-029, depois). Use a textura quando `this.textures.exists(...)` e o frame existir; senão, o desenho procedural atual (nada pode quebrar sem os arquivos).
**Fazer:** (1) Medalhões de inimigos/chefes como sprite escalado ao diâmetro da hitbox (chefe com chifres pode passar do círculo, conforme o tamanho 384), mantendo por cima o que é do código: HP, escudo frontal, contador, hit-flash/squash. (2) Bumper, pilar e anel por sprite, com o anel ainda girando por código. (3) Chão tileable (`TileSprite`) e moldura lateral. (4) Teste visual com um atlas **provisório** gerado por você no scratchpad (não versionar), carregado só no script de teste. (5) Testes da lógica pura (escolha textura × fallback, escala).
**Permitido:** `src/scenes/`, `tests/match/`. **Proibido:** o resto (inclusive `public/`, `src/scenes/BootScene.ts`).
**Pronto quando:** typecheck, suíte e build verdes; capturas com e sem atlas provisório, sem erro no console.
**Entrega:** até 5 linhas: arquivos, como testou, capturas, o que não foi verificado.
