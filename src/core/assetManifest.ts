/**
 * Assets opcionais do M4 (contrato `_contrato-m4-assets.md`, T-029).
 * O Vite grava em `__RS_ASSETS__` a lista dos arquivos que existem em `public/assets/`
 * (caminhos relativos a essa pasta); a Boot só carrega o que existe, sem 404 no console.
 */
declare const __RS_ASSETS__: readonly string[] | undefined;

export interface AtlasAsset {
  kind: 'atlas';
  key: string;
  texture: string;
  data: string;
}

export interface ImageAsset {
  kind: 'image';
  key: string;
  texture: string;
}

export type OptionalAsset = AtlasAsset | ImageAsset;

/** Pasta pública dos assets (relativa a `base: './'`). */
export const ASSET_BASE = 'assets/';

export const OPTIONAL_ASSETS: readonly OptionalAsset[] = [
  { kind: 'atlas', key: 'enemies', texture: 'atlases/enemies.webp', data: 'atlases/enemies.json' },
  { kind: 'atlas', key: 'icons', texture: 'atlases/icons.webp', data: 'atlases/icons.json' },
  { kind: 'image', key: 'floor_crypt', texture: 'tiles/floor_crypt.webp' },
  { kind: 'image', key: 'wall_trim_crypt', texture: 'tiles/wall_trim_crypt.webp' },
];

/** Arquivos presentes em `public/assets/` no momento do build/dev (vazio fora do Vite). */
export const AVAILABLE_ASSETS: readonly string[] =
  typeof __RS_ASSETS__ !== 'undefined' ? __RS_ASSETS__ : [];

/** Assets cujos arquivos (textura e, no atlas, o JSON) existem todos. */
export function planAssetLoads(
  available: readonly string[] = AVAILABLE_ASSETS,
  catalog: readonly OptionalAsset[] = OPTIONAL_ASSETS,
): OptionalAsset[] {
  const has = new Set(available);
  return catalog.filter((a) => has.has(a.texture) && (a.kind === 'image' || has.has(a.data)));
}

/** Subconjunto do LoaderPlugin usado pela Boot (facilita teste sem Phaser). */
export interface AssetLoader {
  atlas(key: string, textureURL: string, atlasURL: string): unknown;
  image(key: string, url: string): unknown;
}

/** Enfileira no loader só os assets existentes. Retorna as chaves enfileiradas. */
export function queueOptionalAssets(
  loader: AssetLoader,
  available: readonly string[] = AVAILABLE_ASSETS,
): string[] {
  const plan = planAssetLoads(available);
  for (const a of plan) {
    if (a.kind === 'atlas') loader.atlas(a.key, ASSET_BASE + a.texture, ASSET_BASE + a.data);
    else loader.image(a.key, ASSET_BASE + a.texture);
  }
  return plan.map((a) => a.key);
}
