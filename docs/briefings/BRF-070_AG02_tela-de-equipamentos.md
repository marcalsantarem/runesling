# BRF-070 — AG02 — T-079 Tela de Equipamentos
**Regra:** respostas curtas; sem commit/push/branches (branch atual `M8`). **Permitido:** `src/ui/`, `src/styles/`, testes em `tests/ui/`. **Não toca:** `src/match/`, `src/scenes/`, `src/meta/` (use a API do `PlayerProfile`), `src/core/events.ts`. Outro agente (AG01) mexe em `src/match`, `src/scenes` e pode ajustar testes de UI que dependem de `run:ended.items`: não reescreva esses testes.

**Ler:** `docs/briefings/_contrato-m8-itens.md`, decisões 62–70, `docs/mockups/telas-estilo.html` (estilo validado, decisão 45), `src/ui/menu.ts` (tela de Talentos como modelo).

1. **Entrada:** botão "Equipamentos" no menu, ao lado de Talentos, no mesmo estilo.
2. **Tela (decisão 68):** 6 espaços em volta do mago (silhueta simples em CSS/SVG se não houver imagem), inventário embaixo em grade com pilhas ×N, moldura/borda na cor da raridade (decisão 70), nome (o `legendaryName` no Lendário) e o bônus do item (`itemValue`, runa do Épico, `legendary.desc`). Tocar no item → equipar; tocar no espaço → desequipar; botão **Fundir** ativo quando há 3 iguais livres (mostra o resultado antes de confirmar).
3. **Baú:** na tela de Equipamentos, botão com preço (`rules.chest.priceGold`), desativado sem ouro; ao abrir, mostra o item ganho com a cor da raridade.
4. **Partida e Fim de run:** aviso curto ao receber `run:itemDrop` (sem travar o jogo) e lista dos itens ganhos no Fim de run (`run:ended.items`, pode vir vazio).
5. **Ícones provisórios:** `iconKey` (`item_<id>`) só se a imagem existir em `AVAILABLE_ASSETS`; senão, ícone do espaço em CSS/SVG tingido pela escola. A troca pelos ícones reais (T-081) deve ser só colocar os arquivos.
6. Textos novos em `strings.ts`. Respeitar o palco web (decisão 46) e "reduzir movimento".

Typecheck e suíte verdes; capturas da tela (celular 390×844) na entrega, em `/tmp/claude-0/-home-user-runesling/757070c4-75c0-5ae2-865b-7eac2f8a7bba/scratchpad/t079/`.

**Entrega:** até 6 linhas, com o que não foi verificado.
