# BRF-069 — AG01 — T-078 Itens na partida
**Regra:** respostas curtas; sem commit/push/branches (branch atual `M8`). **Permitido:** `src/match/`, `src/core/CombatResolver.ts`, `src/scenes/BattleScene.ts` (e `src/scenes/views/` se preciso), `src/core/events.ts` (só tornar `items` obrigatório em `run:ended`), testes em `tests/match/` e `tests/core/`, e os testes de UI que quebrarem só por causa do `items` obrigatório. **Não toca:** `src/ui/`, `src/meta/` (use a API), `src/scenes/fx/`, `src/audio/`.

**Ler:** `docs/briefings/_contrato-m8-itens.md` (seção "Onde ligar" e "Lendários"), decisões 63 e 66, `src/meta/items.ts`.

1. **Largada:** em `BattleScene` (onde hoje entra `talentBonuses`), somar `profile.runLoadout().stats` (atk, maxHp, critChance, goldMult) aos talentos; passar `schoolDamage`, `shotBlockChance`, `startRunes` e `legendaryEffects` para a run.
2. **Runas iniciais (Épico):** adquiridas via `onAcquire` antes da onda 1, aparecem na faixa de runas e saem do sorteio do draft.
3. **Stats novos:** `schoolDamage` (+% no dano dos efeitos das runas da escola) e `shotBlockChance` (chance de anular o tiro do atirador na barreira; RNG da run).
4. **Lendários:** implementar os 18 `effectId` de `items.json` com seus `params`, criando os contadores que faltarem (quiques/impactos por orbe, `isCrit`, abates e combo do turno, tipo do alvo, queimadura sem `ignite`). Usar FX/sons existentes por eventos já emitidos; nada novo em fx/audio.
5. **Drops:** ao vencer a onda 7 (mini-chefe) e o chefe, `rollDrop` com o RNG da run; emitir `run:itemDrop`; no fim da run, `run:ended.items` com tudo o que caiu e `profile.addItems(...)` junto com o registro da run. Derrota depois da onda 7 mantém o item da onda 7.

Testes de unidade para stats novos, runas iniciais, drops e cada lendário (pelo menos 1 caso por `effectId`). Typecheck e suíte verdes.

**Entrega:** até 6 linhas, com o que não foi verificado.
