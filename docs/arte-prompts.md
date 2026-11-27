# RuneSling — prompts de arte (Gemini)

> Gerado por `node scripts/prompts-md.mjs` a partir de `scripts/assets-manifest.json`. Não edite à mão.

Como usar: cole o bloco de código inteiro no Gemini, gere, baixe em PNG e devolva com o nome indicado. Guia de estilo: `docs/arte.md`.

Total: 2 âncoras (8 variações) + 29 itens do lote + 36 peças de UI + 18 ícones de itens = 85 chaves (mais 1 marcada(s) "não usar").

## 1. Âncoras (gerar primeiro, sem imagem anexa)

Gere as 4 variações de cada âncora, escolha uma e salve a escolhida no caminho de âncora indicado. A escolhida também serve como o próprio asset (devolva com o nome do arquivo).

### `enemy_shield`

- Arquivo a devolver: `art-source/raw/enemies/enemy_shield.png`
- Âncora escolhida vira: `art-source/anchors/medallion_anchor.png`
- Fundo: white
- Situação: **escolhida e entregue** (âncora salva)

**Variação A**

```text
Generate one square 1:1 image. heavy dark knight helmet bust, steel-blue plate armor (#6474A8 to #1E2540), pale silver rim highlights (#9FB0E0), glowing cyan visor slit (#00CEC9), battle-worn metal plate. circular monster medallion token filling the frame, thick round forged dark iron rim with small rivets, dark obsidian inner background, dark fantasy 2D game asset, stylized hand-painted illustration, clean bold silhouette readable at 40 pixels, rich forged metal and stone textures, dramatic top-down lighting, glowing eyes as the brightest accent, no outer glow, no light bleeding outside the rim, centered, front view, no text, no letters, no numbers, no UI. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture.
```

**Variação B**

```text
Generate one square 1:1 image. heavy dark knight helmet bust, steel-blue plate armor (#6474A8 to #1E2540), pale silver rim highlights (#9FB0E0), glowing cyan visor slit (#00CEC9), battle-worn metal plate. Variation: heavier and more angular great helm, deeper shadows, stronger metal scratches. circular monster medallion token filling the frame, thick round forged dark iron rim with small rivets, dark obsidian inner background, dark fantasy 2D game asset, stylized hand-painted illustration, clean bold silhouette readable at 40 pixels, rich forged metal and stone textures, dramatic top-down lighting, glowing eyes as the brightest accent, no outer glow, no light bleeding outside the rim, centered, front view, no text, no letters, no numbers, no UI. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture.
```

**Variação C**

```text
Generate one square 1:1 image. heavy dark knight helmet bust, steel-blue plate armor (#6474A8 to #1E2540), pale silver rim highlights (#9FB0E0), glowing cyan visor slit (#00CEC9), battle-worn metal plate. Variation: rounder helmet with a tall crest ridge, slightly brighter rim, cleaner and simpler shapes for small sizes. circular monster medallion token filling the frame, thick round forged dark iron rim with small rivets, dark obsidian inner background, dark fantasy 2D game asset, stylized hand-painted illustration, clean bold silhouette readable at 40 pixels, rich forged metal and stone textures, dramatic top-down lighting, glowing eyes as the brightest accent, no outer glow, no light bleeding outside the rim, centered, front view, no text, no letters, no numbers, no UI. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture.
```

**Variação D**

```text
Generate one square 1:1 image. heavy dark knight helmet bust, steel-blue plate armor (#6474A8 to #1E2540), pale silver rim highlights (#9FB0E0), glowing cyan visor slit (#00CEC9), battle-worn metal plate. Variation: helmet slightly turned three-quarters, visor slit as a single horizontal line, minimal ornament, maximum silhouette contrast. circular monster medallion token filling the frame, thick round forged dark iron rim with small rivets, dark obsidian inner background, dark fantasy 2D game asset, stylized hand-painted illustration, clean bold silhouette readable at 40 pixels, rich forged metal and stone textures, dramatic top-down lighting, glowing eyes as the brightest accent, no outer glow, no light bleeding outside the rim, centered, front view, no text, no letters, no numbers, no UI. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture.
```

### `icon_chain_lightning`

- Arquivo a devolver: `art-source/raw/icons/icon_chain_lightning.png`
- Âncora escolhida vira: `art-source/anchors/icon_anchor.png`
- Fundo: magenta
- Situação: **escolhida e entregue** (âncora salva)

**Variação A**

```text
Generate one square 1:1 image. crackling cyan arcane lightning bolt forking into a chain between two small orbs (#00CEC9 to #0984E3). RPG skill icon, stylized hand-painted dark fantasy 2D game icon, one single central symbol, high contrast, crisp readable silhouette at 34 pixels, dark iron runic details, no frame, no border, no outer glow, no light bleeding outside the symbol, centered, no text, no letters, no numbers. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject.
```

**Variação B**

```text
Generate one square 1:1 image. crackling cyan arcane lightning bolt forking into a chain between two small orbs (#00CEC9 to #0984E3). Variation: thicker single zigzag bolt connecting three small orbs, fewer branches. RPG skill icon, stylized hand-painted dark fantasy 2D game icon, one single central symbol, high contrast, crisp readable silhouette at 34 pixels, dark iron runic details, no frame, no border, no outer glow, no light bleeding outside the symbol, centered, no text, no letters, no numbers. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject.
```

**Variação C**

```text
Generate one square 1:1 image. crackling cyan arcane lightning bolt forking into a chain between two small orbs (#00CEC9 to #0984E3). Variation: bolt wrapped around one central orb with two thin iron runic rings, more ornate. RPG skill icon, stylized hand-painted dark fantasy 2D game icon, one single central symbol, high contrast, crisp readable silhouette at 34 pixels, dark iron runic details, no frame, no border, no outer glow, no light bleeding outside the symbol, centered, no text, no letters, no numbers. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject.
```

**Variação D**

```text
Generate one square 1:1 image. crackling cyan arcane lightning bolt forking into a chain between two small orbs (#00CEC9 to #0984E3). Variation: flat bold bolt shape, minimal detail, maximum readability at very small size. RPG skill icon, stylized hand-painted dark fantasy 2D game icon, one single central symbol, high contrast, crisp readable silhouette at 34 pixels, dark iron runic details, no frame, no border, no outer glow, no light bleeding outside the symbol, centered, no text, no letters, no numbers. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject.
```

## 2. Lote (anexar a âncora indicada como imagem de referência)

### `enemy_goblin`

- Arquivo a devolver: `art-source/raw/enemies/enemy_goblin.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 256 px
- Situação: **entregue**

```text
Generate one square 1:1 image. angry armored goblin warrior bust, tan-orange leathery skin (#C87D4B to #4A2511), pointed ears, crude bronze rim highlights (#D4A373), glowing amber eyes (#FECA57). circular monster medallion token filling the frame, thick round forged dark iron rim with small rivets, dark obsidian inner background, dark fantasy 2D game asset, stylized hand-painted illustration, clean bold silhouette readable at 40 pixels, rich forged metal and stone textures, dramatic top-down lighting, glowing eyes as the brightest accent, no outer glow, no light bleeding outside the rim, centered, front view, no text, no letters, no numbers, no UI. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `enemy_shooter`

- Arquivo a devolver: `art-source/raw/enemies/enemy_shooter.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 256 px
- Situação: **entregue**

```text
Generate one square 1:1 image. hooded cultist caster bust, violet robes (#9C6BFF to #2D1459), lilac rim highlights (#D1B3FF), face hidden in shadow, glowing red eyes (#FF5E57). circular monster medallion token filling the frame, thick round forged dark iron rim with small rivets, dark obsidian inner background, dark fantasy 2D game asset, stylized hand-painted illustration, clean bold silhouette readable at 40 pixels, rich forged metal and stone textures, dramatic top-down lighting, glowing eyes as the brightest accent, no outer glow, no light bleeding outside the rim, centered, front view, no text, no letters, no numbers, no UI. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `enemy_bomb`

- Arquivo a devolver: `art-source/raw/enemies/enemy_bomb.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 256 px
- Situação: **entregue**

```text
Generate one square 1:1 image. magma golem head, cracked black basalt plates with molten orange seams (#FF9F43 to #7A2208), pale yellow rim highlights (#FFEAA7), white-hot eyes (#FFF6CC). circular monster medallion token filling the frame, thick round forged dark iron rim with small rivets, dark obsidian inner background, dark fantasy 2D game asset, stylized hand-painted illustration, clean bold silhouette readable at 40 pixels, rich forged metal and stone textures, dramatic top-down lighting, glowing eyes as the brightest accent, no outer glow, no light bleeding outside the rim, centered, front view, no text, no letters, no numbers, no UI. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `enemy_splitter`

- Arquivo a devolver: `art-source/raw/enemies/enemy_splitter.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 256 px
- Situação: **entregue**

```text
Generate one square 1:1 image. wraith specter face, translucent magenta-violet ghostly hood (#E056FD to #47126B), pink rim highlights (#F5B5FF), hollow white glowing eyes. circular monster medallion token filling the frame, thick round forged dark iron rim with small rivets, dark obsidian inner background, dark fantasy 2D game asset, stylized hand-painted illustration, clean bold silhouette readable at 40 pixels, rich forged metal and stone textures, dramatic top-down lighting, glowing eyes as the brightest accent, no outer glow, no light bleeding outside the rim, centered, front view, no text, no letters, no numbers, no UI. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `enemy_mini`

- Arquivo a devolver: `art-source/raw/enemies/enemy_mini.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 256 px
- Situação: **entregue**

```text
Generate one square 1:1 image. tiny wisp spark creature, round small violet ember body (#C56CF0 to #381254), very simple shape, two big white glowing eyes, minimal detail so it reads at 24 pixels. circular monster medallion token filling the frame, thick round forged dark iron rim with small rivets, dark obsidian inner background, dark fantasy 2D game asset, stylized hand-painted illustration, clean bold silhouette readable at 40 pixels, rich forged metal and stone textures, dramatic top-down lighting, glowing eyes as the brightest accent, no outer glow, no light bleeding outside the rim, centered, front view, no text, no letters, no numbers, no UI. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `enemy_healer`

- Arquivo a devolver: `art-source/raw/enemies/enemy_healer.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: magenta · tamanho final 256 px
- Situação: **entregue**

```text
Generate one square 1:1 image. dark cleric bust in a hood with a small holy sigil on the forehead, emerald robes (#1DD1A1 to #0B4D3C), mint rim highlights (#8EF5D8), soft pale green eyes (#E8FFF8). circular monster medallion token filling the frame, thick round forged dark iron rim with small rivets, dark obsidian inner background, dark fantasy 2D game asset, stylized hand-painted illustration, clean bold silhouette readable at 40 pixels, rich forged metal and stone textures, dramatic top-down lighting, glowing eyes as the brightest accent, no outer glow, no light bleeding outside the rim, centered, front view, no text, no letters, no numbers, no UI. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `miniboss_iron`

- Arquivo a devolver: `art-source/raw/bosses/miniboss_iron.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 384 px
- Situação: **entregue**

```text
Generate one square 1:1 image. iron guardian colossus helmet bust, massive riveted blue-grey armor (#7C8BB8 to #1B223B), tower shield edge in front, gold rim (#FECA57), glowing cyan eye slit (#00CEC9). ornate boss circular medallion token, thick carved gold and obsidian rim, dark fantasy 2D game asset, stylized hand-painted illustration, clean bold silhouette readable at 70 pixels, dramatic top-down lighting, no outer glow, no light bleeding outside the shape, centered, front view, no text, no letters, no numbers, no UI. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `boss_obsidian`

- Arquivo a devolver: `art-source/raw/bosses/boss_obsidian.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 384 px
- Situação: **entregue**

```text
Generate one square 1:1 image. horned obsidian demon lord bust, crimson and black skin (#FF5E57 to #450C17), thick carved gold and crimson circular rim (#FECA57), curved golden horns protruding slightly above the top rim, fiery pale yellow eyes (#FFF3B0). ornate boss circular medallion token, thick carved gold and obsidian rim, dark fantasy 2D game asset, stylized hand-painted illustration, clean bold silhouette readable at 70 pixels, dramatic top-down lighting, no outer glow, no light bleeding outside the shape, centered, front view, no text, no letters, no numbers, no UI. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `obstacle_bumper_rune`

- Arquivo a devolver: `art-source/raw/obstacles/obstacle_bumper_rune.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: magenta · tamanho final 192 px
- Situação: **entregue**

```text
Generate one square 1:1 image. circular runic pinball bumper seen from above, round dark iron dome with a carved cyan rune in the center (#00CEC9), thick iron ring edge, perfectly round silhouette. top-down view arena prop, dark fantasy 2D game asset, stylized hand-painted illustration, forged dark iron and obsidian stone, clean bold silhouette, dramatic top-down lighting, no outer glow, no light bleeding outside the shape, no cast shadow, centered, no text, no letters, no numbers, no UI. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `obstacle_pillar_obsidian`

- Arquivo a devolver: `art-source/raw/obstacles/obstacle_pillar_obsidian.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 192 px
- Situação: **entregue**

```text
Generate one square 1:1 image. horizontal rectangular obsidian stone beam seen from above, polished black stone (#14182B) with carved edges and thin forged iron bands at both ends, wide flat proportions about 4 to 1, sharp rectangular silhouette. top-down view arena prop, dark fantasy 2D game asset, stylized hand-painted illustration, forged dark iron and obsidian stone, clean bold silhouette, dramatic top-down lighting, no outer glow, no light bleeding outside the shape, no cast shadow, centered, no text, no letters, no numbers, no UI. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `obstacle_ring_multiplier`

- Arquivo a devolver: `art-source/raw/obstacles/obstacle_ring_multiplier.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: magenta · tamanho final 192 px
- Situação: **entregue**

```text
Generate one square 1:1 image. circular golden portal ring seen from above, thin ornate gold ring (#FECA57 to #B87B14) with small engraved runes, empty hollow center, perfectly round silhouette. top-down view arena prop, dark fantasy 2D game asset, stylized hand-painted illustration, forged dark iron and obsidian stone, clean bold silhouette, dramatic top-down lighting, no outer glow, no light bleeding outside the shape, no cast shadow, centered, no text, no letters, no numbers, no UI. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `icon_bumper_shock`

- Arquivo a devolver: `art-source/raw/icons/icon_bumper_shock.png`
- Anexar no Gemini: `art-source/anchors/icon_anchor.png`
- Fundo: magenta · tamanho final 128 px
- Situação: **entregue**

```text
Generate one square 1:1 image. round runic bumper releasing a ring-shaped cyan electric shockwave (#00CEC9 to #0984E3). RPG skill icon, stylized hand-painted dark fantasy 2D game icon, one single central symbol, high contrast, crisp readable silhouette at 34 pixels, dark iron runic details, no frame, no border, no outer glow, no light bleeding outside the symbol, centered, no text, no letters, no numbers. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `icon_static_crit`

- Arquivo a devolver: `art-source/raw/icons/icon_static_crit.png`
- Anexar no Gemini: `art-source/anchors/icon_anchor.png`
- Fundo: magenta · tamanho final 128 px
- Situação: **entregue**

```text
Generate one square 1:1 image. sharp cyan electric spark striking a cracked target mark, critical hit feeling (#00CEC9 to #0984E3). RPG skill icon, stylized hand-painted dark fantasy 2D game icon, one single central symbol, high contrast, crisp readable silhouette at 34 pixels, dark iron runic details, no frame, no border, no outer glow, no light bleeding outside the symbol, centered, no text, no letters, no numbers. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `icon_storm_orb`

- Arquivo a devolver: `art-source/raw/icons/icon_storm_orb.png`
- Anexar no Gemini: `art-source/anchors/icon_anchor.png`
- Fundo: magenta · tamanho final 128 px
- Situação: **entregue**

```text
Generate one square 1:1 image. cyan storm orb with tiny lightning bolts swirling inside a glass-like sphere (#00CEC9 to #0984E3). RPG skill icon, stylized hand-painted dark fantasy 2D game icon, one single central symbol, high contrast, crisp readable silhouette at 34 pixels, dark iron runic details, no frame, no border, no outer glow, no light bleeding outside the symbol, centered, no text, no letters, no numbers. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `icon_fire_splash`

- Arquivo a devolver: `art-source/raw/icons/icon_fire_splash.png`
- Anexar no Gemini: `art-source/anchors/icon_anchor.png`
- Fundo: white · tamanho final 128 px
- Situação: **entregue**

```text
Generate one square 1:1 image. orange fireball impact splashing flames outward in a burst (#FF9F43 to #992D0C). RPG skill icon, stylized hand-painted dark fantasy 2D game icon, one single central symbol, high contrast, crisp readable silhouette at 34 pixels, dark iron runic details, no frame, no border, no outer glow, no light bleeding outside the symbol, centered, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `icon_ignite`

- Arquivo a devolver: `art-source/raw/icons/icon_ignite.png`
- Anexar no Gemini: `art-source/anchors/icon_anchor.png`
- Fundo: white · tamanho final 128 px
- Situação: **entregue**

```text
Generate one square 1:1 image. persistent orange flame burning on a dark iron brazier (#FF9F43 to #992D0C). RPG skill icon, stylized hand-painted dark fantasy 2D game icon, one single central symbol, high contrast, crisp readable silhouette at 34 pixels, dark iron runic details, no frame, no border, no outer glow, no light bleeding outside the symbol, centered, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `icon_supernova`

- Arquivo a devolver: `art-source/raw/icons/icon_supernova.png`
- Anexar no Gemini: `art-source/anchors/icon_anchor.png`
- Fundo: white · tamanho final 128 px
- Situação: **entregue**

```text
Generate one square 1:1 image. skull bursting into a fiery orange explosion (#FF9F43 to #992D0C). RPG skill icon, stylized hand-painted dark fantasy 2D game icon, one single central symbol, high contrast, crisp readable silhouette at 34 pixels, dark iron runic details, no frame, no border, no outer glow, no light bleeding outside the symbol, centered, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `icon_molten_core`

- Arquivo a devolver: `art-source/raw/icons/icon_molten_core.png`
- Anexar no Gemini: `art-source/anchors/icon_anchor.png`
- Fundo: white · tamanho final 128 px
- Situação: **entregue**

```text
Generate one square 1:1 image. molten magma core, cracked rock sphere with glowing orange lava heart (#FF9F43 to #992D0C). RPG skill icon, stylized hand-painted dark fantasy 2D game icon, one single central symbol, high contrast, crisp readable silhouette at 34 pixels, dark iron runic details, no frame, no border, no outer glow, no light bleeding outside the symbol, centered, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `icon_ghost_ball`

- Arquivo a devolver: `art-source/raw/icons/icon_ghost_ball.png`
- Anexar no Gemini: `art-source/anchors/icon_anchor.png`
- Fundo: white · tamanho final 128 px
- Situação: **entregue**

```text
Generate one square 1:1 image. translucent violet ghost orb with a faint spectral tail (#9C6BFF to #3E1F73). RPG skill icon, stylized hand-painted dark fantasy 2D game icon, one single central symbol, high contrast, crisp readable silhouette at 34 pixels, dark iron runic details, no frame, no border, no outer glow, no light bleeding outside the symbol, centered, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `icon_ricochet_crit`

- Arquivo a devolver: `art-source/raw/icons/icon_ricochet_crit.png`
- Anexar no Gemini: `art-source/anchors/icon_anchor.png`
- Fundo: white · tamanho final 128 px
- Situação: **entregue**

```text
Generate one square 1:1 image. violet orb bouncing off an angled wall with a sharp zigzag trajectory and crosshair (#9C6BFF to #3E1F73). RPG skill icon, stylized hand-painted dark fantasy 2D game icon, one single central symbol, high contrast, crisp readable silhouette at 34 pixels, dark iron runic details, no frame, no border, no outer glow, no light bleeding outside the symbol, centered, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `icon_wall_clone`

- Arquivo a devolver: `art-source/raw/icons/icon_wall_clone.png`
- Anexar no Gemini: `art-source/anchors/icon_anchor.png`
- Fundo: white · tamanho final 128 px
- Situação: **entregue**

```text
Generate one square 1:1 image. violet orb splitting into two mirrored spectral orbs under a stone ceiling edge (#9C6BFF to #3E1F73). RPG skill icon, stylized hand-painted dark fantasy 2D game icon, one single central symbol, high contrast, crisp readable silhouette at 34 pixels, dark iron runic details, no frame, no border, no outer glow, no light bleeding outside the symbol, centered, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `icon_arcane_sight`

- Arquivo a devolver: `art-source/raw/icons/icon_arcane_sight.png`
- Anexar no Gemini: `art-source/anchors/icon_anchor.png`
- Fundo: white · tamanho final 128 px
- Situação: **entregue**

```text
Generate one square 1:1 image. violet arcane all-seeing eye with a rune iris (#9C6BFF to #3E1F73). RPG skill icon, stylized hand-painted dark fantasy 2D game icon, one single central symbol, high contrast, crisp readable silhouette at 34 pixels, dark iron runic details, no frame, no border, no outer glow, no light bleeding outside the symbol, centered, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `icon_extra_orb`

- Arquivo a devolver: `art-source/raw/icons/icon_extra_orb.png`
- Anexar no Gemini: `art-source/anchors/icon_anchor.png`
- Fundo: magenta · tamanho final 128 px
- Situação: **entregue**

```text
Generate one square 1:1 image. two glowing cyan orbs side by side, one slightly in front of the other, neutral arcane gold accents (#FECA57). RPG skill icon, stylized hand-painted dark fantasy 2D game icon, one single central symbol, high contrast, crisp readable silhouette at 34 pixels, dark iron runic details, no frame, no border, no outer glow, no light bleeding outside the symbol, centered, no text, no letters, no numbers. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `icon_power_surge`

- Arquivo a devolver: `art-source/raw/icons/icon_power_surge.png`
- Anexar no Gemini: `art-source/anchors/icon_anchor.png`
- Fundo: white · tamanho final 128 px
- Situação: **entregue**

```text
Generate one square 1:1 image. runic sword pointing up with gold energy flowing along the blade (#FECA57 to #B87B14). RPG skill icon, stylized hand-painted dark fantasy 2D game icon, one single central symbol, high contrast, crisp readable silhouette at 34 pixels, dark iron runic details, no frame, no border, no outer glow, no light bleeding outside the symbol, centered, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `icon_bastion_heal`

- Arquivo a devolver: `art-source/raw/icons/icon_bastion_heal.png`
- Anexar no Gemini: `art-source/anchors/icon_anchor.png`
- Fundo: magenta · tamanho final 128 px
- Situação: **entregue**

```text
Generate one square 1:1 image. stone seal shaped like a heart with an emerald rune glowing at the center (#1DD1A1). RPG skill icon, stylized hand-painted dark fantasy 2D game icon, one single central symbol, high contrast, crisp readable silhouette at 34 pixels, dark iron runic details, no frame, no border, no outer glow, no light bleeding outside the symbol, centered, no text, no letters, no numbers. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `icon_gold_greed`

- Arquivo a devolver: `art-source/raw/icons/icon_gold_greed.png`
- Anexar no Gemini: `art-source/anchors/icon_anchor.png`
- Fundo: white · tamanho final 128 px
- Situação: **entregue**

```text
Generate one square 1:1 image. small pile of gold coins with a gold crypt key on top (#FECA57 to #B87B14). RPG skill icon, stylized hand-painted dark fantasy 2D game icon, one single central symbol, high contrast, crisp readable silhouette at 34 pixels, dark iron runic details, no frame, no border, no outer glow, no light bleeding outside the symbol, centered, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### `floor_crypt`

- Arquivo a devolver: `art-source/raw/tiles/floor_crypt.png`
- Anexar no Gemini: nenhuma imagem
- Fundo: nenhum · tamanho final 512 px
- Situação: **entregue**

```text
Generate one square 1:1 image. dark obsidian dungeon stone floor tiles with subtle carved ancient runes barely visible, deep navy and charcoal palette (#0D1020 to #06070F). top-down seamless tileable 2D dungeon floor texture, edges wrap perfectly on all four sides, low contrast dark tones, flat even lighting, no vignette, no perspective, no characters, no objects, no text, no UI.
```

### `wall_trim_crypt`

- Arquivo a devolver: `art-source/raw/tiles/wall_trim_crypt.png`
- Anexar no Gemini: nenhuma imagem
- Fundo: magenta · tamanho final 512 px
- Situação: **entregue**

```text
Generate one tall vertical 1:4 strip centered in a square 1:1 canvas image. narrow dark forged iron and obsidian stone pillar column with an iron torch bracket holding an unlit torch, cold blue-grey metal (#14182B, edges #2E385C), tall thin vertical proportions about 1 to 4. vertical side wall trim strip for a portrait mobile game arena, seamless when tiled vertically, front orthographic view, dark fantasy 2D game asset, stylized hand-painted illustration, no outer glow, no light bleeding, no text, no UI. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject.
```

### `app_icon`

- Arquivo a devolver: `art-source/raw/app/app_icon.png`
- Anexar no Gemini: `art-source/anchors/icon_anchor.png`
- Fundo: #0D1020 · tamanho final 1024 px
- Situação: **entregue**

```text
Generate one square 1:1 image. a glowing cyan arcane orb (#00CEC9) resting in a dark forged iron slingshot, gold rune ring (#FECA57) behind it. mobile app icon, square full-bleed composition, stylized hand-painted dark fantasy 2D illustration, one bold central symbol readable at 48 pixels, high contrast, solid dark navy #0D1020 background filling every corner, no transparency, no rounded corners, no border, no text, no letters. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

## 3. Peças de UI (estilo validado, decisões 44 e 45)

Guia: `docs/ui-guia.md`. Peça isolada, reta, frontal, sem texto (texto, runas do botão e ícones por cima são HTML). O 9-slice é `[topo, direita, baixo, esquerda]` em px no tamanho final; "não" = peça inteira. Ordem: gere a âncora de UI (3.1) primeiro, salve a escolhida em `art-source/anchors/ui_anchor.png` e anexe-a em todas as outras peças.

### 3.1 Âncora de UI (gerar primeiro)

Gere 4 vezes, escolha uma, salve a escolhida no caminho de âncora indicado e devolva também com o nome do arquivo.

#### `ui_btn_primary`

- Uso: Botão principal (JOGAR, JOGAR DE NOVO, Continuar): placa ouro de plate() em src/ui/dom.ts. Âncora de UI.
- Arquivo a devolver: `art-source/raw/ui/ui_btn_primary.png`
- Âncora escolhida vira: `art-source/anchors/ui_anchor.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 384×96 px · 9-slice: 40, 40, 40, 40
- Situação: **escolhida e entregue** (âncora salva)

```text
Generate one image with a wide landscape 16:9 canvas. one empty wide horizontal riveted iron plate button about 4 to 1 proportion, outer shape is a long rectangle with small 45 degree chamfered corners like a stretched octagon, thick black outline (#0A0B10), a forged dark iron frame band (#8A93B2 top edge, #6A7290, #3B4157, #191C27 bottom) with fine hammered grain, a thin black inset line, then a recessed inner face of hammered polished gold (#FFF0B0 top, #FECA57, #E3A52B, #B87B14 bottom, dark lip #9A6510), bright bevel highlight on the top edge of the face and a dark lip on its bottom edge, two small round polished gold rivets (#FFF6CF to #FECA57 to #8A5A0E, thin black ring) on each short end of the iron frame, one in the upper corner area and one in the lower corner area, nothing in the middle of the ends, inner face plain and empty with no runes, no icon, no engraving, no text. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Safe area for slicing: every ornament (chamfered corners, rivets, end caps) must fit inside 10 percent of the width from each side and 42 percent of the height from the top and from the bottom; the part between is plain. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### 3.2 Botões, painéis, fitas e HUD

#### `ui_btn_secondary`

- Uso: Botão secundário (MENU, Desistir, 1×): placa ferro de plate().
- Arquivo a devolver: `art-source/raw/ui/ui_btn_secondary.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 384×96 px · 9-slice: 40, 40, 40, 40
- Situação: **entregue**

```text
Generate one image with a wide landscape 16:9 canvas. one empty wide horizontal riveted iron plate button about 4 to 1 proportion, outer shape is a long rectangle with small 45 degree chamfered corners like a stretched octagon, thick black outline (#0A0B10), a forged dark iron frame band (#8A93B2 top edge, #6A7290, #3B4157, #191C27 bottom) with fine hammered grain, a thin black inset line, then a recessed inner face of dark forged iron slightly darker than the frame (#4A5168 top, #2B3040, #191C27 bottom), bright bevel highlight on the top edge of the face and a dark lip on its bottom edge, two small round polished gold rivets (#FFF6CF to #FECA57 to #8A5A0E, thin black ring) on each short end of the iron frame, one in the upper corner area and one in the lower corner area, nothing in the middle of the ends, inner face plain and empty with no runes, no icon, no engraving, no text. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Safe area for slicing: every ornament (chamfered corners, rivets, end caps) must fit inside 10 percent of the width from each side and 42 percent of the height from the top and from the bottom; the part between is plain. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_btn_action`

- Uso: Botão de ação ciano mini (RECOLHER): placa ciano de plate(), sem rebites.
- Arquivo a devolver: `art-source/raw/ui/ui_btn_action.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: magenta · tamanho final 256×128 px · 9-slice: 32, 32, 32, 32
- Situação: **entregue**

```text
Generate one image with a wide landscape 16:9 canvas. one empty wide horizontal riveted iron plate button about 2 to 1 proportion, outer shape is a long rectangle with small 45 degree chamfered corners like a stretched octagon, thick black outline (#0A0B10), a forged dark iron frame band (#8A93B2 top edge, #6A7290, #3B4157, #191C27 bottom) with fine hammered grain, a thin black inset line, then a recessed inner face of glossy cyan crystal-metal (#B8FFFF top, #00CEC9, #0984E3 bottom, deep teal lip #065A8C), bright bevel highlight on the top edge of the face and a dark lip on its bottom edge, no rivets, inner face plain and empty with no runes, no icon, no engraving, no text. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Safe area for slicing: every ornament (chamfered corners, rivets, end caps) must fit inside 12 percent of the width from each side and 25 percent of the height from the top and from the bottom; the part between is plain. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_btn_mini`

- Uso: Botão ouro mini (comprar talento): plate(..., { size: "mini" }), sem rebites. Chave nova: falta ligar em skin.ts/ui-skin.css.
- Arquivo a devolver: `art-source/raw/ui/ui_btn_mini.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 256×128 px · 9-slice: 32, 32, 32, 32
- Situação: **entregue**

```text
Generate one image with a wide landscape 16:9 canvas. one empty wide horizontal riveted iron plate button about 2 to 1 proportion, outer shape is a long rectangle with small 45 degree chamfered corners like a stretched octagon, thick black outline (#0A0B10), a forged dark iron frame band (#8A93B2 top edge, #6A7290, #3B4157, #191C27 bottom) with fine hammered grain, a thin black inset line, then a recessed inner face of hammered polished gold (#FFF0B0 top, #FECA57, #E3A52B, #B87B14 bottom, dark lip #9A6510), bright bevel highlight on the top edge of the face and a dark lip on its bottom edge, no rivets, inner face plain and empty with no runes, no icon, no engraving, no text. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Safe area for slicing: every ornament (chamfered corners, rivets, end caps) must fit inside 12 percent of the width from each side and 25 percent of the height from the top and from the bottom; the part between is plain. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_btn_round`

- Uso: Botão redondo de ícone da tela inicial (som, ajustes, Talentos). Chave nova.
- Arquivo a devolver: `art-source/raw/ui/ui_btn_round.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: **entregue**

```text
Generate one square 1:1 image. one empty round icon button seen from the front, domed forged dark iron (#4A5168 top, #2B3040, #191C27 bottom) with fine hammered grain, thick black outline (#0A0B10), a thin dim gold ring (#FECA57 at low brightness) just inside the rim, bevel highlight on the top and dark lip on the bottom, plain empty center with no icon, centered, filling about 90 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_btn_square`

- Uso: Botão quadrado de ícone (pausa, voltar): .rs-btn-icon. Chave nova (hoje usa ui_btn_secondary).
- Arquivo a devolver: `art-source/raw/ui/ui_btn_square.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: 40, 40, 40, 40
- Situação: **entregue**

```text
Generate one square 1:1 image. one empty square icon button with rounded corners, domed forged dark iron (#4A5168 top, #2B3040, #191C27 bottom) with fine hammered grain, thick black outline (#0A0B10), a thin dim gold line (#FECA57 at low brightness) just inside the rim following the rounded corners, bevel highlight on the top and dark lip on the bottom, plain empty center with no icon. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Safe area for slicing: every ornament (chamfered corners, rivets, end caps) must fit inside 31 percent of the width from each side and 31 percent of the height from the top and from the bottom; the part between is plain. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_panel`

- Uso: Painel de pedra com rebites (linha de talento, placa do fim de run).
- Arquivo a devolver: `art-source/raw/ui/ui_panel.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 256×256 px · 9-slice: 40, 40, 40, 40
- Situação: **entregue**

```text
Generate one square 1:1 image. one empty square UI panel plate, carved dark grey stone center (#2B3040 to #191C27) with subtle fine grain, thick forged dark iron frame (#3B4157, light edge #6A7290, dark outline #0A0B10), a thin gold inner line (#FECA57 at low brightness), one small round gold rivet stud in each of the four corners (#FFE7A3 to #B87B14), frame thickness about 8 percent of the width, slightly rounded outer corners. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_panel_dark`

- Uso: Fundo rebaixado (miolo do painel, placa ONDA, faixa de runas do HUD, atributos iniciais).
- Arquivo a devolver: `art-source/raw/ui/ui_panel_dark.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 192×192 px · 9-slice: 20, 20, 20, 20
- Situação: **entregue**

```text
Generate one square 1:1 image. one empty square recessed inset panel, very dark smooth stone center (#0C0E16) sunken below the surface with an inner shadow at the top edge, thin dark iron rim (#4A5168, outline #0A0B10), no rivets, no gold, frame thickness about 4 percent of the width, slightly rounded corners. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_ribbon`

- Uso: Fita de título (RUNAS, TALENTOS, CRIPTA CONQUISTADA, capítulo do mapa).
- Arquivo a devolver: `art-source/raw/ui/ui_ribbon.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 512×96 px · 9-slice: 0, 80, 0, 80
- Situação: **entregue**

```text
Generate one image with a wide landscape 16:9 canvas. one empty horizontal red title ribbon banner about 6 to 1 proportion, crimson cloth band (#B8283A top to #7A1424 bottom) with a thin gold stitched line along the top and bottom edges (#E6B450), both ends folded behind with darker swallow-tail cut tips (#8F1D2C to #5C0F1A), straight and level, perfectly horizontal, not curved, not waving. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Three-slice rules: the ornamented ends stay at the far left and far right, the middle band is a plain uniform horizontal stripe with no ornament so it can stretch horizontally. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_ribbon_dark`

- Uso: Fita escura da derrota (BARREIRA ROMPIDA). Chave nova.
- Arquivo a devolver: `art-source/raw/ui/ui_ribbon_dark.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 512×96 px · 9-slice: 0, 80, 0, 80
- Situação: **entregue**

```text
Generate one image with a wide landscape 16:9 canvas. one empty horizontal dark wine title ribbon banner about 6 to 1 proportion, very dark crimson cloth band (#4A1520 top to #2A0A12 bottom) with a thin dim gold stitched line along the top and bottom edges (#B8893A), both ends folded behind with darker swallow-tail cut tips (#3A0E18 to #1E060C), straight and level, perfectly horizontal, not curved, not waving. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Three-slice rules: the ornamented ends stay at the far left and far right, the middle band is a plain uniform horizontal stripe with no ornament so it can stretch horizontally. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_pill`

- Uso: Contador de ouro (moeda + número) no topo da tela inicial, Talentos e HUD. Chave nova.
- Arquivo a devolver: `art-source/raw/ui/ui_pill.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 192×64 px · 9-slice: 0, 32, 0, 32
- Situação: **entregue**

```text
Generate one image with a wide landscape 16:9 canvas. one empty horizontal capsule counter plate about 3 to 1 proportion with fully round semicircle ends, recessed dark stone face (#20242F to #14161F) with fine grain, thick black outline (#0A0B10), a thin dark iron highlight line along the top inner edge (#4A5168), plain empty face. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Three-slice rules: the ornamented ends stay at the far left and far right, the middle band is a plain uniform horizontal stripe with no ornament so it can stretch horizontally. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_hud_bar`

- Uso: Faixas de pedra do HUD em cima e embaixo da arena (.rs-band), largura da tela.
- Arquivo a devolver: `art-source/raw/ui/ui_hud_bar.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 512×128 px · 9-slice: 20, 0, 20, 0
- Situação: **entregue**

```text
Generate one image with a wide landscape 16:9 canvas. one empty long horizontal HUD band plate about 4 to 1 proportion, carved grey-blue stone surface (#2B3040 to #191C27) with fine noise grain, along the top edge and along the bottom edge a trim made of a thin black line, a dark iron line (#4A5168), a black line and a thin dim gold line (#FECA57 at half brightness), no rivets, square straight ends with no rounded corners. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Three-slice rules: the trims stay only along the very top and the very bottom edge, the left and right ends are cut straight with no frame, and everything between the trims is a plain uniform stone surface so it can stretch and repeat. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### 3.3 Mapa e Fim de run

#### `ui_map_bg`

- Uso: Fundo da tela inicial (mapa) e de Talentos; o caminho, a névoa e os nós ficam no código por cima. Chave nova.
- Arquivo a devolver: `art-source/raw/ui/ui_map_bg.png`
- Anexar no Gemini: `art-source/raw/tiles/floor_crypt.png`
- Fundo: nenhum · tamanho final 720×1280 px · 9-slice: não
- Situação: **entregue**

```text
Generate one image with a tall portrait 9:16 canvas. top-down view of a dark obsidian crypt floor seen from directly above, used as a chapter map background, cracked dark stone slabs and scattered rubble (#191C27 to #0C0E16 with blue-grey #2B3040 highlights), faint dark violet mist patches (#3E1F73 at low opacity), a few tiny broken pillars and bones only near the edges, slightly darker toward the edges, no road, no path, no buildings, no nodes, a quiet even middle so the map path and buttons can sit on top. dark fantasy 2D game background art for a portrait mobile game, stylized hand-painted illustration, matte, soft even top lighting, low contrast, fills the whole canvas edge to edge, no border, no frame, no outer glow, no bright spot, no text, no letters, no numbers, no UI, no characters. Use the attached image only as a style reference: match its stone rendering, palette, brush texture and level of detail, but paint the new background described above. Do not copy its layout.
```

#### `ui_map_node`

- Uso: Nó do capítulo liberado no mapa (em volta do medalhão do chefe) e aro do medalhão da vitória. Chave nova.
- Arquivo a devolver: `art-source/raw/ui/ui_map_node.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: magenta · tamanho final 256×256 px · 9-slice: não
- Situação: **entregue**

```text
Generate one square 1:1 image. one round chapter map node frame, thick forged dark iron ring (#3B4157 with light edge #6A7290, black outline #0A0B10) with a polished gold outer band (#FFF0B0 to #FECA57 to #B87B14), four tiny gold rivets at the top, bottom, left and right of the ring, the inside of the ring is completely empty: an open round window about 70 percent of the diameter filled with the background color, because a monster medallion is placed inside by code. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_map_node_locked`

- Uso: Nó de capítulo trancado no mapa; o cadeado e a silhueta cinza ficam no código por cima. Chave nova.
- Arquivo a devolver: `art-source/raw/ui/ui_map_node_locked.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 256×256 px · 9-slice: não
- Situação: **entregue**

```text
Generate one square 1:1 image. one round locked chapter map node, a dull dark iron ring (#3B4157 with light edge #4A5168, black outline #0A0B10) with no gold, the inside is a closed recessed dark stone disc (#2B3040 at the center to #0C0E16 at the edge) with an inner shadow at the top, plain and empty with no lock and no symbol, desaturated. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_defeat_shield`

- Uso: Escudo rachado no medalhão do Fim de run (derrota); aro carmesim e cacos caindo ficam no CSS. Chave nova.
- Arquivo a devolver: `art-source/raw/ui/ui_defeat_shield.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 256×256 px · 9-slice: não
- Situação: **entregue**

```text
Generate one square 1:1 image. one broken barrier shield, classic heater shield shape with a flat top and a point at the bottom, slightly taller than wide, cyan crystal-metal face (#88FFFF top, #00CEC9, #0984E3 bottom) with a thin dark iron rim (#3B4157) and a black outline (#0A0B10), split by one big jagged black crack from top to bottom with a few smaller branching cracks, two small chips missing from the right edge, no sparks, no light rays, centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### 3.4 Cartas e encaixes de runa

#### `ui_card_lightning`

- Uso: Carta de runa Elétrica no Draft (horizontal, ícone à esquerda, texto à direita).
- Arquivo a devolver: `art-source/raw/ui/ui_card_lightning.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: magenta · tamanho final 480×192 px · 9-slice: 40, 40, 40, 40
- Situação: **entregue**

```text
Generate one image with a wide landscape 16:9 canvas. one empty wide horizontal rune card about 5 to 2 proportion, outer frame of dark forged iron and carved grey-blue stone (#8A93B2 top edge, #3B4157, #262A38) with a thick black outline (#0A0B10) and rounded corners, a thin black line and a thin cyan (#00CEC9 to #0984E3) trim line framing a recessed dark stone face (#20242F to #14161F) with a soft inner shadow at the top, four small triangular corner caps in cyan (#00CEC9 to #0984E3) with a black outline, one on each corner over the frame, the electric synergy color appears only on the trim and the corner caps, face completely plain and empty because the icon socket and the text are placed by code. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Safe area for slicing: every ornament (chamfered corners, rivets, end caps) must fit inside 8 percent of the width from each side and 21 percent of the height from the top and from the bottom; the part between is plain. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_card_fire`

- Uso: Carta de runa Ígnea no Draft (horizontal, ícone à esquerda, texto à direita).
- Arquivo a devolver: `art-source/raw/ui/ui_card_fire.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 480×192 px · 9-slice: 40, 40, 40, 40
- Situação: **entregue**

```text
Generate one image with a wide landscape 16:9 canvas. one empty wide horizontal rune card about 5 to 2 proportion, outer frame of dark forged iron and carved grey-blue stone (#8A93B2 top edge, #3B4157, #262A38) with a thick black outline (#0A0B10) and rounded corners, a thin black line and a thin magma orange (#FF9F43 to #992D0C) trim line framing a recessed dark stone face (#20242F to #14161F) with a soft inner shadow at the top, four small triangular corner caps in magma orange (#FF9F43 to #992D0C) with a black outline, one on each corner over the frame, the fire synergy color appears only on the trim and the corner caps, face completely plain and empty because the icon socket and the text are placed by code. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Safe area for slicing: every ornament (chamfered corners, rivets, end caps) must fit inside 8 percent of the width from each side and 21 percent of the height from the top and from the bottom; the part between is plain. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_card_spectral`

- Uso: Carta de runa Espectral no Draft (horizontal, ícone à esquerda, texto à direita).
- Arquivo a devolver: `art-source/raw/ui/ui_card_spectral.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 480×192 px · 9-slice: 40, 40, 40, 40
- Situação: **entregue**

```text
Generate one image with a wide landscape 16:9 canvas. one empty wide horizontal rune card about 5 to 2 proportion, outer frame of dark forged iron and carved grey-blue stone (#8A93B2 top edge, #3B4157, #262A38) with a thick black outline (#0A0B10) and rounded corners, a thin black line and a thin violet (#9C6BFF to #3E1F73) trim line framing a recessed dark stone face (#20242F to #14161F) with a soft inner shadow at the top, four small triangular corner caps in violet (#9C6BFF to #3E1F73) with a black outline, one on each corner over the frame, the spectral synergy color appears only on the trim and the corner caps, face completely plain and empty because the icon socket and the text are placed by code. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Safe area for slicing: every ornament (chamfered corners, rivets, end caps) must fit inside 8 percent of the width from each side and 21 percent of the height from the top and from the bottom; the part between is plain. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_card_core`

- Uso: Carta de runa Núcleo no Draft (horizontal, ícone à esquerda, texto à direita).
- Arquivo a devolver: `art-source/raw/ui/ui_card_core.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 480×192 px · 9-slice: 40, 40, 40, 40
- Situação: **entregue**

```text
Generate one image with a wide landscape 16:9 canvas. one empty wide horizontal rune card about 5 to 2 proportion, outer frame of dark forged iron and carved grey-blue stone (#8A93B2 top edge, #3B4157, #262A38) with a thick black outline (#0A0B10) and rounded corners, a thin black line and a thin warm gold (#FECA57 to #B87B14) trim line framing a recessed dark stone face (#20242F to #14161F) with a soft inner shadow at the top, four small triangular corner caps in warm gold (#FECA57 to #B87B14) with a black outline, one on each corner over the frame, the core synergy color appears only on the trim and the corner caps, face completely plain and empty because the icon socket and the text are placed by code. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Safe area for slicing: every ornament (chamfered corners, rivets, end caps) must fit inside 8 percent of the width from each side and 21 percent of the height from the top and from the bottom; the part between is plain. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_gem_lightning`

- Uso: Encaixe redondo do ícone na carta Elétrica (.rs-draft-socket); o ícone da runa fica por cima.
- Arquivo a devolver: `art-source/raw/ui/ui_gem_lightning.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: magenta · tamanho final 128×128 px · 9-slice: não
- Situação: **entregue**

```text
Generate one square 1:1 image. one round gem socket seen straight from the front, a smooth polished cyan (#00CEC9 to #0984E3) crystal dome filling the center, lighter at the top and darker at the bottom, with one soft white highlight on the upper left, surrounded by a thin black ring (#0A0B10), a forged dark iron ring (#3B4157 with light edge #6A7290) and a thin black outer outline, no facets pattern, no symbol, centered, filling about 90 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_gem_fire`

- Uso: Encaixe redondo do ícone na carta Ígnea (.rs-draft-socket); o ícone da runa fica por cima.
- Arquivo a devolver: `art-source/raw/ui/ui_gem_fire.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: **entregue**

```text
Generate one square 1:1 image. one round gem socket seen straight from the front, a smooth polished magma orange (#FF9F43 to #992D0C) crystal dome filling the center, lighter at the top and darker at the bottom, with one soft white highlight on the upper left, surrounded by a thin black ring (#0A0B10), a forged dark iron ring (#3B4157 with light edge #6A7290) and a thin black outer outline, no facets pattern, no symbol, centered, filling about 90 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_gem_spectral`

- Uso: Encaixe redondo do ícone na carta Espectral (.rs-draft-socket); o ícone da runa fica por cima.
- Arquivo a devolver: `art-source/raw/ui/ui_gem_spectral.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: **entregue**

```text
Generate one square 1:1 image. one round gem socket seen straight from the front, a smooth polished violet (#9C6BFF to #3E1F73) crystal dome filling the center, lighter at the top and darker at the bottom, with one soft white highlight on the upper left, surrounded by a thin black ring (#0A0B10), a forged dark iron ring (#3B4157 with light edge #6A7290) and a thin black outer outline, no facets pattern, no symbol, centered, filling about 90 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_gem_core`

- Uso: Encaixe redondo do ícone na carta Núcleo (.rs-draft-socket); o ícone da runa fica por cima.
- Arquivo a devolver: `art-source/raw/ui/ui_gem_core.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: **entregue**

```text
Generate one square 1:1 image. one round gem socket seen straight from the front, a smooth polished warm gold (#FECA57 to #B87B14) crystal dome filling the center, lighter at the top and darker at the bottom, with one soft white highlight on the upper left, surrounded by a thin black ring (#0A0B10), a forged dark iron ring (#3B4157 with light edge #6A7290) and a thin black outer outline, no facets pattern, no symbol, centered, filling about 90 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_socket`

- Uso: Encaixe de runa da faixa do HUD e do ícone da linha de talento. Chave nova.
- Arquivo a devolver: `art-source/raw/ui/ui_socket.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 96×96 px · 9-slice: não
- Situação: **entregue**

```text
Generate one square 1:1 image. one empty round recessed socket seen from the front, dark stone hollow (#2B3040 at the center to #0C0E16 at the edge) with an inner shadow at the top, a thin black ring (#0A0B10) and a thin dark iron rim (#3B4157), plain and empty, centered, filling about 90 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### 3.5 Ícones

#### `ui_icon_coin`

- Uso: Moeda (contador de ouro, compra, fim de run); substitui o SVG.
- Arquivo a devolver: `art-source/raw/ui/ui_icon_coin.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: **entregue**

```text
Generate one square 1:1 image. one round gold coin seen straight from the front (#FFF3B8 highlight, #FECA57, #D89A22, #8A5A0C edge), embossed rim, plain face with a simple raised diamond in the middle, one single bold symbol readable at 24 pixels, no frame, no border, no background plate, centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_icon_heart`

- Uso: Vida da barreira no HUD.
- Arquivo a devolver: `art-source/raw/ui/ui_icon_heart.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: **entregue**

```text
Generate one square 1:1 image. one solid crimson heart (#FF5E57 to #8F1D2C) with a small top-left highlight and a thin dark outline, one single bold symbol readable at 24 pixels, no frame, no border, no background plate, centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_icon_pause`

- Uso: Pausa no HUD.
- Arquivo a devolver: `art-source/raw/ui/ui_icon_pause.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: **entregue**

```text
Generate one square 1:1 image. one pause symbol made of two thick vertical rounded bars of polished gold (#FFE08A to #B87B14) with a dark brown outline (#3A2606), one single bold symbol readable at 24 pixels, no frame, no border, no background plate, centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_icon_gear`

- Uso: Ajustes na tela inicial.
- Arquivo a devolver: `art-source/raw/ui/ui_icon_gear.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: **entregue**

```text
Generate one square 1:1 image. one settings gear cog with eight teeth and a round hole in the middle, forged iron (#6A7290 to #262A38) with gold edge highlights (#E9D8A6) and a dark outline, one single bold symbol readable at 24 pixels, no frame, no border, no background plate, centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_icon_sound`

- Uso: Som ligado.
- Arquivo a devolver: `art-source/raw/ui/ui_icon_sound.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: **entregue**

```text
Generate one square 1:1 image. one speaker symbol with three curved sound waves to its right, polished gold (#FFE08A to #B87B14) with a dark brown outline (#3A2606), one single bold symbol readable at 24 pixels, no frame, no border, no background plate, centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_icon_sound_off`

- Uso: Som desligado.
- Arquivo a devolver: `art-source/raw/ui/ui_icon_sound_off.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: **entregue**

```text
Generate one square 1:1 image. one speaker symbol with a bold crimson X (#FF5E57) to its right instead of sound waves, speaker in polished gold (#FFE08A to #B87B14) with a dark brown outline (#3A2606), one single bold symbol readable at 24 pixels, no frame, no border, no background plate, centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_icon_star`

- Uso: Talentos na tela inicial.
- Arquivo a devolver: `art-source/raw/ui/ui_icon_star.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: **entregue**

```text
Generate one square 1:1 image. one five-pointed star of polished gold (#FFF0B0 to #B87B14) with beveled facets and a dark brown outline (#3A2606), one single bold symbol readable at 24 pixels, no frame, no border, no background plate, centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_icon_lock`

- Uso: Cadeado do nó trancado no mapa. Chave nova.
- Arquivo a devolver: `art-source/raw/ui/ui_icon_lock.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: **entregue**

```text
Generate one square 1:1 image. one closed padlock with a round shackle and a keyhole, creamy pale gold (#FFE9B0 to #C9A75A) with a thin dark outline (#0A0B10), one single bold symbol readable at 24 pixels, no frame, no border, no background plate, centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_icon_back`

- Uso: Voltar (Talentos). Chave nova.
- Arquivo a devolver: `art-source/raw/ui/ui_icon_back.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: **entregue**

```text
Generate one square 1:1 image. one bold left-pointing arrow with a short shaft and a wide triangular head, creamy pale gold (#FFE9B0 to #C9A75A) with a thin dark outline (#0A0B10), one single bold symbol readable at 24 pixels, no frame, no border, no background plate, centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_icon_check`

- Uso: Selo da vitória e MÁX do talento. Chave nova.
- Arquivo a devolver: `art-source/raw/ui/ui_icon_check.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: **entregue**

```text
Generate one square 1:1 image. one bold check mark, thick rounded strokes of dark brown (#3A2606) with a thin pale gold edge (#FFF0B0), one single bold symbol readable at 24 pixels, no frame, no border, no background plate, centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

#### `ui_icon_recall`

- Uso: Ícone do botão RECOLHER. Chave nova.
- Arquivo a devolver: `art-source/raw/ui/ui_icon_recall.png`
- Anexar no Gemini: `art-source/anchors/ui_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: **entregue**

```text
Generate one square 1:1 image. one bold curved arrow turning back down toward the bottom, deep teal (#062838) with a thin light cyan edge (#B8FFFF), one single bold symbol readable at 24 pixels, no frame, no border, no background plate, centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### 3.6 Não usar

Peças que o estilo validado tornou desnecessárias: não gere. Ficam no manifesto só como registro, fora do pipeline.

- `ui_icon_sword`: Não usar: a UI validada não tem espada (fora do pipeline).

## 4. Ícones de itens (M8, decisões 64, 68 e 70)

Um ícone por item (`item_<id>`), o objeto sozinho na cor e no material da escola. O mesmo ícone serve para as 5 raridades: a raridade é a borda em CSS (decisão 70), então o desenho não tem moldura nem cor de raridade. Ordem: gere as 4 variações da âncora de item (4.1, com a âncora de ícone anexa), salve a escolhida em `art-source/anchors/item_anchor.png` e anexe-a nos outros 17 (4.2), na ordem da lista. Depois: `npm run assets:ingest -- <pasta>` e `npm run assets:all` gravam `public/assets/icons/item_<id>.webp` (128×128).

### 4.1 Âncora de item (gerar primeiro)

#### `item_staff_lightning`

- Uso: Cajado Tempestuoso (staff, lightning); mesmo ícone em todas as raridades.
- Arquivo a devolver: `art-source/raw/items/item_staff_lightning.png`
- Âncora escolhida vira: `art-source/anchors/item_anchor.png`
- Anexar no Gemini: `art-source/anchors/icon_anchor.png`
- Fundo: magenta · tamanho final 128×128 px
- Situação: pendente

**Variação A**

```text
Generate one square 1:1 image. a long wizard staff lying diagonally from the lower left to the upper right corner, dark forged iron shaft wrapped in worn leather, the head is three iron prongs gripping a cyan storm crystal crackling with tiny lightning sparks (#00CEC9 to #0984E3). RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

**Variação B**

```text
Generate one square 1:1 image. a long wizard staff lying diagonally from the lower left to the upper right corner, dark forged iron shaft wrapped in worn leather, the head is three iron prongs gripping a cyan storm crystal crackling with tiny lightning sparks (#00CEC9 to #0984E3). Variation: thicker and shorter staff, bigger crystal head, fewer small details. RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

**Variação C**

```text
Generate one square 1:1 image. a long wizard staff lying diagonally from the lower left to the upper right corner, dark forged iron shaft wrapped in worn leather, the head is three iron prongs gripping a cyan storm crystal crackling with tiny lightning sparks (#00CEC9 to #0984E3). Variation: ornate iron prongs and two thin runic rings on the shaft, more detailed head. RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

**Variação D**

```text
Generate one square 1:1 image. a long wizard staff lying diagonally from the lower left to the upper right corner, dark forged iron shaft wrapped in worn leather, the head is three iron prongs gripping a cyan storm crystal crackling with tiny lightning sparks (#00CEC9 to #0984E3). Variation: flat bold shapes, minimal detail, maximum readability at very small size. RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference: match its rendering, brush texture, rim construction, lighting direction, contrast and level of detail exactly, but draw the new subject described above. Do not copy its subject.
```

### 4.2 Lote dos itens

#### `item_staff_fire`

- Uso: Cajado de Brasa (staff, fire); mesmo ícone em todas as raridades.
- Arquivo a devolver: `art-source/raw/items/item_staff_fire.png`
- Anexar no Gemini: `art-source/anchors/item_anchor.png`
- Fundo: white · tamanho final 128×128 px
- Situação: pendente

```text
Generate one square 1:1 image. a long wizard staff lying diagonally from the lower left to the upper right corner, charred black wood shaft with iron bands, the head is a forge-claw holding a glowing orange ember stone split by molten magma cracks (#FF9F43 to #992D0C). RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, metal construction, lighting direction, contrast, level of detail and how much of the canvas the object fills exactly, but draw the new object described above. Do not copy its subject.
```

#### `item_staff_spectral`

- Uso: Cajado Espectral (staff, spectral); mesmo ícone em todas as raridades.
- Arquivo a devolver: `art-source/raw/items/item_staff_spectral.png`
- Anexar no Gemini: `art-source/anchors/item_anchor.png`
- Fundo: white · tamanho final 128×128 px
- Situação: pendente

```text
Generate one square 1:1 image. a long wizard staff lying diagonally from the lower left to the upper right corner, pale old bone and dark iron shaft, the head is a crescent hook holding a translucent violet ghost flame (#9C6BFF to #3E1F73). RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, metal construction, lighting direction, contrast, level of detail and how much of the canvas the object fills exactly, but draw the new object described above. Do not copy its subject.
```

#### `item_orb_lightning`

- Uso: Orbe de Faísca (orb, lightning); mesmo ícone em todas as raridades.
- Arquivo a devolver: `art-source/raw/items/item_orb_lightning.png`
- Anexar no Gemini: `art-source/anchors/item_anchor.png`
- Fundo: magenta · tamanho final 128×128 px
- Situação: pendente

```text
Generate one square 1:1 image. a round orb resting on a small three-claw dark iron stand, a clear glass sphere with small cyan sparks and one branching lightning bolt inside (#00CEC9 to #0984E3). RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference: match its rendering, brush texture, metal construction, lighting direction, contrast, level of detail and how much of the canvas the object fills exactly, but draw the new object described above. Do not copy its subject.
```

#### `item_orb_fire`

- Uso: Orbe de Magma (orb, fire); mesmo ícone em todas as raridades.
- Arquivo a devolver: `art-source/raw/items/item_orb_fire.png`
- Anexar no Gemini: `art-source/anchors/item_anchor.png`
- Fundo: white · tamanho final 128×128 px
- Situação: pendente

```text
Generate one square 1:1 image. a round orb resting on a small three-claw dark iron stand, a heavy sphere of black obsidian rock with glowing orange magma cracks (#FF9F43 to #992D0C). RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, metal construction, lighting direction, contrast, level of detail and how much of the canvas the object fills exactly, but draw the new object described above. Do not copy its subject.
```

#### `item_orb_spectral`

- Uso: Orbe do Além (orb, spectral); mesmo ícone em todas as raridades.
- Arquivo a devolver: `art-source/raw/items/item_orb_spectral.png`
- Anexar no Gemini: `art-source/anchors/item_anchor.png`
- Fundo: white · tamanho final 128×128 px
- Situação: pendente

```text
Generate one square 1:1 image. a round orb resting on a small three-claw dark iron stand, a translucent violet crystal sphere with a soft wisp of spirit mist swirling inside, small bone details on the stand (#9C6BFF to #3E1F73). RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, metal construction, lighting direction, contrast, level of detail and how much of the canvas the object fills exactly, but draw the new object described above. Do not copy its subject.
```

#### `item_ring_lightning`

- Uso: Anel Estático (ring, lightning); mesmo ícone em todas as raridades.
- Arquivo a devolver: `art-source/raw/items/item_ring_lightning.png`
- Anexar no Gemini: `art-source/anchors/item_anchor.png`
- Fundo: magenta · tamanho final 128×128 px
- Situação: pendente

```text
Generate one square 1:1 image. one thick ring seen at a slight three-quarter angle, the open hole in the middle clearly showing the plain background, dark iron band engraved with a zigzag rune, set with a faceted cyan crystal holding a tiny spark (#00CEC9 to #0984E3). RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference: match its rendering, brush texture, metal construction, lighting direction, contrast, level of detail and how much of the canvas the object fills exactly, but draw the new object described above. Do not copy its subject.
```

#### `item_ring_fire`

- Uso: Anel de Cinzas (ring, fire); mesmo ícone em todas as raridades.
- Arquivo a devolver: `art-source/raw/items/item_ring_fire.png`
- Anexar no Gemini: `art-source/anchors/item_anchor.png`
- Fundo: white · tamanho final 128×128 px · miolo vazado
- Situação: pendente

```text
Generate one square 1:1 image. one thick ring seen at a slight three-quarter angle, the open hole in the middle clearly showing the plain background, blackened iron band with ash-grey cracks, set with a glowing orange ember stone (#FF9F43 to #992D0C). RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, metal construction, lighting direction, contrast, level of detail and how much of the canvas the object fills exactly, but draw the new object described above. Do not copy its subject.
```

#### `item_ring_spectral`

- Uso: Anel Errante (ring, spectral); mesmo ícone em todas as raridades.
- Arquivo a devolver: `art-source/raw/items/item_ring_spectral.png`
- Anexar no Gemini: `art-source/anchors/item_anchor.png`
- Fundo: white · tamanho final 128×128 px · miolo vazado
- Situação: pendente

```text
Generate one square 1:1 image. one thick ring seen at a slight three-quarter angle, the open hole in the middle clearly showing the plain background, thin twisted dark silver band looping like a wandering path, set with a smooth violet moonstone (#9C6BFF to #3E1F73). RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, metal construction, lighting direction, contrast, level of detail and how much of the canvas the object fills exactly, but draw the new object described above. Do not copy its subject.
```

#### `item_amulet_lightning`

- Uso: Amuleto Para-raios (amulet, lightning); mesmo ícone em todas as raridades.
- Arquivo a devolver: `art-source/raw/items/item_amulet_lightning.png`
- Anexar no Gemini: `art-source/anchors/item_anchor.png`
- Fundo: magenta · tamanho final 128×128 px
- Situação: pendente

```text
Generate one square 1:1 image. one pendant amulet hanging from a short loop of dark iron chain, the inside of the chain loop clearly showing the plain background, the pendant is a small iron lightning rod with a cyan crystal at its tip, charged with tiny sparks (#00CEC9 to #0984E3). RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference: match its rendering, brush texture, metal construction, lighting direction, contrast, level of detail and how much of the canvas the object fills exactly, but draw the new object described above. Do not copy its subject.
```

#### `item_amulet_fire`

- Uso: Amuleto da Forja (amulet, fire); mesmo ícone em todas as raridades.
- Arquivo a devolver: `art-source/raw/items/item_amulet_fire.png`
- Anexar no Gemini: `art-source/anchors/item_anchor.png`
- Fundo: white · tamanho final 128×128 px · miolo vazado
- Situação: pendente

```text
Generate one square 1:1 image. one pendant amulet hanging from a short loop of dark iron chain, the inside of the chain loop clearly showing the plain background, the pendant is a round iron medallion embossed with a tiny anvil, a glowing orange magma core in its center (#FF9F43 to #992D0C). RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, metal construction, lighting direction, contrast, level of detail and how much of the canvas the object fills exactly, but draw the new object described above. Do not copy its subject.
```

#### `item_amulet_spectral`

- Uso: Amuleto do Véu (amulet, spectral); mesmo ícone em todas as raridades.
- Arquivo a devolver: `art-source/raw/items/item_amulet_spectral.png`
- Anexar no Gemini: `art-source/anchors/item_anchor.png`
- Fundo: white · tamanho final 128×128 px · miolo vazado
- Situação: pendente

```text
Generate one square 1:1 image. one pendant amulet hanging from a short loop of dark iron chain, the inside of the chain loop clearly showing the plain background, the pendant is a teardrop violet crystal partly wrapped by a thin translucent veil of cloth (#9C6BFF to #3E1F73). RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, metal construction, lighting direction, contrast, level of detail and how much of the canvas the object fills exactly, but draw the new object described above. Do not copy its subject.
```

#### `item_cloak_lightning`

- Uso: Capa de Tormenta (cloak, lightning); mesmo ícone em todas as raridades.
- Arquivo a devolver: `art-source/raw/items/item_cloak_lightning.png`
- Anexar no Gemini: `art-source/anchors/item_anchor.png`
- Fundo: magenta · tamanho final 128×128 px
- Situação: pendente

```text
Generate one square 1:1 image. one wizard cloak shown from the front, hanging open with a hood and a high collar, dark storm-grey cloth with cyan lightning patterns along the hem and a dark iron clasp (#00CEC9 to #0984E3). RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference: match its rendering, brush texture, metal construction, lighting direction, contrast, level of detail and how much of the canvas the object fills exactly, but draw the new object described above. Do not copy its subject.
```

#### `item_cloak_fire`

- Uso: Capa Chamuscada (cloak, fire); mesmo ícone em todas as raridades.
- Arquivo a devolver: `art-source/raw/items/item_cloak_fire.png`
- Anexar no Gemini: `art-source/anchors/item_anchor.png`
- Fundo: white · tamanho final 128×128 px
- Situação: pendente

```text
Generate one square 1:1 image. one wizard cloak shown from the front, hanging open with a hood and a high collar, dark charcoal cloth with scorched, burnt and torn edges, glowing orange embers along the hem, a dark iron clasp (#FF9F43 to #992D0C). RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, metal construction, lighting direction, contrast, level of detail and how much of the canvas the object fills exactly, but draw the new object described above. Do not copy its subject.
```

#### `item_cloak_spectral`

- Uso: Capa da Névoa (cloak, spectral); mesmo ícone em todas as raridades.
- Arquivo a devolver: `art-source/raw/items/item_cloak_spectral.png`
- Anexar no Gemini: `art-source/anchors/item_anchor.png`
- Fundo: white · tamanho final 128×128 px
- Situação: pendente

```text
Generate one square 1:1 image. one wizard cloak shown from the front, hanging open with a hood and a high collar, deep violet cloth that fades into soft translucent mist at the hem, a dark silver clasp (#9C6BFF to #3E1F73). RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, metal construction, lighting direction, contrast, level of detail and how much of the canvas the object fills exactly, but draw the new object described above. Do not copy its subject.
```

#### `item_boots_lightning`

- Uso: Botas do Relâmpago (boots, lightning); mesmo ícone em todas as raridades.
- Arquivo a devolver: `art-source/raw/items/item_boots_lightning.png`
- Anexar no Gemini: `art-source/anchors/item_anchor.png`
- Fundo: magenta · tamanho final 128×128 px
- Situação: pendente

```text
Generate one square 1:1 image. one pair of boots seen from the side, the right boot slightly in front of the left, dark leather and iron boots with small iron wings at the heels and cyan lightning runes on the shins (#00CEC9 to #0984E3). RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference: match its rendering, brush texture, metal construction, lighting direction, contrast, level of detail and how much of the canvas the object fills exactly, but draw the new object described above. Do not copy its subject.
```

#### `item_boots_fire`

- Uso: Botas de Lava (boots, fire); mesmo ícone em todas as raridades.
- Arquivo a devolver: `art-source/raw/items/item_boots_fire.png`
- Anexar no Gemini: `art-source/anchors/item_anchor.png`
- Fundo: white · tamanho final 128×128 px
- Situação: pendente

```text
Generate one square 1:1 image. one pair of boots seen from the side, the right boot slightly in front of the left, heavy dark iron sabatons whose soles and toe plates glow with orange molten lava cracks (#FF9F43 to #992D0C). RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, metal construction, lighting direction, contrast, level of detail and how much of the canvas the object fills exactly, but draw the new object described above. Do not copy its subject.
```

#### `item_boots_spectral`

- Uso: Botas Silentes (boots, spectral); mesmo ícone em todas as raridades.
- Arquivo a devolver: `art-source/raw/items/item_boots_spectral.png`
- Anexar no Gemini: `art-source/anchors/item_anchor.png`
- Fundo: white · tamanho final 128×128 px
- Situação: pendente

```text
Generate one square 1:1 image. one pair of boots seen from the side, the right boot slightly in front of the left, soft dark leather boots wrapped in violet cloth bands, a faint violet mist at the soles (#9C6BFF to #3E1F73). RPG equipment item icon, stylized hand-painted dark fantasy 2D game icon, one single object shown whole, high contrast, crisp readable silhouette at 40 pixels, forged dark iron details, the glowing accent only in the colors given, no frame, no border, no rarity color, no background plate, no outer glow, no light bleeding outside the object, no cast shadow, centered, filling about 85 percent of the canvas, no text, no letters, no numbers. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference: match its rendering, brush texture, metal construction, lighting direction, contrast, level of detail and how much of the canvas the object fills exactly, but draw the new object described above. Do not copy its subject.
```

### 4.3 Moldura de raridade

Não precisa de imagem: a célula do item já tem aro em CSS (`box-shadow` com `--rs-rarity`, cores da decisão 70) sobre o fundo escuro. Uma peça de ferro tingida por CSS exigiria máscara ou filtro e brigaria com esse aro; nenhum prompt aqui.
