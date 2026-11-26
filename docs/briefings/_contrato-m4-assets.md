# Contrato de assets do M4 (AG00) — citado pelos BRF-023 a BRF-026
- **Chaves (frame names):** inimigos = `spriteKey` de `src/data/enemies.json` (`enemy_goblin` … `miniboss_iron`, `boss_obsidian`); obstáculos `obstacle_bumper_rune`, `obstacle_pillar_obsidian`, `obstacle_ring_multiplier`; ícones = `iconKey` de `src/data/perks.json` e `src/data/talents.json` (`icon_*`, inclui `icon_gold_greed`); cenário `floor_crypt`, `wall_trim_crypt`; app `app_icon`.
- **Atlas `enemies`** (`public/assets/atlases/enemies.webp` + `.json`, Phaser JSON Hash): inimigos, chefes e obstáculos. **Atlas `icons`** (`public/assets/atlases/icons.webp` + `.json`): todos os `icon_*`.
- **Ícones avulsos para a UI HTML:** `public/assets/icons/<iconKey>.webp` (128×128).
- **Cenário:** `public/assets/tiles/floor_crypt.webp` (512, tileable) e `public/assets/tiles/wall_trim_crypt.webp`.
- **Ícone do app:** `art-source/app/app_icon.png` (1024, sem transparência, fundo `#0D1020`). É só fonte para `icons:pwa`; **não** vai para `public/` nem para o build (T-042).
- **Tamanhos (GDD §8.6):** medalhões 256, chefes 384, obstáculos 192, ícones 128, chão 512. Sprite centrado no quadro; o centro visual = centro da hitbox circular.
- **Carregamento no Phaser (AG07, T-029):** texturas `'enemies'`, `'icons'` (atlas) e `'floor_crypt'`, `'wall_trim_crypt'` (imagens). Quem desenha usa a textura se existir e cai no desenho procedural se não existir.
- **Originais:** o dono envia as imagens; elas entram em `art-source/raw/<categoria>/<chave>.png`. Versionar ou não os originais é a proposta 33 (ainda não decidida): **não altere o `.gitignore`**.
