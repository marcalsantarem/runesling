# BRF-068 — AG04 — T-077 Lógica dos itens
**Regra:** respostas curtas; sem commit/push/branches (branch atual `M8`). **Permitido:** criar `src/meta/items.ts`; alterar `src/meta/profile.ts`, `src/data/items.json`, `src/data/types.ts` (só itens), `src/core/events.ts` (só os 2 eventos abaixo); testes em `tests/meta/` e `tests/data/`.

**Ler:** `docs/briefings/_contrato-m8-itens.md` (siga-o), decisões 62–70, `docs/narrativa.md` §12.

1. **Nomes (T-076):** preencher `name` com o nome base e criar `legendaryName` por item, da tabela da §12 da narrativa; o validador exige os dois.
2. **Cores (decisão 70):** `rarities` = common `#8B95B5`, uncommon `#2ECC71`, rare `#3B82F6`, epic `#FF9F43`, legendary `#FF4D4D`.
3. **API pura** em `src/meta/items.ts` como no contrato (equip/unequip, canFuse/fuse, rollDrop, openChest, runLoadout), RNG injetado.
4. **Save:** `PROFILE_SAVE_VERSION` 2, migração do v1 (inventário vazio), sanitize; métodos no `PlayerProfile` para equipar, fundir, abrir baú e somar itens ganhos (`addItems`), gravando no save. O botão de reset do save (T-061) também zera os itens.
5. **Eventos** em `events.ts`: `run:itemDrop` e o campo `items` em `run:ended`, como no contrato (só os tipos; quem emite é o AG01 na T-078).
6. **Bônus na run:** expor `runLoadout(profile.equipped)` para a partida; somar com os talentos fica com a T-078 (AG01), documentar no contrato onde ligar.

Atualizar o contrato com o que mudar. Typecheck e suíte verdes.

**Entrega:** até 5 linhas, com o que não foi verificado.
