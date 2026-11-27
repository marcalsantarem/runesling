# BRF-066 — AG04 — T-075 Catálogo e regras dos itens
**Regra:** respostas curtas; sem commit/push/branches (branch atual `M8`). **Permitido:** criar `src/data/items.json`, tipos em `src/data/types.ts` (só os de itens) e a validação dos dados (onde `loadGameData` valida hoje), testes em `tests/data/`, e o contrato `docs/briefings/_contrato-m8-itens.md`.

**Ler:** decisões 62–69; GDD §5.1–5.2 e §4; `src/data/perks.json`, `talents.json`, `types.ts`; `src/meta/profile.ts` (só para entender o save).

**Estrutura (proposta do AG00, pode ajustar com motivo):** 6 espaços (`staff`, `orb`, `ring`, `amulet`, `cloak`, `boots`) × 3 itens, **um por escola** (`lightning`, `fire`, `spectral`). Id: `<espaço>_<escola>` (ex.: `staff_fire`). Nome provisório = id; os nomes vêm da T-076.

**Definir no `items.json`:**
1. Por item: espaço, escola, `iconKey`, stats por raridade (Comum, Incomum, Raro: só números crescentes; Comum ≈ 1–2 níveis de talento, decisão 69). Stat por espaço como no GDD §5.2 (Cajado ATK, Orbe efeito elemental inicial em número, Anel crítico, Amuleto HP da base, Capa menos dano de atiradores, Botas ouro/draft).
2. Épico: os números do Raro + 1 runa da escola do item que a run começa ativa (de `perks.json`); evitar repetir a mesma runa em muitos itens.
3. Lendário: os números + 1 efeito único por item, **descrito em dados** com um `effectId` e parâmetros, implementável com os ganchos atuais da partida (`onEnemyHit`, `onKill`, `onTurnEnd`, `onDamageCalc` etc.). Efeitos simples.
4. Regras: chances de raridade por fonte (onda 7, chefe, baú; decisão 65: quase sempre Comum, pouca Incomum, raro Raro), quantos itens dá o chefe (1–2), preço do baú em ouro, cor do Incomum (esmeralda da paleta GDD §6).

**Contrato `_contrato-m8-itens.md` (curto):** schema do item; formato no save (inventário empilhado por `itemId+raridade` com contagem; 6 espaços equipados); API pura que a T-077 vai criar (equipar, fundir 3→1, sortear drop, abrir baú, `runLoadout()` = bônus de stats + runas iniciais + `effectId`s lendários) e os eventos do `gameBus` para AG01/AG02. Só descrever; a lógica é da T-077.

Typecheck e suíte verdes.

**Entrega:** até 8 linhas, com uma tabela-resumo dos números e efeitos para o dono aprovar e o que não foi verificado.
