# BRF-044 — AG08 — T-058 Prompts das peças de UI no estilo validado
**Leia:** `docs/decisoes.md` 29, 36, 44, 45; `docs/arte-prompts.md` seção 3; `docs/briefings/_contrato-m5-ui.md`; os mockups `docs/mockups/tela-inicial-final.html`, `botao-jogar.html` (A), `telas-estilo.html`; o código atual em `src/ui/` e `src/styles/ui-skin.css` (para ver onde cada peça entra). **Regra:** respostas curtas; sem commit/push/branches.
**Fazer:** revisar a seção 3 de `docs/arte-prompts.md` para que o dono gere as peças já no estilo validado:
- Reescrever `ui_btn_primary`, `ui_btn_secondary`, `ui_btn_action` como a **placa de ferro rebitada** (decisão 44), sem texto, prontas para 9-slice (indicar a área segura do 9-slice no prompt e no manifesto).
- Novas peças do mapa e das telas: fundo do mapa (`ui_map_bg`), nó de capítulo liberado e trancado (`ui_map_node`, `ui_map_node_locked`), escudo rachado da derrota (`ui_defeat_shield`), e qualquer outra que os mockups usem e ainda não tenha chave. Para cada uma: prompt exato, âncora a anexar, fundo para recorte (branco ou magenta), tamanho alvo e uso.
- Remover ou marcar como "não usar" peças que o estilo validado tornou desnecessárias.
- Atualizar `docs/briefings/_contrato-m5-ui.md` com as chaves novas (arquivo, 9-slice ou não) e o manifesto/pipeline (`art-source/`, scripts de ingestão) para reconhecer as chaves novas, com teste se o pipeline tiver testes.
**Permitido:** `docs/arte-prompts.md`, `docs/briefings/_contrato-m5-ui.md`, `docs/arte.md`, `docs/ui-guia.md`, manifesto e scripts do pipeline de arte e seus testes. **Proibido:** `src/ui/`, `src/styles/` e o resto.
**Pronto quando:** prompts revisados e ordenados (âncoras primeiro); `npm test` passa se mexer no pipeline. **Entrega:** até 4 linhas, com a lista de chaves para o dono gerar.
