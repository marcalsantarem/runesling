# BRF-058 — AG01 — T-046 (parte cena), T-066 e ligação do combo (T-048)
**Leia:** `src/audio/index.ts` e `sfx.ts`; `src/scenes/fx/` (API nova da T-047 e da T-048: `impact(enemyId, strength)` em `FxTargets`, `SquashSpring`, `onSpectral`, `setReducedMotion`, contador de combo); a entrega do AG09 da T-048 com os pontos de chamada (em `docs/briefings/` ou no histórico do commit da T-048); `src/core/events.ts` (`settings:changed` da T-049); `src/scenes/BattleScene.ts`, views de inimigo/orbe. **Regra:** respostas curtas; sem commit/push/branches.
**Fazer:**
- **Sons da partida (T-046):** tocar pelo `audio` (nunca Web Audio direto) nos eventos da partida: `impact` (acerto em inimigo, com `combo` e `pan` pela posição x), `wall` (parede/teto), `bumper`, `ring`, `explosion` (fogo), `zap` (raio), `ghost` (Orbe Fantasma/Eco), `kill`, `crit`, `barrier_hit` (dano na barreira), `heal`, `wave_start`. Sem enxurrada: respeitar os limites de voz do motor.
- **Ganchos do fx (T-066):** implementar `impact(enemyId, strength)` e trocar o squash do inimigo e do orbe por `SquashSpring`; chamar `fx.onSpectral(x, y)` no Orbe Fantasma e no clone do Eco do Teto.
- **Combo (T-048):** ligar o contador de combo do fx nos pontos indicados pelo AG09.
- **Configurações:** ouvir `settings:changed` e aplicar `fx.setReducedMotion(reducedMotion)`.
- Testes onde viável (`tests/scenes/` ou `tests/match/`), sem quebrar os existentes.
**Permitido:** `src/scenes/` (fora de `fx/`, salvo o mínimo para os ganchos), `src/match/` só se indispensável, `tests/`. **Proibido:** `src/ui/`, `src/audio/`, `src/meta/`.
**Pronto quando:** `npm test` e `npm run build` passam; partida real jogada no Chromium com sons disparando (log de chaves tocadas), squash elástico, partículas espectrais e contador de combo; capturas/gif no scratchpad. **Entrega:** até 5 linhas.
