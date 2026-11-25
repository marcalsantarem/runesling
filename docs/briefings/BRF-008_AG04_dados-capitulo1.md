# BRF-008 — AG04 — T-005 Dados do Capítulo 1
**Leia:** `docs/agentes/AG04_Sistemas.md`; `docs/gdd.md` §3 (inteiro), §4, §5.1 e §7.3; em `reference/vertical-slice-v0.1.html` as linhas 385–444 (DATA) e 1098–1194 (fim de turno: avanço, tiros, barreira). **Regra:** respostas curtas; sem commit/push/branches.
**Contrato (o AG01 trabalha em paralelo na física e depois usa estes dados no combate):** os tipos em `src/data/types.ts` são a fonte. Coordenadas no mundo lógico 360×520. A arena descreve formas puras: `bumpers: {x,y,r}[]`, `pillars: {x,y,w,h}[]` (AABB, canto superior esquerdo), `rings: {x,y,r}[]`, mais `launch: {x,y}` (180, 468) e `barrierY` (436). Ids do GDD (`goblin`, `shield`, …, `miniboss_iron`, `boss_obsidian`).
**Fazer:**
(1) `src/data/enemies.json` com os 9 inimigos (GDD §3.3 + schema §7.3): raio, `hpMult`, ouro, `advancePx`, `barrierDmg`, `behaviors` e parâmetros (`front_shield` com `minNormalY` 0.30, `shooter`, `explodes` 92 px e 2.5× ATK, `splits` em 2 `mini` a ±20 px, `heals` 22% em 130 px, `summoner`). Onde o GDD não traz um número, use o do slice e marque na entrega.
(2) `src/data/perks.json` com as 15 runas (GDD §4.1–4.4): sinergia, gatilho, `repeatable` e `params` numéricos (chances, razões, raios). Sem textos longos de UI: `name` e `desc` curtos em pt-BR.
(3) `src/data/talents.json` (GDD §5.1), `src/data/arenas.json` (`arena_crypt_standard`, do slice), `src/data/chapters.json` (`chapter_1`, GDD §7.3) e constantes globais da run em `src/data/rules.json` (fórmula de HP §3.2, multiplicadores de dano §4.5, física §2.2–2.3, teto de 28 orbes, bônus de vitória +60).
(4) `src/data/types.ts`: tipos TS de todos os arquivos, `loadGameData()` que importa os JSON tipados, e `validateGameData()` que confere referências cruzadas (ids de spawn, pools, perks).
(5) `src/meta/`: funções puras `enemyHp(typeId, wave)` (GDD §3.2) e `talentCost(id, level)` (§5.1).
(6) Testes em `tests/meta/`: validação dos dados, HP em ondas de referência (1, 7, 15) e custos de talento.
**Permitido:** `src/data/`, `src/meta/`, `tests/meta/`. **Proibido:** o resto (inclusive `src/core/`, `src/match/`, configs).
**Pronto quando:** `npm run typecheck` e `npm test` verdes, com os testes novos contados.
**Entrega:** até 8 linhas: arquivos, nº de testes, números tirados do slice por falta no GDD, divergências GDD × slice, o que não foi verificado.
