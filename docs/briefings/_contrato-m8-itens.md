# Contrato M8 — Itens (T-075 → T-077, AG01, AG02)

Dados: `src/data/items.json` (tipos e validação em `src/data/types.ts`: `ItemDef`, `ItemRulesDef`, `validateItems`). Decisões 62–70.

## Schema do item
`id` = `<espaço>_<escola>` · `name` (nome base) · `legendaryName` (nome no Lendário; narrativa §12, T-076; o validador exige os dois) · `slot` (`staff|orb|ring|amulet|cloak|boots`) · `school` (`lightning|fire|spectral`) · `iconKey` (`item_<id>`) · `stat` · `values {common, uncommon, rare}` · `epicRune` (PerkId da escola) · `legendary {effectId, trigger, desc, params}`.

Por raridade (decisão 66, cumulativo):
- Comum / Incomum / Raro: `values[raridade]` no `stat`.
- Épico: `values.rare` + `epicRune` ativa desde o início da run.
- Lendário: `values.rare` + `epicRune` + `legendary.effectId`.

Stats (`ItemStat`): `atk`, `maxHp`, `critChance`, `goldMult` somam como os talentos; `schoolDamage` = +fração no dano dos efeitos das runas da escola do item (splash, cadeia, ignite...); `shotBlockChance` = chance de anular cada tiro de atirador na barreira (o tiro causa 1–2, por isso chance e não %).

Regras (`items.rules`): `rarities` (cores, decisão 70: common `#8B95B5`, uncommon `#2ECC71`, rare `#3B82F6`, epic `#FF9F43`, legendary `#FF4D4D`), `fuseCount` 3, `dropOdds.{miniboss|boss|chest}` (Comum/Incomum/Raro, soma 1), `bossDrops {base 1, extra 1, extraChance 0.4}`, `chest.priceGold`. Item do drop: uniforme entre os 18.

## Save (perfil, `PROFILE_SAVE_VERSION` sobe para 2; save v1 ganha inventário vazio)
```ts
items: {
  inventory: { itemId: string; rarity: ItemRarity; count: number }[]; // empilhado por itemId+rarity, count ≥ 1
  equipped: Record<ItemSlot, { itemId: string; rarity: ItemRarity } | null>;
}
```
Equipar move 1 unidade do inventário para o espaço (o anterior volta ao inventário). Sanitize (`sanitizeItems`): descarta id/raridade inválidos, item no espaço errado e count ≤ 0; empilha repetidos. Migração v1→v2: `migrateProfile` (perfil igual + `emptyItems()`). `reset()` (T-061) zera os itens.

`PlayerProfile` (T-077): `data().items`, `addItems(refs)`, `equipItem(id, rarity)`, `unequipItem(slot)`, `canFuseItem`/`fuseItem(id, rarity)`, `openChest(rng?)` → drops ou null, `runLoadout()`. Todos gravam no save; retornam false/null quando não podem.

## API pura (T-077, `src/meta/items.ts`; sem Phaser, RNG injetado `RandomSource`; `data` é o último parâmetro, opcional = `loadGameData()`)
Tipos: `ItemRef`, `ItemStack`, `Equipped`, `ItemsState`, `RunLoadout`. Auxiliares: `emptyItems`, `addItems`, `itemValue(item, rarity)`, `itemName(item, rarity)`, `rarityColor`, `nextRarity`, `countOf`.
- `equip(items, itemId, rarity)` → novo estado ou null (sem unidade) / `unequip(items, slot)` → novo estado.
- `canFuse(items, itemId, rarity)` / `fuse(items, itemId, rarity)` → (null se não pode) consome 3 (`fuseCount`) e dá 1 da raridade seguinte; Lendário não funde. Itens equipados não contam.
- `rollDrop(source, rng, data)` → `{itemId, rarity}[]` (chefe: 1 + extra com `extraChance`).
- `openChest({gold, items}, rng)` → `{gold, items, drops}` debitando `priceGold` com 1 drop `chest`; sem ouro → null.
- `runLoadout(equipped, data)` → `{ stats: Partial<Record<ItemStat, number>>, startRunes: PerkId[], legendaryEffects: {effectId, params}[] }`. `startRunes` sem repetição; a run as adquire via `onAcquire` antes da 1ª onda e tira essas runas do draft.

**Onde ligar (T-078, AG01):** ao montar a run, ler `(await getProfile()).runLoadout()` e somar `stats.atk/maxHp/critChance/goldMult` onde hoje entram os bônus de talento; `schoolDamage`, `shotBlockChance`, `startRunes` e `legendaryEffects` vão para o `CombatResolver`. No fim, `profile.addItems(drops)` junto com `recordRun`.

## Eventos `gameBus` (tipos em `src/core/events.ts`, T-077; quem emite é a T-078)
- Jogo → UI: `run:itemDrop { items: ItemDrop[]; source: 'miniboss' | 'boss' }` (onda 7 e vitória sobre o chefe).
- `run:ended` ganha `items?: ItemDrop[]` (o que entra no inventário). **Opcional** por ora para não quebrar `RunController` e testes de UI fora do escopo; a T-078 passa a emitir e pode torná-lo obrigatório.
- UI → meta: equipar, fundir e baú são chamadas diretas da API acima pela tela de Equipamentos (sem evento).

## Lendários (AG01 implementa em `CombatResolver`)
Todos usam ganchos existentes (`trigger`): `onKill`, `onEnemyHit`, `onDamageCalc`, `onTurnEnd`, `onLaunch`, `onBumperHit`, `onCeilingHit`. Precisam de dados que talvez faltem hoje: contador de impactos e de quiques por orbe, `isCrit` no impacto, kills e combo do turno, `behaviors` do alvo (`shooter`) e status `burning` fora da `ignite`.
