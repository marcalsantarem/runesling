import { defineConfig } from 'vite';
import { VitePWA, type ManifestOptions } from 'vite-plugin-pwa';

/** Web App Manifest (decisão 7). Ícones provisórios; os definitivos virão do AG08. */
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

export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1600,
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script', // registerSW.js injetado só no build; main.ts intocado
      manifest: pwaManifest,
      manifestFilename: 'manifest.webmanifest',
      filename: 'sw.js',
      devOptions: { enabled: false }, // sem SW no `npm run dev`
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,webp,svg,json,mp3,ogg,m4a,woff2,webmanifest}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
      },
    }),
  ],
});
