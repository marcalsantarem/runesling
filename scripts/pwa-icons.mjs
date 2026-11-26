// Gera os ícones do PWA a partir de public/assets/app/app_icon.png (T-029).
// Sem o arquivo, mantém os provisórios em public/icons/ e sai sem erro.
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = process.argv[2] ?? join(root, 'public/assets/app/app_icon.png');
const out = process.argv[3] ?? join(root, 'public/icons');
const BG = '#0D1020';

if (!existsSync(src)) {
  console.log(`[icons:pwa] ${src} não existe; mantendo os ícones provisórios.`);
  process.exit(0);
}
mkdirSync(out, { recursive: true });

const plain = (size, name) =>
  sharp(src).resize(size, size, { fit: 'cover' }).flatten({ background: BG }).png().toFile(join(out, name));

// Maskable: arte em 80% (zona segura) sobre o fundo Obsidian.
async function maskable(size, name) {
  const inner = Math.round(size * 0.8);
  const art = await sharp(src).resize(inner, inner, { fit: 'cover' }).flatten({ background: BG }).png().toBuffer();
  const pad = Math.round((size - inner) / 2);
  await sharp({ create: { width: size, height: size, channels: 3, background: BG } })
    .composite([{ input: art, left: pad, top: pad }])
    .png()
    .toFile(join(out, name));
}

await Promise.all([
  plain(192, 'icon-192.png'),
  plain(512, 'icon-512.png'),
  maskable(512, 'icon-maskable-512.png'),
  plain(180, 'apple-touch-icon-180.png'),
]);
console.log(`[icons:pwa] ícones gerados em ${out}`);
