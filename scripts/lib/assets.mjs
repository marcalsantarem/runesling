// Pipeline de assets do RuneSling (AG08, BRF-024). Ingestão -> recorte -> empacotamento.
// Decisões 29 (sem API: ingestão das imagens do dono) e 30 (recorte de fundo por código).
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import sharp from 'sharp';
// O "main" UMD do pacote não carrega como ESM; o build .mjs sim.
import { MaxRectsPacker } from 'maxrects-packer/dist/maxrects-packer.mjs';

export const CUT_VERSION = 1;
export const MARGIN = 0.04;
export const EXTRUDE = 2;
export const WEBP_QUALITY = 84;
export const APP_BG = '#0D1020';
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const NAMED_COLORS = { white: '#FFFFFF', magenta: '#FF00FF' };

// ---------- caminhos e manifesto ----------

export function resolvePaths(opts = {}) {
  const root = resolve(opts.root ?? process.cwd());
  const r = (p, d) => resolve(root, p ?? d);
  return {
    root,
    manifest: r(opts.manifest, 'scripts/assets-manifest.json'),
    raw: r(opts.raw, 'art-source/raw'),
    cut: r(opts.cut, 'art-source/cut'),
    out: r(opts.out, 'public/assets'),
    preview: r(opts.preview, 'art-source/preview.html'),
    cache: r(opts.cache, 'art-source/.cut-cache.json'),
  };
}

export function parseColor(c) {
  if (c == null) return null;
  const hex = NAMED_COLORS[String(c).toLowerCase()] ?? String(c);
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`cor inválida: ${c}`);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Lê o manifesto e resolve cada item: categoria, arquivos raw/cut, tipo de saída. */
export function loadManifest(paths) {
  if (!existsSync(paths.manifest)) throw new Error(`manifesto não encontrado: ${paths.manifest}`);
  const m = JSON.parse(readFileSync(paths.manifest, 'utf8'));
  const items = (m.items ?? []).map((it) => {
    const preset = m.presets?.[it.preset];
    if (!preset) throw new Error(`item ${it.key}: preset desconhecido "${it.preset}"`);
    let rawFile;
    if (it.file) rawFile = resolve(paths.root, it.file);
    else if (preset.outputDir) rawFile = resolve(paths.root, preset.outputDir, `${it.key}.png`);
    else rawFile = join(paths.raw, it.preset, `${it.key}.png`);
    let rel = relative(paths.raw, rawFile);
    if (rel.startsWith('..')) rel = join(it.preset, `${it.key}.png`);
    const category = rel.split(sep).length > 1 ? rel.split(sep)[0] : it.preset;
    const kind =
      preset.kind ?? (preset.atlas ? 'sprite' : it.key === 'app_icon' || it.preset === 'app_icon' ? 'app' : 'tile');
    const bg = it.bgColor !== undefined ? it.bgColor : preset.bgColor;
    return {
      key: it.key,
      preset: it.preset,
      category,
      kind,
      atlas: preset.atlas ?? null,
      size: preset.size,
      circularMask: preset.circularMask === true,
      removeBg: preset.removeBg !== false,
      bgColor: bg ?? null,
      raw: resolve(paths.raw, rel),
      cut: resolve(paths.cut, rel),
      standaloneIcon: preset.atlas === 'icons',
    };
  });
  return { manifest: m, items };
}

function sizeOf(size) {
  if (Array.isArray(size)) return { w: size[0], h: size[1] };
  if (size && typeof size === 'object') return { w: size.width ?? size.w, h: size.height ?? size.h };
  return { w: size, h: size };
}

const ensureDir = (f) => mkdirSync(dirname(f), { recursive: true });
const sha = (...parts) => {
  const h = createHash('sha256');
  for (const p of parts) h.update(p);
  return h.digest('hex');
};

// ---------- (1) ingestão ----------

function listImages(inputs) {
  const out = [];
  const walk = (p) => {
    const st = statSync(p);
    if (st.isDirectory()) for (const f of readdirSync(p).sort()) walk(join(p, f));
    else if (IMAGE_EXT.has(extname(p).toLowerCase())) out.push(p);
  };
  for (const i of inputs) walk(resolve(i));
  return out;
}

/** Copia imagens `<key>.png|jpg|webp` para raw/<categoria>/<key>.png (normaliza em PNG). */
export async function ingest(inputs, paths, log = console) {
  const { items } = loadManifest(paths);
  const byKey = new Map(items.map((i) => [i.key, i]));
  const report = { ingested: [], unknown: [], duplicates: [], missing: [] };
  const seen = new Set();
  for (const file of listImages(inputs)) {
    const key = basename(file, extname(file)).trim();
    const item = byKey.get(key);
    if (!item) {
      report.unknown.push(file);
      log.warn(`[ingest] chave desconhecida, ignorado: ${basename(file)}`);
      continue;
    }
    if (seen.has(key)) {
      report.duplicates.push(key);
      log.warn(`[ingest] chave repetida, vale o último: ${key}`);
    }
    seen.add(key);
    ensureDir(item.raw);
    await sharp(file).rotate().png().toFile(item.raw);
    report.ingested.push(key);
  }
  report.missing = items.filter((i) => !existsSync(i.raw)).map((i) => i.key);
  log.log(`[ingest] ${report.ingested.length} copiadas, ${report.unknown.length} desconhecidas`);
  if (report.missing.length) log.warn(`[ingest] faltando (${report.missing.length}): ${report.missing.join(', ')}`);
  return report;
}

// ---------- (2) recorte de fundo ----------

const dist = (d, i, c) => Math.hypot(d[i] - c[0], d[i + 1] - c[1], d[i + 2] - c[2]);

/**
 * Remove fundo chapado. Fundo neutro (branco): só a região ligada à borda (preserva brilhos
 * brancos internos). Fundo saturado (magenta): chroma key global (remove também buracos).
 * Na faixa de borda o alpha é a projeção (C-fundo) sobre (frente-fundo), com descontaminação
 * de cor (sem halo); sem frente confiável, rampa suave entre t0 e t1.
 */
export async function cutBackground(input, opts = {}) {
  const t0 = opts.t0 ?? 28;
  const t1 = opts.t1 ?? 90;
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const N = W * H;
  const hint = parseColor(opts.bgColor) ?? null;

  // Cor real do fundo: média da borda (perto da dica, se houver).
  const border = [];
  for (let x = 0; x < W; x++) border.push(x, (H - 1) * W + x);
  for (let y = 1; y < H - 1; y++) border.push(y * W, y * W + W - 1);
  let ref = hint;
  if (!ref) {
    const s = [0, 0, 0];
    for (const p of border) for (let k = 0; k < 3; k++) s[k] += data[p * 4 + k];
    ref = s.map((v) => v / border.length);
  }
  const acc = [0, 0, 0];
  let n = 0;
  for (const p of border) {
    if (dist(data, p * 4, ref) < 60) {
      for (let k = 0; k < 3; k++) acc[k] += data[p * 4 + k];
      n++;
    }
  }
  const bg = n >= border.length * 0.2 ? acc.map((v) => v / n) : ref;
  const chroma = Math.max(...bg) - Math.min(...bg) > 100;

  const d = new Float32Array(N);
  for (let p = 0; p < N; p++) d[p] = dist(data, p * 4, bg);

  const inBg = new Uint8Array(N);
  if (chroma) {
    for (let p = 0; p < N; p++) if (d[p] < t1) inBg[p] = 1;
  } else {
    const stack = [];
    for (const p of border) if (d[p] < t1 && !inBg[p]) (inBg[p] = 1), stack.push(p);
    while (stack.length) {
      const p = stack.pop();
      const x = p % W;
      const nb = [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, p - W, p + W];
      for (const q of nb) if (q >= 0 && q < N && !inBg[q] && d[q] < t1) (inBg[q] = 1), stack.push(q);
    }
  }

  // Faixa de borda: até BAND px fora da região de fundo. Ali o pixel é mistura fundo/frente.
  const BAND = 3;
  const ring = new Uint8Array(N); // 0 = fundo; 1..BAND = distância ao fundo; 255 = interior
  ring.fill(255);
  let front = [];
  for (let p = 0; p < N; p++) if (inBg[p]) (ring[p] = 0), front.push(p);
  for (let k = 1; k <= BAND && front.length; k++) {
    const next = [];
    for (const p of front) {
      const x = p % W;
      for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, p - W, p + W])
        if (q >= 0 && q < N && ring[q] === 255) (ring[q] = k), next.push(q);
    }
    front = next;
  }

  const alpha = new Float32Array(N).fill(1);
  const color = new Float32Array(N * 3);
  for (let p = 0; p < N; p++) for (let k = 0; k < 3; k++) color[p * 3 + k] = data[p * 4 + k];
  const R = BAND + 2;
  for (let p = 0; p < N; p++) {
    if (ring[p] === 255) continue;
    const i = p * 4;
    if (inBg[p] && d[p] < t0) {
      alpha[p] = 0;
      continue;
    }
    // Cor de frente estimada: média dos pixels interiores próximos.
    const x = p % W, y = (p / W) | 0;
    const f = [0, 0, 0];
    let nf = 0;
    for (let yy = Math.max(0, y - R); yy <= Math.min(H - 1, y + R); yy++)
      for (let xx = Math.max(0, x - R); xx <= Math.min(W - 1, x + R); xx++) {
        const q = yy * W + xx;
        if (ring[q] === 255) {
          for (let k = 0; k < 3; k++) f[k] += data[q * 4 + k];
          nf++;
        }
      }
    let a;
    if (nf) {
      for (let k = 0; k < 3; k++) f[k] /= nf;
      const fb = [f[0] - bg[0], f[1] - bg[1], f[2] - bg[2]];
      const len2 = fb[0] ** 2 + fb[1] ** 2 + fb[2] ** 2;
      if (len2 > t1 * t1) {
        a = ((data[i] - bg[0]) * fb[0] + (data[i + 1] - bg[1]) * fb[1] + (data[i + 2] - bg[2]) * fb[2]) / len2;
        a = Math.min(1, Math.max(0, a));
      }
    }
    if (a === undefined) {
      const t = Math.min(1, Math.max(0, (d[p] - t0) / (t1 - t0)));
      a = inBg[p] ? t * t * (3 - 2 * t) : 1;
    }
    alpha[p] = a;
    // Descontamina: tira a mistura com o fundo (halo).
    if (a > 0.01 && a < 1) for (let k = 0; k < 3; k++) color[p * 3 + k] = (data[i + k] - (1 - a) * bg[k]) / a;
  }
  const out = Buffer.alloc(N * 4);
  for (let p = 0; p < N; p++) {
    for (let k = 0; k < 3; k++) out[p * 4 + k] = Math.max(0, Math.min(255, Math.round(color[p * 3 + k])));
    out[p * 4 + 3] = Math.round(alpha[p] * (data[p * 4 + 3] / 255) * 255);
  }
  return sharp(out, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}

function readJson(f, fallback) {
  try {
    return JSON.parse(readFileSync(f, 'utf8'));
  } catch {
    return fallback;
  }
}

/** raw -> cut, incremental por hash (conteúdo + parâmetros + versão do algoritmo). */
export async function cutAll(paths, opts = {}, log = console) {
  const { items } = loadManifest(paths);
  const cache = opts.force ? {} : readJson(paths.cache, {});
  const report = { cut: [], copied: [], skipped: [], missing: [] };
  for (const it of items) {
    if (!existsSync(it.raw)) {
      report.missing.push(it.key);
      continue;
    }
    const buf = readFileSync(it.raw);
    const hash = sha(buf, JSON.stringify([CUT_VERSION, it.removeBg, it.bgColor]));
    if (cache[it.key] === hash && existsSync(it.cut)) {
      report.skipped.push(it.key);
      continue;
    }
    ensureDir(it.cut);
    if (it.removeBg) {
      writeFileSync(it.cut, await cutBackground(buf, { bgColor: it.bgColor }));
      report.cut.push(it.key);
    } else {
      await sharp(buf).png().toFile(it.cut);
      report.copied.push(it.key);
    }
    cache[it.key] = hash;
  }
  ensureDir(paths.cache);
  writeFileSync(paths.cache, JSON.stringify(cache, null, 2) + '\n');
  log.log(
    `[cut] ${report.cut.length} recortadas, ${report.copied.length} copiadas, ${report.skipped.length} sem mudança, ${report.missing.length} faltando`,
  );
  return report;
}

// ---------- (3) padronização e atlas ----------

async function alphaBBox(input, threshold = 24) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, y0 = info.height, x1 = -1, y1 = -1;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++)
      if (data[(y * info.width + x) * 4 + 3] > threshold) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  return x1 < 0 ? null : { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

/** Trim + centro no quadro com margem de 4% + máscara circular opcional. PNG size×size. */
export async function normalizeSprite(input, size, opts = {}) {
  const margin = opts.margin ?? MARGIN;
  const box = await alphaBBox(input);
  if (!box) throw new Error('imagem sem pixels opacos');
  const inner = Math.round(size * (1 - 2 * margin));
  const { data: piece, info } = await sharp(input)
    .ensureAlpha()
    .extract(box)
    .resize(inner, inner, { fit: 'inside', kernel: 'lanczos3' })
    .png()
    .toBuffer({ resolveWithObject: true });
  const img = sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: piece, left: Math.round((size - info.width) / 2), top: Math.round((size - info.height) / 2) }]);
  let buf = await img.png().toBuffer();
  if (opts.circularMask) {
    const c = size / 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${c}" cy="${c}" r="${inner / 2}" fill="#fff"/></svg>`;
    buf = await sharp(buf).composite([{ input: Buffer.from(svg), blend: 'dest-in' }]).png().toBuffer();
  }
  return buf;
}

/** Atlas Phaser 3 JSON Hash com extrude; frames = [{ key, buffer }] (PNG). */
export async function packAtlas(frames, name, opts = {}) {
  const extrude = opts.extrude ?? EXTRUDE;
  const padding = opts.padding ?? 2;
  const max = opts.maxSize ?? 4096;
  const sized = [];
  for (const f of [...frames].sort((a, b) => a.key.localeCompare(b.key))) {
    const meta = await sharp(f.buffer).metadata();
    const ext = await sharp(f.buffer)
      .extend({ top: extrude, bottom: extrude, left: extrude, right: extrude, extendWith: 'copy' })
      .png()
      .toBuffer();
    sized.push({ key: f.key, w: meta.width, h: meta.height, ext });
  }
  const packer = new MaxRectsPacker(max, max, padding, { smart: true, pot: true, square: false, allowRotation: false, border: 0 });
  for (const s of sized) packer.add(s.w + extrude * 2, s.h + extrude * 2, s);
  if (packer.bins.length !== 1) throw new Error(`atlas ${name}: não coube em ${max}×${max}`);
  const bin = packer.bins[0];
  const json = { frames: {}, meta: { app: 'runesling build-assets', version: '1', image: `${name}.webp`, format: 'RGBA8888', size: { w: bin.width, h: bin.height }, scale: '1' } };
  const layers = [];
  for (const r of [...bin.rects].sort((a, b) => a.data.key.localeCompare(b.data.key))) {
    const s = r.data;
    layers.push({ input: s.ext, left: r.x, top: r.y });
    json.frames[s.key] = {
      frame: { x: r.x + extrude, y: r.y + extrude, w: s.w, h: s.h },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: s.w, h: s.h },
      sourceSize: { w: s.w, h: s.h },
    };
  }
  const image = await sharp({ create: { width: bin.width, height: bin.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(layers)
    .webp({ quality: WEBP_QUALITY, alphaQuality: 100, effort: 6 })
    .toBuffer();
  return { image, json };
}

/** cut -> public/assets: atlases, ícones avulsos, cenário, ícone do app + preview. */
export async function buildAll(paths, log = console) {
  const { items } = loadManifest(paths);
  const atlases = new Map();
  const written = [];
  const missing = [];
  const write = (rel, buf) => {
    const f = join(paths.out, rel);
    ensureDir(f);
    writeFileSync(f, buf);
    written.push(rel);
  };
  for (const it of items) {
    if (!existsSync(it.cut)) {
      missing.push(it.key);
      continue;
    }
    const { w, h } = sizeOf(it.size);
    if (it.kind === 'sprite') {
      const buf = await normalizeSprite(it.cut, w, { circularMask: it.circularMask });
      if (!atlases.has(it.atlas)) atlases.set(it.atlas, []);
      atlases.get(it.atlas).push({ key: it.key, buffer: buf });
      if (it.standaloneIcon) write(`icons/${it.key}.webp`, await sharp(buf).webp({ quality: WEBP_QUALITY, alphaQuality: 100 }).toBuffer());
    } else if (it.kind === 'app') {
      const base = it.removeBg
        ? await normalizeSprite(it.cut, w)
        : await sharp(it.cut).resize(w, h, { fit: 'cover' }).png().toBuffer();
      write(`app/${it.key}.png`, await sharp(base).resize(w, h).flatten({ background: APP_BG }).removeAlpha().png().toBuffer());
    } else {
      const img = it.removeBg
        ? sharp(await sharp(it.cut).extract(await alphaBBox(it.cut)).png().toBuffer()).resize(w, h, { fit: 'inside' })
        : sharp(it.cut).resize(w, h, { fit: 'cover' });
      write(`tiles/${it.key}.webp`, await img.webp({ quality: WEBP_QUALITY, alphaQuality: 100 }).toBuffer());
    }
  }
  const atlasJson = {};
  for (const [name, frames] of atlases) {
    const { image, json } = await packAtlas(frames, name);
    write(`atlases/${name}.webp`, image);
    write(`atlases/${name}.json`, JSON.stringify(json, null, 2) + '\n');
    atlasJson[name] = json;
  }
  writePreview(paths, items, atlasJson, written);
  log.log(`[pack] ${written.length} arquivos em ${relative(paths.root, paths.out) || '.'}; faltando ${missing.length}`);
  if (missing.length) log.warn(`[pack] sem recorte: ${missing.join(', ')}`);
  return { written, missing, atlases: atlasJson };
}

// ---------- (4) preview ----------

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function writePreview(paths, items, atlasJson, written) {
  const dir = dirname(paths.preview);
  const url = (rel) => {
    const f = join(paths.out, rel);
    const v = existsSync(f) ? sha(readFileSync(f)).slice(0, 8) : '0';
    return `${relative(dir, f).split(sep).join('/')}?v=${v}`;
  };
  const cards = [];
  for (const [name, json] of Object.entries(atlasJson)) {
    const img = url(`atlases/${name}.webp`);
    for (const [key, fr] of Object.entries(json.frames)) {
      const { x, y, w, h } = fr.frame;
      cards.push(
        `<figure data-key="${esc(key)}"><div class="spr hb" style="width:${w}px;height:${h}px;background:url('${img}') -${x}px -${y}px"></div><figcaption>${esc(key)} <small>${name} ${w}×${h}</small></figcaption></figure>`,
      );
    }
  }
  for (const rel of written.filter((r) => !r.startsWith('atlases/'))) {
    const key = basename(rel, extname(rel));
    cards.push(`<figure data-key="${esc(key)}"><img src="${url(rel)}" alt="${esc(key)}"><figcaption>${esc(key)} <small>${esc(rel)}</small></figcaption></figure>`);
  }
  const sheets = Object.keys(atlasJson)
    .map((n) => `<figure><img class="sheet" src="${url(`atlases/${n}.webp`)}" alt="atlas ${n}"><figcaption>atlas ${n} ${atlasJson[n].meta.size.w}×${atlasJson[n].meta.size.h}</figcaption></figure>`)
    .join('\n');
  const missing = items.filter((i) => !written.some((r) => basename(r, extname(r)) === i.key) && !Object.values(atlasJson).some((j) => j.frames[i.key]));
  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>RuneSling assets</title>
<style>
body{margin:0;padding:16px;background:#0D1020;color:#c9cbe0;font:14px system-ui,sans-serif}
h1,h2{font-weight:600}main{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end}
figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:6px;max-width:100%}
figure img{max-width:100%;height:auto}.sheet{outline:1px dashed #3a3f66}
small{color:#7c80a6}.spr{position:relative;max-width:100%}
body.hit .hb::after{content:"";position:absolute;inset:4%;border:1px dashed #00e5ff;border-radius:50%}
</style></head><body>
<h1>RuneSling — assets</h1>
<label><input type="checkbox" onchange="document.body.classList.toggle('hit',this.checked)"> mostrar círculo 92% (hitbox) e centro</label>
<p>Faltando (${missing.length}): ${missing.map((i) => esc(i.key)).join(', ') || '—'}</p>
<main>
${cards.join('\n')}
</main>
<h2>Atlases</h2>
<main>${sheets}</main>
</body></html>
`;
  ensureDir(paths.preview);
  writeFileSync(paths.preview, html);
}

// ---------- CLI ----------

const PATH_OPTS = ['root', 'manifest', 'raw', 'cut', 'out', 'preview', 'cache'];

export function parseArgs(argv) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      if (v !== undefined) opts[k] = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith('--') && PATH_OPTS.includes(k)) opts[k] = argv[++i];
      else opts[k] = true;
    } else opts._.push(a);
  }
  // Caminhos passados na linha de comando são relativos ao diretório atual.
  for (const k of PATH_OPTS) if (typeof opts[k] === 'string') opts[k] = resolve(opts[k]);
  return opts;
}

export async function runCli(fn) {
  try {
    await fn(parseArgs(process.argv.slice(2)));
  } catch (e) {
    console.error(`[assets] erro: ${e instanceof Error ? e.message : e}`);
    process.exit(1);
  }
}
