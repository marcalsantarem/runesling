# BRF-015 — AG04 — T-016 Save do jogador e talentos
**Leia:** `docs/agentes/AG04_Sistemas.md`, `docs/decisoes.md` 17 e 26, `docs/gdd.md` §5.1, `src/core/SaveManager.ts`, `src/meta/formulas.ts`, `src/data/talents.json`. **Regra:** respostas curtas; sem commit/push/branches.
**Decisão do dono:** 26 (não migrar o save do slice), 17 (ouro da vitória).
**Contrato (BattleScene e UI usam na próxima onda; o AG07 trabalha em paralelo no EventBus):** `src/meta/profile.ts` exporta `getProfile(): Promise<PlayerProfile>` (singleton com carga preguiçosa via `SaveManager`) e a classe:
`data(): Readonly<PlayerData>` (`gold, bestWave, cleared, talents: Record<TalentId, number>, settings: { muted: boolean }`); `talentLevel(id)`; `talentCost(id)` (custo do próximo nível ou `null` no máximo); `canBuy(id)`; `buyTalent(id): Promise<boolean>`; `recordRun({wave, won, goldEarned}): Promise<void>` (soma ao banco, atualiza melhor onda e `cleared`; o `goldEarned` já chega calculado pela partida); `updateSettings(partial)`; `reset()`; `onChange(cb): () => void`.
**Fazer:** (1) `src/meta/profile.ts` com o contrato, save versionado (versão 1) e ouro inicial do slice (40, registre na entrega). (2) Testes em `tests/meta/` com storage em memória: compra, máximo, ouro insuficiente, recordRun, persistência ao recarregar, dados corrompidos voltam ao padrão.
**Permitido:** `src/meta/`, `tests/meta/`. **Proibido:** o resto.
**Pronto quando:** typecheck e suíte verdes.
**Entrega:** até 5 linhas: API final, nº de testes, suposições, o que não foi verificado.
