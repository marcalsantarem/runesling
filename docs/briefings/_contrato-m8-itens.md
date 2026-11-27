# Contrato M8 — Itens (T-075 → T-077, AG01, AG02)

Dados: `src/data/items.json` (tipos e validação em `src/data/types.ts`: `ItemDef`, `ItemRulesDef`, `validateItems`). Decisões 62–69.

## Schema do item
`id` = `<espaço>_<escola>` · `name` (provisório = id; T-076) · `slot` (`staff|orb|ring|amulet|cloak|boots`) · `school` (`lightning|fire|spectral`) · `iconKey` (`item_<id>`) · `stat` · `values {common, uncommon, rare}` · `epicRune` (PerkId da escola) · `legendary {effectId, trigger, desc, params}`.

Por raridade (decisão 66, cumulativo):
- Comum / Incomum / Raro: `values[raridade]` no `stat`.
- Épico: `values.rare` + `epicRune` ativa desde o início da run.
- Lendário: `values.rare` + `epicRune` + `legendary.effectId`.

Stats (`ItemStat`): `atk`, `maxHp`, `critChance`, `goldMult` somam como os talentos; `schoolDamage` = +fração no dano dos efeitos das runas da escola do item (splash, cadeia, ignite...); `shotBlockChance` = chance de anular cada tiro de atirador na barreira (o tiro causa 1–2, por isso chance e não %).

Regras (`items.rules`): `rarities` (cores; Incomum `#1DD1A1`), `fuseCount` 3, `dropOdds.{miniboss|boss|chest}` (Comum/Incomum/Raro, soma 1), `bossDrops {base 1, extra 1, extraChance 0.4}`, `chest.priceGold`. Item do drop: uniforme entre os 18.

## Save (perfil, `PROFILE_SAVE_VERSION` sobe para 2; save v1 ganha inventário vazio)
```ts
items: {
  inventory: { itemId: string; rarity: ItemRarity; count: number }[]; // empilhado por itemId+rarity, count ≥ 1
  equipped: Record<ItemSlot, { itemId: string; rarity: ItemRarity } | null>;
}
```
Equipar move 1 unidade do inventário para o espaço (o anterior volta ao inventário). Sanitize: descarta id/raridade inválidos, item no espaço errado e count ≤ 0.

## API pura (T-077, `src/meta/items.ts`; sem Phaser, RNG injetado)
- `equip(items, itemId, rarity)` / `unequip(items, slot)` → novo estado.
- `canFuse(items, itemId, rarity)` / `fuse(items, itemId, rarity)` → consome 3 (`fuseCount`) e dá 1 da raridade seguinte; Lendário não funde. Itens equipados não contam.
- `rollDrop(source, rng, data)` → `{itemId, rarity}[]` (chefe: 1 + extra com `extraChance`).
- `openChest(profile, rng)` → debita `priceGold` e soma 1 drop `chest`; falha sem ouro.
- `runLoadout(equipped, data)` → `{ stats: Partial<Record<ItemStat, number>>, startRunes: PerkId[], legendaryEffects: {effectId, params}[] }`. `startRunes` sem repetição; a run as adquire via `onAcquire` antes da 1ª onda e tira essas runas do draft.

## Eventos `gameBus` (proposta; mudar `src/core/events.ts` depende de briefing)
- Jogo → UI: `run:itemDrop { items: {itemId, rarity}[]; source: 'miniboss' | 'boss' }` (onda 7 e vitória sobre o chefe).
- `run:ended` ganha `items: {itemId, rarity}[]` (o que entra no inventário).
- UI → meta: equipar, fundir e baú são chamadas diretas da API acima pela tela de Equipamentos (sem evento).

## Lendários (AG01 implementa em `CombatResolver`)
Todos usam ganchos existentes (`trigger`): `onKill`, `onEnemyHit`, `onDamageCalc`, `onTurnEnd`, `onLaunch`, `onBumperHit`, `onCeilingHit`. Precisam de dados que talvez faltem hoje: contador de impactos e de quiques por orbe, `isCrit` no impacto, kills e combo do turno, `behaviors` do alvo (`shooter`) e status `burning` fora da `ignite`.
