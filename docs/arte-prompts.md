# RuneSling — prompts de arte (Gemini)

> Gerado por `node scripts/prompts-md.mjs` a partir de `scripts/assets-manifest.json`. Não edite à mão.

Como usar: cole o bloco de código inteiro no Gemini, gere, baixe em PNG e devolva com o nome indicado. Guia de estilo: `docs/arte.md`.

Total: 2 âncoras (8 variações) + 29 itens do lote + 23 peças de UI = 54 chaves.

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

## 3. Peças de UI (direção A, anexar a âncora indicada)

Guia: `docs/ui-guia.md`. Peça isolada, reta, frontal, sem texto. O 9-slice é `[topo, direita, baixo, esquerda]` em px no tamanho final; "não" = peça inteira (gema, ícone).

### `ui_panel`

- Arquivo a devolver: `art-source/raw/ui/ui_panel.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 256×256 px · 9-slice: 40, 40, 40, 40
- Situação: pendente

```text
Generate one square 1:1 image. one empty square UI panel plate, carved dark grey stone center (#2B3040 to #191C27) with subtle fine grain, thick forged dark iron frame (#3B4157, light edge #6A7290, dark outline #0A0B10), a thin gold inner line (#FECA57 at low brightness), one small round gold rivet stud in each of the four corners (#FFE7A3 to #B87B14), frame thickness about 8 percent of the width, slightly rounded outer corners. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_panel_dark`

- Arquivo a devolver: `art-source/raw/ui/ui_panel_dark.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 192×192 px · 9-slice: 20, 20, 20, 20
- Situação: pendente

```text
Generate one square 1:1 image. one empty square recessed inset panel, very dark smooth stone center (#0C0E16) sunken below the surface with an inner shadow at the top edge, thin dark iron rim (#4A5168, outline #0A0B10), no rivets, no gold, frame thickness about 4 percent of the width, slightly rounded corners. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_btn_primary`

- Arquivo a devolver: `art-source/raw/ui/ui_btn_primary.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 384×96 px · 9-slice: 32, 40, 36, 40
- Situação: pendente

```text
Generate one image with a wide landscape 16:9 canvas. one empty wide horizontal game button about 4 to 1 proportion, thick embossed polished gold body (#FFF0B0 top highlight, #FECA57, #E3A52B, #B87B14 bottom), dark brown outline (#3A2606), bright bevel highlight along the top edge and darker lip along the bottom edge giving a raised pressed-in-relief look, thin outer iron ring (#6A7290), rounded corners, plain smooth face with no icon. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_btn_secondary`

- Arquivo a devolver: `art-source/raw/ui/ui_btn_secondary.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 384×96 px · 9-slice: 30, 36, 34, 36
- Situação: pendente

```text
Generate one image with a wide landscape 16:9 canvas. one empty wide horizontal game button about 4 to 1 proportion, embossed dark forged iron body (#4A5168 top to #262A38 bottom), black outline (#0A0B10), thin lighter iron inner rim (#6A7290), soft bevel highlight on the top edge and dark lip on the bottom edge, rounded corners, plain smooth face with no icon. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_btn_action`

- Arquivo a devolver: `art-source/raw/ui/ui_btn_action.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: magenta · tamanho final 288×96 px · 9-slice: 30, 34, 34, 34
- Situação: pendente

```text
Generate one image with a wide landscape 16:9 canvas. one empty wide horizontal game button about 3 to 1 proportion, embossed glossy cyan crystal-metal body (#88FFFF top highlight, #00CEC9, #0984E3 bottom), deep teal outline (#062838), bright bevel highlight on the top edge and darker lip on the bottom edge, rounded corners, plain smooth face with no icon. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_ribbon`

- Arquivo a devolver: `art-source/raw/ui/ui_ribbon.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 512×96 px · 9-slice: 0, 80, 0, 80
- Situação: pendente

```text
Generate one image with a wide landscape 16:9 canvas. one empty horizontal red title ribbon banner about 6 to 1 proportion, crimson cloth band (#B8283A top to #7A1424 bottom) with a thin gold stitched line along the top and bottom edges (#E6B450), both ends folded behind with darker swallow-tail cut tips (#8F1D2C to #5C0F1A), straight and level, perfectly horizontal, not curved, not waving. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Three-slice rules: the ornamented ends stay at the far left and far right, the middle band is a plain uniform horizontal stripe with no ornament so it can stretch horizontally. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_card_lightning`

- Arquivo a devolver: `art-source/raw/ui/ui_card_lightning.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: magenta · tamanho final 240×336 px · 9-slice: 44, 36, 44, 36
- Situação: pendente

```text
Generate one image with a tall portrait 3:4 canvas. one empty vertical rune card frame about 2 to 3 proportion (taller than wide), dark carved stone card face (#20242F to #14161F), thick forged dark iron frame (#3B4157, outline #0A0B10) with an inner trim line in cyan (#00CEC9 to #0984E3), small ornamented corner caps tinted cyan (#00CEC9 to #0984E3), a plain empty top center area where a gem will be placed by code, slightly rounded corners, the electric synergy color appears only on the trim and corners. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_card_fire`

- Arquivo a devolver: `art-source/raw/ui/ui_card_fire.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 240×336 px · 9-slice: 44, 36, 44, 36
- Situação: pendente

```text
Generate one image with a tall portrait 3:4 canvas. one empty vertical rune card frame about 2 to 3 proportion (taller than wide), dark carved stone card face (#20242F to #14161F), thick forged dark iron frame (#3B4157, outline #0A0B10) with an inner trim line in magma orange (#FF9F43 to #992D0C), small ornamented corner caps tinted magma orange (#FF9F43 to #992D0C), a plain empty top center area where a gem will be placed by code, slightly rounded corners, the fire synergy color appears only on the trim and corners. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_card_spectral`

- Arquivo a devolver: `art-source/raw/ui/ui_card_spectral.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 240×336 px · 9-slice: 44, 36, 44, 36
- Situação: pendente

```text
Generate one image with a tall portrait 3:4 canvas. one empty vertical rune card frame about 2 to 3 proportion (taller than wide), dark carved stone card face (#20242F to #14161F), thick forged dark iron frame (#3B4157, outline #0A0B10) with an inner trim line in violet (#9C6BFF to #3E1F73), small ornamented corner caps tinted violet (#9C6BFF to #3E1F73), a plain empty top center area where a gem will be placed by code, slightly rounded corners, the spectral synergy color appears only on the trim and corners. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_card_core`

- Arquivo a devolver: `art-source/raw/ui/ui_card_core.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 240×336 px · 9-slice: 44, 36, 44, 36
- Situação: pendente

```text
Generate one image with a tall portrait 3:4 canvas. one empty vertical rune card frame about 2 to 3 proportion (taller than wide), dark carved stone card face (#20242F to #14161F), thick forged dark iron frame (#3B4157, outline #0A0B10) with an inner trim line in warm gold and iron (#FECA57 to #B87B14, iron #6A7290), small ornamented corner caps tinted warm gold and iron (#FECA57 to #B87B14, iron #6A7290), a plain empty top center area where a gem will be placed by code, slightly rounded corners, the core synergy color appears only on the trim and corners. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_hud_bar`

- Arquivo a devolver: `art-source/raw/ui/ui_hud_bar.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 480×96 px · 9-slice: 28, 32, 28, 32
- Situação: pendente

```text
Generate one image with a wide landscape 16:9 canvas. one empty long horizontal HUD bar plate about 5 to 1 proportion, carved dark grey stone center (#2B3040 to #191C27), forged dark iron frame (#3B4157, light edge #6A7290, outline #0A0B10), thin dim gold inner line (#FECA57), one small gold rivet in each corner, slightly rounded corners. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Nine-slice rules: keep the four corners as the only ornamented parts, make the straight edges between the corners a plain uniform border with no ornament, no rivet and no gem in their middle so they can stretch, and make the center a smooth flat even surface with no pattern focal point so it can stretch or repeat. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_gem_lightning`

- Arquivo a devolver: `art-source/raw/ui/ui_gem_lightning.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: magenta · tamanho final 96×96 px · 9-slice: não
- Situação: pendente

```text
Generate one square 1:1 image. one single faceted gemstone cut as a diamond shape (a square rotated 45 degrees, pointing up, down, left and right), cyan (#00CEC9 to #0984E3) crystal with a small white highlight on the upper left facet, thin black outline (#0A0B10) and a thin gold setting ring (#E0A42A), centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure magenta color (#FF00FF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Do not use magenta anywhere on the subject. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_gem_fire`

- Arquivo a devolver: `art-source/raw/ui/ui_gem_fire.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 96×96 px · 9-slice: não
- Situação: pendente

```text
Generate one square 1:1 image. one single faceted gemstone cut as a diamond shape (a square rotated 45 degrees, pointing up, down, left and right), magma orange (#FF9F43 to #992D0C) crystal with a small white highlight on the upper left facet, thin black outline (#0A0B10) and a thin gold setting ring (#E0A42A), centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_gem_spectral`

- Arquivo a devolver: `art-source/raw/ui/ui_gem_spectral.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 96×96 px · 9-slice: não
- Situação: pendente

```text
Generate one square 1:1 image. one single faceted gemstone cut as a diamond shape (a square rotated 45 degrees, pointing up, down, left and right), violet (#9C6BFF to #3E1F73) crystal with a small white highlight on the upper left facet, thin black outline (#0A0B10) and a thin gold setting ring (#E0A42A), centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_gem_core`

- Arquivo a devolver: `art-source/raw/ui/ui_gem_core.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 96×96 px · 9-slice: não
- Situação: pendente

```text
Generate one square 1:1 image. one single faceted gemstone cut as a diamond shape (a square rotated 45 degrees, pointing up, down, left and right), warm gold and iron (#FECA57 to #B87B14, iron #6A7290) crystal with a small white highlight on the upper left facet, thin black outline (#0A0B10) and a thin gold setting ring (#E0A42A), centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_icon_coin`

- Arquivo a devolver: `art-source/raw/ui/ui_icon_coin.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: pendente

```text
Generate one square 1:1 image. one round gold coin seen straight from the front (#FFF3B8 highlight, #FECA57, #D89A22, #8A5A0C edge), embossed rim, plain face with a simple raised diamond in the middle, one single bold symbol readable at 24 pixels, no frame, no border, no background plate, centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_icon_heart`

- Arquivo a devolver: `art-source/raw/ui/ui_icon_heart.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: pendente

```text
Generate one square 1:1 image. one solid crimson heart (#FF5E57 to #8F1D2C) with a small top-left highlight and a thin dark outline, one single bold symbol readable at 24 pixels, no frame, no border, no background plate, centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_icon_pause`

- Arquivo a devolver: `art-source/raw/ui/ui_icon_pause.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: pendente

```text
Generate one square 1:1 image. one pause symbol made of two thick vertical rounded bars of polished gold (#FFE08A to #B87B14) with a dark brown outline (#3A2606), one single bold symbol readable at 24 pixels, no frame, no border, no background plate, centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_icon_gear`

- Arquivo a devolver: `art-source/raw/ui/ui_icon_gear.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: pendente

```text
Generate one square 1:1 image. one settings gear cog with eight teeth and a round hole in the middle, forged iron (#6A7290 to #262A38) with gold edge highlights (#E9D8A6) and a dark outline, one single bold symbol readable at 24 pixels, no frame, no border, no background plate, centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_icon_sound`

- Arquivo a devolver: `art-source/raw/ui/ui_icon_sound.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: pendente

```text
Generate one square 1:1 image. one speaker symbol with three curved sound waves to its right, polished gold (#FFE08A to #B87B14) with a dark brown outline (#3A2606), one single bold symbol readable at 24 pixels, no frame, no border, no background plate, centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_icon_sound_off`

- Arquivo a devolver: `art-source/raw/ui/ui_icon_sound_off.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: pendente

```text
Generate one square 1:1 image. one speaker symbol with a bold crimson X (#FF5E57) to its right instead of sound waves, speaker in polished gold (#FFE08A to #B87B14) with a dark brown outline (#3A2606), one single bold symbol readable at 24 pixels, no frame, no border, no background plate, centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_icon_star`

- Arquivo a devolver: `art-source/raw/ui/ui_icon_star.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: pendente

```text
Generate one square 1:1 image. one five-pointed star of polished gold (#FFF0B0 to #B87B14) with beveled facets and a dark brown outline (#3A2606), one single bold symbol readable at 24 pixels, no frame, no border, no background plate, centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```

### `ui_icon_sword`

- Arquivo a devolver: `art-source/raw/ui/ui_icon_sword.png`
- Anexar no Gemini: `art-source/anchors/medallion_anchor.png`
- Fundo: white · tamanho final 128×128 px · 9-slice: não
- Situação: pendente

```text
Generate one square 1:1 image. one straight sword pointing up diagonally to the upper right, steel blade (#E8ECFF to #6A7290), gold crossguard and pommel (#FECA57 to #B87B14), dark outline, one single bold symbol readable at 24 pixels, no frame, no border, no background plate, centered, filling about 80 percent of the canvas. isolated flat game UI element for a dark fantasy mobile game, ornate fantasy style with forged dark iron, carved grey stone and polished gold trim, stylized hand-painted 2D illustration, perfectly straight and axis-aligned, flat front orthographic view, no perspective, no tilt, no rotation, symmetric, crisp clean edges, soft top lighting baked inside the shape, no outer glow, no light bleeding outside the shape, no drop shadow, no cast shadow, no text, no letters, no numbers, no symbols written on it, no characters, no scene. Background: one solid flat pure white color (#FFFFFF) filling the whole canvas, no gradient, no shadow, no floor, no vignette, no texture. Use the attached image only as a style reference for materials: match its forged iron and stone rendering, brush texture, lighting direction, contrast and level of detail, but draw the new UI element described above. Do not copy its subject, do not make it round unless asked.
```
