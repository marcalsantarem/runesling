import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  AVAILABLE_ASSETS,
  OPTIONAL_ASSETS,
  planAssetLoads,
  queueOptionalAssets,
} from '../../src/core/assetManifest';
import { listPublicAssets } from '../../vite.config';

const ALL = [
  'atlases/enemies.webp',
  'atlases/enemies.json',
  'atlases/icons.webp',
  'atlases/icons.json',
  'tiles/floor_crypt.webp',
  'tiles/wall_trim_crypt.webp',
];

function fakeLoader() {
  return { atlas: vi.fn(), image: vi.fn() };
}

describe('carregamento condicional de assets (T-029)', () => {
  it('cataloga as texturas do contrato do M4', () => {
    expect(OPTIONAL_ASSETS.map((a) => a.key)).toEqual(['enemies', 'icons', 'floor_crypt', 'wall_trim_crypt']);
  });

  it('sem nenhum arquivo, não enfileira nada', () => {
    const loader = fakeLoader();
    expect(queueOptionalAssets(loader, [])).toEqual([]);
    expect(loader.atlas).not.toHaveBeenCalled();
    expect(loader.image).not.toHaveBeenCalled();
  });

  it('fora do Vite a lista disponível é vazia', () => {
    expect(AVAILABLE_ASSETS).toEqual([]);
  });

  it('com tudo presente, enfileira atlases e imagens com caminho em assets/', () => {
    const loader = fakeLoader();
    expect(queueOptionalAssets(loader, ALL)).toEqual(['enemies', 'icons', 'floor_crypt', 'wall_trim_crypt']);
    expect(loader.atlas).toHaveBeenCalledWith('enemies', 'assets/atlases/enemies.webp', 'assets/atlases/enemies.json');
    expect(loader.atlas).toHaveBeenCalledWith('icons', 'assets/atlases/icons.webp', 'assets/atlases/icons.json');
    expect(loader.image).toHaveBeenCalledWith('floor_crypt', 'assets/tiles/floor_crypt.webp');
    expect(loader.image).toHaveBeenCalledWith('wall_trim_crypt', 'assets/tiles/wall_trim_crypt.webp');
  });

  it('atlas sem o JSON (ou sem a imagem) não é carregado', () => {
    expect(planAssetLoads(['atlases/enemies.webp', 'atlases/icons.json']).map((a) => a.key)).toEqual([]);
    expect(planAssetLoads(['atlases/icons.webp', 'atlases/icons.json', 'tiles/floor_crypt.webp']).map((a) => a.key))
      .toEqual(['icons', 'floor_crypt']);
  });

  it('listPublicAssets lista arquivos recursivamente, ignora ocultos e pasta ausente', () => {
    const dir = mkdtempSync(join(tmpdir(), 'rs-assets-'));
    mkdirSync(join(dir, 'atlases'));
    writeFileSync(join(dir, 'atlases/.gitkeep'), '');
    writeFileSync(join(dir, 'atlases/enemies.webp'), '');
    writeFileSync(join(dir, 'atlases/enemies.json'), '{}');
    expect(listPublicAssets(dir)).toEqual(['atlases/enemies.json', 'atlases/enemies.webp']);
    expect(listPublicAssets(join(dir, 'nada'))).toEqual([]);
  });
});
