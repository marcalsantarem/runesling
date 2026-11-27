# BRF-053 — AG11 — T-045 Motor de som sintetizado
**Leia:** `docs/agentes/AG11_Audio.md`; `docs/gdd.md` §6.3 (áudio e pitch pelo combo); `docs/decisoes.md` 39, 40, 42; `src/core/events.ts` (só para conhecer os eventos; não ligar ainda — isso é a T-046). **Regra:** respostas curtas; sem commit/push/branches.
**Fazer:** em `src/audio/`, um motor Web Audio puro (sem arquivos de áudio, decisão 39):
- `AudioEngine`: contexto criado/destravado no 1º toque/clique (política de autoplay do iOS/Chrome), volume mestre dos efeitos (0–1) e mudo; sem erro se Web Audio não existir.
- Catálogo de efeitos sintetizados (osciladores, ruído, envelopes, filtros) com chave estável: `impact`, `wall`, `bumper`, `ring`, `explosion` (fogo), `zap` (raio), `ghost`, `kill`, `crit`, `barrier_hit`, `heal`, `wave_start`, `draft_open`, `pick`, `ui_tap`, `ui_back`, `victory`, `defeat`. Cada efeito curto, no tom de fantasia rúnica/arcade do jogo, com mixagem que não sature quando muitos tocam juntos (limitar vozes simultâneas por efeito e um compressor/limiter no mestre).
- `play(key, { combo?, pan? })`: tom sobe com o combo (GDD §6.3; definir a curva e o teto) e variação aleatória de ±8% em cada disparo.
- API pequena e tipada para a T-046 ligar aos eventos; uma página de teste `src/audio/sandbox.html` ou equivalente fora do build (opcional) para ouvir os efeitos.
- Testes em `tests/audio/` com Web Audio falso (cálculo do pitch pelo combo, variação dentro de ±8%, mudo/volume, limite de vozes, destrave no 1º gesto).
**Permitido:** `src/audio/`, `tests/audio/`. **Proibido:** o resto.
**Pronto quando:** `npm test` e `npm run build` passam; `dist/` não cresce mais que alguns KB. **Entrega:** até 4 linhas, com como ouvir os efeitos.
