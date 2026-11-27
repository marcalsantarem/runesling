# BRF-071 — AG08 — T-080 Prompts dos ícones de itens
**Regra:** respostas curtas; sem commit/push/branches (branch atual `M8`). **Permitido:** `docs/arte-prompts.md`, `docs/arte.md`, `docs/briefings/_contrato-m8-itens.md` (só a parte de arte), manifesto e scripts do pipeline de arte e seus testes. **Proibido:** `src/` e o resto.

**Ler:** decisões 62–70; `docs/narrativa.md` §12 (nomes) e §3 (escolas); `src/data/items.json` (ids, espaço, escola, `iconKey`); `docs/arte-prompts.md` (formato e âncoras); `src/ui/equipment.ts` (onde o ícone entra: `public/assets/icons/item_<id>.webp`, só se estiver em `AVAILABLE_ASSETS`).

1. Nova seção em `docs/arte-prompts.md`: **18 prompts**, um por `item_<id>`, ícone do objeto (cajado, orbe, anel, amuleto, capa, botas) no estilo dos ícones atuais, com a cor e o material da escola (Elétrica ciano, Ígnea magma, Espectral violeta) e o nome do item como guia. O mesmo ícone serve para todas as raridades (a raridade é a borda em CSS, decisão 70), então **sem moldura e sem cor de raridade** no desenho. Para cada um: prompt exato, âncora a anexar (`art-source/anchors/icon_anchor.png` ou outra que faça mais sentido), fundo para recorte, tamanho alvo (128×128 como os ícones atuais) e ordem sugerida (1 âncora de item primeiro, se valer a pena).
2. **Moldura de raridade:** avaliar se precisa de imagem (ex.: um aro de ferro neutro para a célula do item) ou se a borda em CSS basta. Se precisar, 1 prompt de peça neutra, tingida por CSS; não 5 molduras.
3. Pipeline: o manifesto e o script de ingestão passam a reconhecer `item_*` e gravar em `public/assets/icons/`, para a T-081 ser só colocar os PNGs em `art-source/raw/` e rodar o comando. Teste se o pipeline tiver testes.

**Entrega:** até 4 linhas, com a lista de chaves na ordem para o dono gerar.
