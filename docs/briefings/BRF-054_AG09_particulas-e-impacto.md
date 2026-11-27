# BRF-054 — AG09 — T-047 Partículas com brilho, squash e tremida mais fortes
**Leia:** `docs/agentes/AG09_VFX.md`; `docs/gdd.md` (game feel); `docs/decisoes.md` 21 e 41; `docs/briefings/BRF-018_AG01_game-feel-basico.md`; `src/scenes/fx/` (FxDirector, FxLayer, fxMath, pools); só leitura em `src/scenes/BattleScene.ts` para ver como o fx é chamado. **Regra:** respostas curtas; sem commit/push/branches.
**Fazer (decisão 41):**
- Partículas com mistura aditiva (`ADD`) e um bloom leve (glow) nas faíscas de impacto, explosão (fogo), raio (elétrico), espectral e morte, na cor da sinergia; usar pools (sem criar objetos por frame).
- Squash do inimigo e do orbe no impacto mais forte e mais elástico; tremida de tela mais forte e proporcional ao golpe (crit, explosão, morte de chefe), com teto e decaimento.
- Tudo respeitando "reduzir movimento": expor uma flag no fx (ex.: `setReducedMotion(true)`) que corta tremida e reduz partículas; a T-049 liga essa flag às configurações e ao `prefers-reduced-motion`.
- Desempenho: manter 60 fps em celular médio; limitar partículas vivas; medir no Chromium com CPU 4× mais lenta.
- Testes em `tests/fx/` para a matemática (força da tremida, decaimento, limites, flag de movimento reduzido).
**Permitido:** `src/scenes/fx/`, `tests/fx/`. Se precisar de um gancho novo em `BattleScene.ts`, descreva na entrega em vez de mexer. **Proibido:** o resto.
**Pronto quando:** `npm test` e `npm run build` passam; capturas/gif curtos no scratchpad mostrando impacto, explosão, raio e morte; fps medido. **Entrega:** até 4 linhas.
