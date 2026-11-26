# RuneSling — guia visual (Obsidian Arcane)

Fonte: GDD §6.1 e §8; decisões 29–32. Prompts prontos: [`arte-prompts.md`](arte-prompts.md) (gerado de `scripts/assets-manifest.json` por `node scripts/prompts-md.mjs`).

## Paleta (cor = mecânica)
- **Fundo (60%):** obsidiana `#0D1020` → `#06070F`. **Estrutura (30%):** ferro `#14182B`, borda `#2E385C`. **Ação (10%):** só nos acentos (olhos, runas).
- Ouro `#FECA57/#B87B14` (chefes, anel, ouro) · Ciano `#00CEC9/#0984E3` (escudo, elétrica) · Magma `#FF9F43/#992D0C` (ígnea, bomba) · Violeta `#9C6BFF/#3E1F73` (espectral, atirador, divisor) · Carmesim `#FF5E57/#8F1D2C` (perigo, chefe) · Esmeralda `#1DD1A1` (cura).
- Cada inimigo usa o par `col1/col2/rim/eye` do vertical slice (linhas 385–395); os hex estão nos prompts.

## Luz e acabamento
- Pintura 2D estilizada à mão, texturas de pedra e metal forjado, luz de cima, sombras fortes dentro da forma.
- O ponto mais claro é o acento da mecânica (olhos, visor, runa); o resto fica escuro e dessaturado.

## Moldura dos medalhões
- Inimigo comum: medalhão circular que ocupa o quadro, aro grosso de ferro forjado com rebites, miolo obsidiana. O pipeline aplica `circularMask` (256 px).
- Chefe/mini-chefe: aro entalhado ouro + obsidiana; chifres podem sair do aro (sem máscara, 384 px).
- Obstáculos vistos de cima (192 px); ícones sem moldura, um símbolo só (128 px).

## Legibilidade (34–72 px na tela)
- Inimigos têm raio 12–36 → 24–72 px de diâmetro; ícones de UI ~34–48 px. Silhueta e um acento de cor precisam ler nesse tamanho: pouco detalhe fino, contraste alto entre aro e miolo, nada decisivo perto da borda.
- Teste: reduzir a 48 px sobre `#0D1020` e reconhecer o inimigo pela cor e pela forma.

## Fundo chapado para recorte (decisão 30)
- Padrão `white` (`#FFFFFF`). `magenta` (`#FF00FF`) quando o assunto tem branco/ciano claro dominante (elétricos, bumper, anel, clérigo, trim). Violetas ficam em `white` (magenta colidiria com o violeta).
- Chão e ícone do app não recortam (app com fundo `#0D1020`, sem transparência).

## O que a IA não faz (vai no código, GDD §8.1)
- **Nunca** brilho externo (*outer glow*), halo, luz vazando para fora da forma, sombra projetada no fundo.
- **Nunca** texto, letras ou números. Orbes, rastros, raios, escudo holográfico, auras e explosões são WebGL.

## Âncoras (decisão 31)
1. Gerar as 4 variações de `enemy_shield` e `icon_chain_lightning` (seção 1 do `arte-prompts.md`), sem anexo.
2. O dono escolhe; salvar em `art-source/anchors/medallion_anchor.png` e `icon_anchor.png`.
3. No lote, anexar a âncora indicada em cada item. O Gemini não garante o tamanho: o pipeline faz trim, centraliza e redimensiona.
