# RuneSling — guia de UI (direção A, fantasia ornamentada)

Fonte: decisões 36–38, contrato `docs/briefings/_contrato-m5-ui.md`, mockup `docs/mockups/ui-direcoes.html` (seção A). Prompts das peças: seção 3 de [`arte-prompts.md`](arte-prompts.md) (preset `ui_piece` em `scripts/assets-manifest.json`). Base de cor e regras de IA: [`arte.md`](arte.md).

## Paleta
- **Fundo:** obsidiana `#0D1020` → `#06070F`; véu do modal `rgba(6,7,15,.92)`.
- **Pedra (placas):** `#2B3040` → `#191C27` (painel), `#20242F` → `#14161F` (carta), rebaixado `#0C0E16`.
- **Ferro (molduras):** `#3B4157` corpo, `#6A7290` aresta clara, `#4A5168` aro fino, `#0A0B10` contorno, sombra de base `#05060A`.
- **Ouro (destaque, botão principal):** `#FFF0B0` → `#FECA57` → `#E3A52B` → `#B87B14`, contorno `#3A2606`.
- **Fita:** `#B8283A` → `#7A1424`, pontas `#8F1D2C` → `#5C0F1A`, costura `#E6B450`.
- **Ação (ciano):** `#88FFFF` → `#00CEC9` → `#0984E3`, contorno `#062838`.
- **Sinergias (só no friso e nos cantos da carta/gema):** elétrica ciano `#00CEC9/#0984E3`, ígnea magma `#FF9F43/#992D0C`, espectral violeta `#9C6BFF/#3E1F73`, núcleo ouro/ferro `#FECA57/#B87B14` (suposição: o mockup não mostra núcleo).
- **Texto:** creme `#FFE9B0` (títulos em fita/carta), ouro `#FECA57` (números de destaque), `#C3C8DD` corpo, `#9AA2C4` rótulos.

## Materiais
Pedra cinza-azulada com grão fino, ferro forjado escuro, ouro polido só em rebites, frisos e no botão principal. Pintura 2D à mão, luz de cima dentro da forma. **Nunca** brilho externo, sombra projetada ou texto na peça (brilho de seleção e sombra de base ficam no CSS).

## Moldura, cantos e espessura (no tamanho final da peça)
- Painel: moldura de ferro ~8% da largura (≈20 px em 256), friso de ouro interno, um rebite de ouro por canto, cantos levemente arredondados (raio ≈10 px).
- Painel rebaixado: aro fino ~4% (≈8 px), sem rebite, sem ouro, sombra interna no topo.
- Botões: contorno 3 px, bisel claro no topo e lábio escuro embaixo (relevo), cantos raio ≈12 px.
- Carta: moldura de ferro ~12% da largura com friso e capas de canto na cor da sinergia; topo central livre para a gema (posta pelo código, `ui_gem_*`).
- Fita: faixa reta, costura de ouro em cima e embaixo, pontas dobradas em rabo de andorinha.

## Estados de botão (uma peça só, estados no CSS)
- **Normal:** a peça como está + sombra de base `0 6px 0 #05060A`.
- **Pressionado:** `translateY(4px)`, sombra de base reduzida a 2 px, `filter: brightness(.9)`.
- **Desabilitado:** `filter: grayscale(.8) brightness(.6)`, sem sombra de base, texto `#8F97B8`, cursor padrão.
- **Selecionado (abas, carta escolhida):** friso de ouro e brilho no CSS, nunca na imagem.

## Tipografia
- **Cinzel 900:** logo, títulos de painel, nome da carta, botão JOGAR, números grandes (onda, recorde). Sombra `0 2px 0 #000`.
- **Plus Jakarta Sans 700–800:** rótulos em caixa alta com espaçamento `.08–.14em`, corpo 600, valores do HUD.
- Texto nunca vem na imagem: é HTML sobre a peça.

## Regras de 9-slice
- Insets `[topo, direita, baixo, esquerda]` em px no tamanho final, em `nineSlice` de cada item do manifesto (vão para `public/assets/ui/ui.json` na T-039).
- **Cantos:** únicas áreas com ornamento (rebite, capa, curva). Ficam dentro do inset.
- **Bordas:** entre os cantos, faixa uniforme sem rebite, gema ou desenho no meio, pois esticam.
- **Centro:** liso e uniforme, sem ponto focal nem gradiente forte, pois estica ou repete (`border-image ... round`).
- **Fita (3-slice):** insets só à esquerda/direita (`[0, 80, 0, 80]`); a faixa do meio estica na horizontal.
- Gemas e ícones não fatiam (`nineSlice: null`).
- Proporção de geração: botão, fita e barra em tela 16:9; carta em 3:4 (vertical); painel, gema e ícone em 1:1. O pipeline faz trim e redimensiona para o tamanho do item.
