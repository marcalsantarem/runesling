# BRF-057 — AG02 (com AG04 no perfil) — T-046 (parte UI) e T-049 Sons da UI e configurações de áudio/movimento
**Leia:** `docs/decisoes.md` 39, 41, 42; `src/audio/index.ts` (instância `audio`, `attachUnlock`, `play`, `setVolume`, `setMuted`, chaves em `sfx.ts`); `src/meta/profile.ts` (`PlayerSettings`, hoje só `muted`); `src/core/events.ts`; `src/ui/` (Pausa/Configurações, botões `plate()`, Draft, Fim de run). **Regra:** respostas curtas; sem commit/push/branches.
**Fazer:**
- **Perfil (AG04):** `PlayerSettings` ganha `sfxVolume` (0–1, padrão 0.8) e `reducedMotion` (`'system' | 'on' | 'off'`, padrão `'system'`), com migração do save antigo e testes.
- **Áudio na UI:** chamar `audio.attachUnlock()` uma vez ao montar a UI; aplicar `muted` e `sfxVolume` do perfil no início e a cada mudança. Sons de UI: `ui_tap` nos botões, `ui_back` em voltar/cancelar, `draft_open` ao abrir o Draft, `pick` ao escolher runa, `victory`/`defeat` no Fim de run. Sem som duplicado.
- **Configurações (T-049):** no modal de Pausa/Configurações e onde hoje fica o som no Menu: som liga/desliga (já existe), **volume dos efeitos** (controle no estilo do jogo, ≥ 44 px, com prévia `ui_tap` ao soltar) e **"Reduzir movimento"** (Sistema / Ligado / Desligado). Valor efetivo de movimento reduzido = `on`, ou `system` + `prefers-reduced-motion`.
- **Ponte para a cena:** adicionar em `src/core/events.ts` um evento `settings:changed` com `{ muted, sfxVolume, reducedMotion: boolean }` (valor efetivo), emitido no início e a cada mudança. A cena (AG01, depois) ouve e chama `fx.setReducedMotion`. Não mexa em `src/scenes/`.
- Testes em `tests/ui/` e `tests/meta/`.
**Permitido:** `src/ui/`, `src/styles/`, `src/meta/profile.ts`, `src/core/events.ts` (só o evento novo), `tests/ui/`, `tests/meta/`. **Proibido:** `src/scenes/`, `src/audio/` (só usar), o resto.
**Pronto quando:** `npm test` e `npm run build` passam; capturas das configurações (390×844 e 360×640) no scratchpad. **Entrega:** até 4 linhas.
