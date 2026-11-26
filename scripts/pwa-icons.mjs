// Gera os ícones do PWA a partir de public/assets/app/app_icon.png (T-029).
// Sem o arquivo, mantém os provisórios em public/icons/ e só (re)gera o favicon a partir deles.
// Favicon: public/favicon.ico (PNGs 16/32/48 embutidos) — T-031.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = process.argv[2] ?? join(root, 'public/assets/app/app_icon.png');
const out = process.argv[3] ?? join(root, 'public/icons');
const favicon = process.argv[4] ?? join(root, 'public/favicon.ico');
const BG = '#0D1020';

/** ICO com entradas PNG (aceito por todos os navegadores atuais). */
async function writeFavicon(from) {
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(
    sizes.map((s) => sharp(from).resize(s, s, { fit: 'cover' }).flatten({ background: BG }).png().toBuffer()),
  );
  const header = Buffer.alloc(6 + 16 * sizes.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  sizes.forEach((s, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(s, e);
    header.writeUInt8(s, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(pngs[i].length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += pngs[i].length;
  });
  writeFileSync(favicon, Buffer.concat([header, ...pngs]));
  console.log(`[icons:pwa] favicon gerado em ${favicon}`);
}

if (!existsSync(src)) {
  console.log(`[icons:pwa] ${src} não existe; mantendo os ícones provisórios.`);
  const provisional = join(out, 'icon-512.png');
  if (existsSync(provisional)) await writeFavicon(provisional);
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
await writeFavicon(src);
console.log(`[icons:pwa] ícones gerados em ${out}`);
