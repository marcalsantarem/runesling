import { existsSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { defineConfig } from 'vite';
import { VitePWA, type ManifestOptions } from 'vite-plugin-pwa';

/** Web App Manifest (decisão 7). Ícones gerados de `public/assets/app/app_icon.png` por `npm run icons:pwa` (provisórios sem ele). */
export const pwaManifest: Partial<ManifestOptions> = {
  name: 'RuneSling',
  short_name: 'RuneSling',
  description: 'Roguelite de estilingue com uma mão.',
  lang: 'pt-BR',
  start_url: './',
  scope: './',
  display: 'fullscreen',
  display_override: ['fullscreen', 'standalone'],
  orientation: 'portrait',
  theme_color: '#0D1020',
  background_color: '#0D1020',
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};

/** Arquivos em `public/assets/` (relativos, com `/`); vira `__RS_ASSETS__` para a Boot (T-029). */
export function listPublicAssets(dir = join(import.meta.dirname, 'public/assets')): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const walk = (d: string): void => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (!e.name.startsWith('.')) out.push(relative(dir, p).split('\\').join('/'));
    }
  };
  walk(dir);
  return out.sort();
}

export default defineConfig({
  base: './',
  define: {
    __RS_ASSETS__: JSON.stringify(listPublicAssets()),
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1600,
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // registro em main.ts via virtual:pwa-register (T-034)
      manifest: pwaManifest,
      manifestFilename: 'manifest.webmanifest',
      filename: 'sw.js',
      devOptions: { enabled: false }, // sem SW no `npm run dev`
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,webp,svg,json,mp3,ogg,m4a,woff2,webmanifest}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
      },
    }),
  ],
});
