import { describe, expect, it } from 'vitest';
import { pwaManifest } from '../../vite.config';

const publicIcons = Object.keys(import.meta.glob('../../public/icons/*.png'));

describe('PWA manifest', () => {
  it('tem nome, exibição e orientação do jogo', () => {
    expect(pwaManifest.name).toBe('RuneSling');
    expect(pwaManifest.display).toBe('fullscreen');
    expect(pwaManifest.display_override).toEqual(['fullscreen', 'standalone']);
    expect(pwaManifest.orientation).toBe('portrait');
  });

  it('usa as cores Obsidian e URLs relativas', () => {
    expect(pwaManifest.theme_color).toBe('#0D1020');
    expect(pwaManifest.background_color).toBe('#0D1020');
    expect(pwaManifest.start_url).toBe('./');
    expect(pwaManifest.scope).toBe('./');
  });

  it('declara ícones 192, 512 e maskable 512 existentes em public/', () => {
    const icons = pwaManifest.icons ?? [];
    const key = (i: (typeof icons)[number]) => `${i.sizes}:${i.purpose ?? 'any'}`;
    expect(icons.map(key).sort()).toEqual(['192x192:any', '512x512:any', '512x512:maskable']);
    for (const icon of icons) {
      expect(publicIcons).toContain(`../../public/${icon.src}`);
    }
  });
});
