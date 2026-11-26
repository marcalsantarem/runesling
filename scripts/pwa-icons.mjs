// Gera os ícones do PWA a partir de art-source/app/app_icon.png (T-029; fora do build, T-042).
// PNGs com paleta e compressão máxima (T-042: pasta icons/ bem abaixo de 300 KB).
// Sem o arquivo, mantém os provisórios em public/icons/ e só (re)gera o favicon a partir deles.
// Favicon: public/favicon.ico (PNGs 16/32/48 embutidos) — T-031.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = process.argv[2] ?? join(root, 'art-source/app/app_icon.png');
const out = process.argv[3] ?? join(root, 'public/icons');
const favicon = process.argv[4] ?? join(root, 'public/favicon.ico');
const BG = '#0D1020';
/** PNG com paleta (quantizado) e compressão máxima. */
const PNG_OPTS = { palette: true, colors: 256, quality: 90, dither: 1, compressionLevel: 9, effort: 10 };

/** ICO com entradas PNG (aceito por todos os navegadores atuais). */
async function writeFavicon(from) {
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(
    sizes.map((s) => sharp(from).resize(s, s, { fit: 'cover' }).flatten({ background: BG }).png(PNG_OPTS).toBuffer()),
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
  sharp(src).resize(size, size, { fit: 'cover' }).flatten({ background: BG }).png(PNG_OPTS).toFile(join(out, name));

/** Cor do canto superior esquerdo da arte (fundo do maskable, sem quadrado tênue — T-042). */
async function cornerColor() {
  const { data, info } = await sharp(src).flatten({ background: BG }).extract({ left: 0, top: 0, width: 4, height: 4 }).raw().toBuffer({ resolveWithObject: true });
  const c = [0, 0, 0];
  for (let i = 0; i < 16; i++) for (let k = 0; k < 3; k++) c[k] += data[i * info.channels + k];
  return { r: Math.round(c[0] / 16), g: Math.round(c[1] / 16), b: Math.round(c[2] / 16) };
}

// Maskable: arte em 80% (zona segura) sobre a cor do canto da arte.
async function maskable(size, name) {
  const inner = Math.round(size * 0.8);
  const bg = await cornerColor();
  const art = await sharp(src).resize(inner, inner, { fit: 'cover' }).flatten({ background: BG }).png().toBuffer();
  const pad = Math.round((size - inner) / 2);
  const flat = await sharp({ create: { width: size, height: size, channels: 3, background: bg } })
    .composite([{ input: art, left: pad, top: pad }])
    .png()
    .toBuffer();
  await sharp(flat).png(PNG_OPTS).toFile(join(out, name));
}

await Promise.all([
  plain(192, 'icon-192.png'),
  plain(512, 'icon-512.png'),
  maskable(512, 'icon-maskable-512.png'),
  plain(180, 'apple-touch-icon-180.png'),
]);
await writeFavicon(src);
console.log(`[icons:pwa] ícones gerados em ${out}`);
