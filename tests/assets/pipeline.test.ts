import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  buildAll,
  cutAll,
  cutBackground,
  ingest,
  loadManifest,
  normalizeSprite,
  normalizeUiPiece,
  packAtlas,
  resolvePaths,
  type AssetPaths,
  type PhaserAtlas,
} from '../../scripts/lib/assets.mjs';

const quiet = { log: () => {}, warn: () => {} };

/** Imagem sintética: forma escura sobre fundo chapado, com borda suave (blur). */
async function synth(opts: { bg: string; w?: number; h?: number; shape: string; blur?: number }): Promise<Buffer> {
  const w = opts.w ?? 400;
  const h = opts.h ?? 400;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${opts.bg}"/>${opts.shape}</svg>`;
  return sharp(Buffer.from(svg)).blur(opts.blur ?? 1.2).png().toBuffer();
}

async function rgba(buf: Buffer) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x: number, y: number) => {
    const i = (y * info.width + x) * 4;
    return [data[i]!, data[i + 1]!, data[i + 2]!, data[i + 3]!] as const;
  };
  return { data, info, px };
}

async function alphaBox(buf: Buffer) {
  const { data, info } = await rgba(buf);
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++)
      if (data[(y * info.width + x) * 4 + 3]! > 128) {
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
  return { x0, y0, x1, y1, cx: (x0 + x1 + 1) / 2, cy: (y0 + y1 + 1) / 2, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

describe('recorte de fundo', () => {
  it('fundo branco: borda transparente, miolo opaco, brilho branco interno preservado, sem halo', async () => {
    const img = await synth({
      bg: '#ffffff',
      shape: '<circle cx="200" cy="200" r="150" fill="#5a1a1a"/><circle cx="200" cy="200" r="30" fill="#ffffff"/>',
    });
    const { px, data, info } = await rgba(await cutBackground(img, { bgColor: 'white' }));
    expect(px(5, 5)[3]).toBe(0);
    expect(px(200, 100)[3]).toBe(255);
    expect(px(200, 200)[3]).toBe(255); // branco interno não ligado à borda
    let partial = 0;
    for (let p = 0; p < info.width * info.height; p++) {
      const a = data[p * 4 + 3]!;
      if (a > 20 && a < 235) {
        partial++;
        expect(data[p * 4]!).toBeLessThan(170); // sem halo branco na borda
      }
    }
    expect(partial).toBeGreaterThan(100); // borda suave (anti-serrilhado)
  });

  it('fundo magenta: chroma key global remove até o buraco interno', async () => {
    const img = await synth({
      bg: '#ff00ff',
      shape: '<circle cx="200" cy="200" r="150" fill="#1f6b5a"/><circle cx="200" cy="200" r="40" fill="#ff00ff"/>',
    });
    const { px } = await rgba(await cutBackground(img, { bgColor: 'magenta' }));
    expect(px(3, 390)[3]).toBe(0);
    expect(px(200, 200)[3]).toBe(0);
    expect(px(200, 90)[3]).toBe(255);
    const [r, g, b] = px(200, 90);
    expect(Math.abs(r - 0x1f) + Math.abs(g - 0x6b) + Math.abs(b - 0x5a)).toBeLessThan(6);
  });

  it('removeEnclosedBg: remove bolsão de fundo cercado grande e mantém brilho pequeno', async () => {
    const img = await synth({
      bg: '#ffffff',
      shape:
        '<circle cx="200" cy="200" r="160" fill="#3e1f73"/><circle cx="150" cy="200" r="40" fill="#ffffff"/><circle cx="280" cy="200" r="6" fill="#ffffff"/>',
    });
    const off = await rgba(await cutBackground(img, { bgColor: 'white' }));
    expect(off.px(150, 200)[3]).toBe(255); // padrão: bolsão cercado fica
    const on = await rgba(await cutBackground(img, { bgColor: 'white', removeEnclosedBg: true }));
    expect(on.px(5, 5)[3]).toBe(0);
    expect(on.px(150, 200)[3]).toBe(0); // bolsão (~5000 px) removido
    expect(on.px(280, 200)[3]).toBe(255); // brilho pequeno (< 400 px) preservado
    expect(on.px(200, 100)[3]).toBe(255);
    const [r] = on.px(150, 200 - 41); // borda do bolsão sem halo branco
    expect(on.px(150, 200 - 41)[3] === 0 || r < 170).toBe(true);
  });

  it('sem dica de cor detecta o fundo pela borda', async () => {
    const img = await synth({ bg: '#f4f4f2', shape: '<rect x="100" y="100" width="200" height="200" fill="#202040"/>' });
    const { px } = await rgba(await cutBackground(img));
    expect(px(10, 10)[3]).toBe(0);
    expect(px(200, 200)[3]).toBe(255);
  });
});

describe('padronização', () => {
  it('centraliza com 4% de margem a partir de sprite fora do centro', async () => {
    const cut = await cutBackground(
      await synth({ bg: '#ffffff', w: 500, h: 360, shape: '<circle cx="140" cy="200" r="100" fill="#333"/>' }),
      { bgColor: 'white' },
    );
    const out = await normalizeSprite(cut, 256, { circularMask: true });
    const meta = await sharp(out).metadata();
    expect([meta.width, meta.height]).toEqual([256, 256]);
    const box = await alphaBox(out);
    expect(Math.abs(box.cx - 128)).toBeLessThanOrEqual(1);
    expect(Math.abs(box.cy - 128)).toBeLessThanOrEqual(1);
    expect(Math.abs(box.w - 256 * 0.92)).toBeLessThanOrEqual(6); // borda suave conta só acima de alpha 128
  });

  it('máscara circular recorta cantos; sem máscara eles ficam', async () => {
    const cut = await cutBackground(
      await synth({ bg: '#ffffff', shape: '<rect x="50" y="50" width="300" height="300" fill="#334"/>', blur: 0.5 }),
      { bgColor: 'white' },
    );
    const masked = await rgba(await normalizeSprite(cut, 256, { circularMask: true }));
    const plain = await rgba(await normalizeSprite(cut, 256, { circularMask: false }));
    expect(masked.px(20, 20)[3]).toBe(0);
    expect(plain.px(20, 20)[3]).toBe(255);
    expect(masked.px(128, 128)[3]).toBe(255);
    expect(masked.px(128, 12)[3]).toBeGreaterThan(200); // topo do círculo r=117.76
    // borda do círculo anti-serrilhada
    const edge = masked.px(Math.round(128 + 117.76 * Math.SQRT1_2), Math.round(128 + 117.76 * Math.SQRT1_2))[3];
    expect(edge).toBeGreaterThan(0);
    expect(edge).toBeLessThan(255);
  });

  it('atlas Phaser JSON Hash válido, sem sobreposição, com extrude', async () => {
    const frames = await Promise.all(
      [['a', 256, '#c33'], ['b', 384, '#3c3'], ['c', 192, '#33c']].map(async ([key, s, color]) => ({
        key: key as string,
        buffer: await sharp({ create: { width: s as number, height: s as number, channels: 4, background: color as string } }).png().toBuffer(),
      })),
    );
    const { image, json } = await packAtlas(frames, 'test');
    const meta = await sharp(image).metadata();
    expect(meta.format).toBe('webp');
    expect([meta.width, meta.height]).toEqual([json.meta.size.w, json.meta.size.h]);
    expect(json.meta.image).toBe('test.webp');
    const rects = Object.values(json.frames).map((f) => f.frame);
    expect(Object.keys(json.frames).sort()).toEqual(['a', 'b', 'c']);
    for (const r of rects) {
      expect(r.x).toBeGreaterThanOrEqual(2);
      expect(r.y).toBeGreaterThanOrEqual(2);
      expect(r.x + r.w + 2).toBeLessThanOrEqual(json.meta.size.w);
      expect(r.y + r.h + 2).toBeLessThanOrEqual(json.meta.size.h);
    }
    for (let i = 0; i < rects.length; i++)
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i]!, b = rects[j]!;
        const overlap = a.x - 2 < b.x + b.w + 2 && b.x - 2 < a.x + a.w + 2 && a.y - 2 < b.y + b.h + 2 && b.y - 2 < a.y + a.h + 2;
        expect(overlap).toBe(false);
      }
    // extrude: pixel 1 px fora do frame copia a cor da borda
    const fa = json.frames['a']!.frame;
    const { px } = await rgba(image);
    const out = px(fa.x - 1, fa.y + 10);
    expect(out[3]).toBeGreaterThan(240);
    expect(out[0]).toBeGreaterThan(150);
  });
});

describe('esteira ponta a ponta', { timeout: 60_000 }, () => {
  let root: string;
  let paths: AssetPaths;

  beforeAll(async () => {
    root = mkdtempSync(join(tmpdir(), 'runesling-assets-'));
    const manifest = {
      presets: {
        enemy_medallion: { atlas: 'enemies', size: 256, circularMask: true, removeBg: true, outputDir: 'art-source/raw/enemies', bgColor: 'white' },
        boss_medallion: { atlas: 'enemies', size: 384, circularMask: false, removeBg: true, outputDir: 'art-source/raw/bosses', bgColor: 'white' },
        skill_icon: { atlas: 'icons', size: 128, circularMask: false, removeBg: true, outputDir: 'art-source/raw/icons', bgColor: 'white' },
        floor_tile: { atlas: null, size: 512, circularMask: false, removeBg: false, bgColor: null, outputDir: 'art-source/raw/tiles' },
        wall_trim: { atlas: null, size: 512, circularMask: false, removeBg: true, outputDir: 'art-source/raw/tiles', bgColor: 'white' },
        app_icon: { atlas: null, size: 1024, circularMask: false, removeBg: false, bgColor: '#0D1020', outputDir: 'art-source/raw/app' },
      },
      items: [
        { key: 'enemy_goblin', preset: 'enemy_medallion', bgColor: 'white', file: 'art-source/raw/enemies/enemy_goblin.png' },
        { key: 'enemy_healer', preset: 'enemy_medallion', bgColor: 'magenta', file: 'art-source/raw/enemies/enemy_healer.png' },
        { key: 'boss_obsidian', preset: 'boss_medallion', file: 'art-source/raw/bosses/boss_obsidian.png' },
        { key: 'icon_chain_lightning', preset: 'skill_icon', bgColor: 'magenta', file: 'art-source/raw/icons/icon_chain_lightning.png' },
        { key: 'icon_ignite', preset: 'skill_icon', file: 'art-source/raw/icons/icon_ignite.png' },
        { key: 'floor_crypt', preset: 'floor_tile', file: 'art-source/raw/tiles/floor_crypt.png' },
        { key: 'wall_trim_crypt', preset: 'wall_trim', file: 'art-source/raw/tiles/wall_trim_crypt.png' },
        { key: 'app_icon', preset: 'app_icon', file: 'art-source/raw/app/app_icon.png' },
      ],
    };
    mkdirSync(join(root, 'scripts'), { recursive: true });
    writeFileSync(join(root, 'scripts/assets-manifest.json'), JSON.stringify(manifest));
    const inbox = join(root, 'inbox');
    mkdirSync(inbox);
    const disk = (bg: string, c: string) => synth({ bg, shape: `<circle cx="210" cy="190" r="140" fill="${c}"/>` });
    await sharp(await disk('#ffffff', '#6b2a12')).jpeg({ quality: 92 }).toFile(join(inbox, 'enemy_goblin.jpg'));
    await sharp(await disk('#ff00ff', '#1f6b5a')).png().toFile(join(inbox, 'enemy_healer.png'));
    await sharp(await synth({ bg: '#ffffff', shape: '<polygon points="200,20 380,380 20,380" fill="#2a1030"/>' })).webp({ quality: 95 }).toFile(join(inbox, 'boss_obsidian.webp'));
    await sharp(await disk('#ff00ff', '#00b8d4')).png().toFile(join(inbox, 'icon_chain_lightning.png'));
    await sharp(await synth({ bg: '#808080', shape: '<rect x="0" y="0" width="200" height="200" fill="#404050"/>', blur: 0.3 })).png().toFile(join(inbox, 'floor_crypt.png'));
    await sharp(await synth({ bg: '#ffffff', w: 600, h: 200, shape: '<rect x="20" y="60" width="560" height="80" fill="#3a3550"/>' })).png().toFile(join(inbox, 'wall_trim_crypt.png'));
    await sharp(await disk('#0D1020', '#d4a017')).png().toFile(join(inbox, 'app_icon.png'));
    await sharp(await disk('#ffffff', '#000')).png().toFile(join(inbox, 'enemy_unknown.png'));
    paths = resolvePaths({ root });
  });

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it('ingestão normaliza em PNG, avisa desconhecidas e faltantes', async () => {
    const r = await ingest([join(root, 'inbox')], paths, quiet);
    expect(r.ingested).toHaveLength(7);
    expect(r.unknown.map((f) => f.split('/').pop())).toEqual(['enemy_unknown.png']);
    expect(r.missing).toEqual(['icon_ignite']);
    const meta = await sharp(join(root, 'art-source/raw/enemies/enemy_goblin.png')).metadata();
    expect(meta.format).toBe('png');
    expect(existsSync(join(root, 'art-source/raw/bosses/boss_obsidian.png'))).toBe(true);
  });

  it('recorte incremental por hash', async () => {
    const first = await cutAll(paths, {}, quiet);
    expect(first.cut).toHaveLength(5);
    expect(first.copied.sort()).toEqual(['app_icon', 'floor_crypt']);
    expect(first.missing).toEqual(['icon_ignite']);
    const second = await cutAll(paths, {}, quiet);
    expect(second.skipped).toHaveLength(7);
    await sharp(await synth({ bg: '#ffffff', shape: '<circle cx="200" cy="200" r="120" fill="#123"/>' })).png().toFile(join(root, 'art-source/raw/enemies/enemy_goblin.png'));
    const third = await cutAll(paths, {}, quiet);
    expect(third.cut).toEqual(['enemy_goblin']);
    const { px } = await rgba(readFileSync(join(root, 'art-source/cut/enemies/enemy_goblin.png')));
    expect(px(2, 2)[3]).toBe(0);
  });

  it('gera atlases, ícones avulsos, cenário, ícone do app e preview', async () => {
    const r = await buildAll(paths, quiet);
    expect(r.missing).toEqual(['icon_ignite']);
    const out = (p: string) => join(root, 'public/assets', p);
    const enemies = JSON.parse(readFileSync(out('atlases/enemies.json'), 'utf8')) as PhaserAtlas;
    expect(Object.keys(enemies.frames).sort()).toEqual(['boss_obsidian', 'enemy_goblin', 'enemy_healer']);
    expect(enemies.frames['enemy_goblin']!.frame.w).toBe(256);
    expect(enemies.frames['boss_obsidian']!.frame.w).toBe(384);
    const em = await sharp(out('atlases/enemies.webp')).metadata();
    expect([em.width, em.height]).toEqual([enemies.meta.size.w, enemies.meta.size.h]);
    const icons = JSON.parse(readFileSync(out('atlases/icons.json'), 'utf8')) as PhaserAtlas;
    expect(Object.keys(icons.frames)).toEqual(['icon_chain_lightning']);
    const icon = await sharp(out('icons/icon_chain_lightning.webp')).metadata();
    expect([icon.format, icon.width, icon.height]).toEqual(['webp', 128, 128]);
    const floor = await sharp(out('tiles/floor_crypt.webp')).metadata();
    expect([floor.width, floor.height]).toEqual([512, 512]);
    const wall = await sharp(out('tiles/wall_trim_crypt.webp')).metadata();
    expect(wall.width).toBe(512);
    expect(wall.hasAlpha).toBe(true);
    const appIcon = join(root, 'art-source/app/app_icon.png');
    expect(existsSync(out('app/app_icon.png'))).toBe(false); // fora do build (T-042)
    const app = await sharp(appIcon).metadata();
    expect([app.width, app.height, app.hasAlpha]).toEqual([1024, 1024, false]);
    const { px } = await rgba(readFileSync(appIcon));
    expect(px(2, 2).slice(0, 3)).toEqual([0x0d, 0x10, 0x20]);
    const html = readFileSync(join(root, 'art-source/preview.html'), 'utf8');
    expect(html).toContain('#0D1020');
    for (const k of ['enemy_goblin', 'boss_obsidian', 'icon_chain_lightning', 'floor_crypt', 'wall_trim_crypt', 'app_icon']) expect(html).toContain(`data-key="${k}"`);
    expect(html).toContain('../public/assets/atlases/enemies.webp');
  });
});

describe("manifesto real: peças de UI no estilo validado (T-058)", () => {
  const NEW_KEYS = [
    "ui_btn_mini",
    "ui_btn_round",
    "ui_btn_square",
    "ui_ribbon_dark",
    "ui_pill",
    "ui_map_bg",
    "ui_map_node",
    "ui_map_node_locked",
    "ui_defeat_shield",
    "ui_socket",
    "ui_icon_lock",
    "ui_icon_back",
    "ui_icon_check",
    "ui_icon_recall",
  ];
  type UiItem = {
    key: string;
    preset: string;
    file: string;
    size: [number, number];
    nineSlice: [number, number, number, number] | null;
    deprecated?: boolean;
    bgColor?: string | null;
    geminiPrompt: string;
    prompt?: string;
    anchor?: string;
    anchorFor?: string;
  };
  const root = fileURLToPath(new URL("../..", import.meta.url));
  const raw = JSON.parse(
    readFileSync(join(root, "scripts/assets-manifest.json"), "utf8"),
  ) as {
    anchors: Record<string, string>;
    presets: Record<string, { kind?: string }>;
    items: UiItem[];
  };
  const ui = raw.items.filter((i) => raw.presets[i.preset]?.kind === "ui");

  it('carrega com as chaves novas e deixa as "não usar" fora do pipeline', () => {
    const { items } = loadManifest(resolvePaths({ root }));
    const keys = items.map((i) => i.key);
    for (const k of NEW_KEYS) expect(keys).toContain(k);
    expect(keys).not.toContain("ui_icon_sword");
    expect(new Set(keys).size).toBe(keys.length);
    const node = items.find((i) => i.key === "ui_map_node")!;
    expect([node.kind, node.bgColor, node.size]).toEqual([
      "ui",
      "magenta",
      [256, 256],
    ]);
    expect(items.find((i) => i.key === "ui_map_bg")!.removeBg).toBe(false);
  });

  it("parte 2 (BRF-047): ícones com a mesma margem, miolos vazados e som liga/desliga no mesmo recorte", () => {
    const { items } = loadManifest(resolvePaths({ root }));
    const by = (k: string) => items.find((i) => i.key === k)!;
    const icons = items.filter((i) => i.key.startsWith("ui_icon_"));
    expect(icons).toHaveLength(11);
    expect(new Set(icons.map((i) => i.margin))).toEqual(new Set([0.06]));
    expect(by("ui_icon_gear").removeEnclosedBg).toBe(true);
    expect(by("ui_icon_lock").removeEnclosedBg).toBe(true);
    expect(by("ui_icon_sound").trimGroup).toBe("sound");
    expect(by("ui_icon_sound_off").trimGroup).toBe("sound");
    expect(by("ui_gem_lightning").bgColor).toBe("magenta");
  });

  it("cada peça tem arquivo em raw/ui, tamanho, 9-slice coerente e prompt sem brilho externo pedido", () => {
    for (const i of ui) {
      expect(i.file).toBe(`art-source/raw/ui/${i.key}.png`);
      expect(i.size).toHaveLength(2);
      if (i.nineSlice) {
        const [t, r, b, l] = i.nineSlice;
        expect(t + b).toBeLessThan(i.size[1]);
        expect(l + r).toBeLessThan(i.size[0]);
      }
      expect(i.geminiPrompt).toContain(i.prompt ?? "");
      expect(i.geminiPrompt).not.toMatch(/with (an )?outer glow/i);
    }
  });

  it("âncora de UI: ui_btn_primary vem primeiro e vira ui_anchor; as outras anexam ui_anchor", () => {
    const live = ui.filter((i) => !i.deprecated);
    expect(live[0]!.key).toBe("ui_btn_primary");
    expect(live[0]!.anchorFor).toBe(raw.anchors.ui);
    for (const i of live.slice(1).filter((x) => x.preset === "ui_piece"))
      expect(i.anchor ?? raw.anchors.ui).toBe(raw.anchors.ui);
  });
});

describe('peças de UI (T-039)', { timeout: 60_000 }, () => {
  let root: string;
  let paths: AssetPaths;
  const out = (p: string) => join(root, 'public/assets', p);

  beforeAll(async () => {
    root = mkdtempSync(join(tmpdir(), 'runesling-ui-'));
    const manifest = {
      presets: {
        ui_piece: { kind: 'ui', atlas: null, size: 256, removeBg: true, bgColor: 'white', nineSlice: [32, 32, 32, 32], outputDir: 'art-source/raw/ui' },
        ui_scene: { kind: 'ui', atlas: null, size: 720, removeBg: false, bgColor: null, nineSlice: null, outputDir: 'art-source/raw/ui' },
      },
      items: [
        { key: 'ui_btn_primary', preset: 'ui_piece', file: 'art-source/raw/ui/ui_btn_primary.png', size: [384, 96], nineSlice: [40, 40, 40, 40] },
        { key: 'ui_map_node', preset: 'ui_piece', bgColor: 'magenta', file: 'art-source/raw/ui/ui_map_node.png', size: [256, 256], nineSlice: null },
        { key: 'ui_map_bg', preset: 'ui_scene', file: 'art-source/raw/ui/ui_map_bg.png', size: [72, 128] },
        { key: 'ui_gem_fire', preset: 'ui_piece', file: 'art-source/raw/ui/ui_gem_fire.png', size: [128, 128], nineSlice: null },
      ],
    };
    mkdirSync(join(root, 'scripts'), { recursive: true });
    mkdirSync(join(root, 'art-source/raw/ui'), { recursive: true });
    writeFileSync(join(root, 'scripts/assets-manifest.json'), JSON.stringify(manifest));
    const raw = (k: string) => join(root, 'art-source/raw/ui', `${k}.png`);
    await sharp(await synth({ bg: '#ffffff', w: 600, h: 300, shape: '<rect x="30" y="80" width="540" height="140" fill="#c89a3a"/>' })).png().toFile(raw('ui_btn_primary'));
    // Aro com miolo vazado em magenta: o chroma key tira o fundo e o miolo.
    await sharp(await synth({ bg: '#ff00ff', shape: '<circle cx="200" cy="200" r="150" fill="none" stroke="#3a4050" stroke-width="50"/>' })).png().toFile(raw('ui_map_node'));
    await sharp(await synth({ bg: '#101828', w: 200, h: 360, shape: '<rect x="20" y="20" width="80" height="80" fill="#303850"/>' })).png().toFile(raw('ui_map_bg'));
    paths = resolvePaths({ root });
    await cutAll(paths, {}, quiet);
  });

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it('normalizeUiPiece: tamanho exato, com e sem 9-slice', async () => {
    const src = await synth({ bg: '#00000000', w: 300, h: 100, shape: '<rect x="10" y="10" width="280" height="80" fill="#456"/>' });
    const a = await sharp(await normalizeUiPiece(src, 256, 128, [32, 32, 32, 32])).metadata();
    expect([a.width, a.height]).toEqual([256, 128]);
    const b = await sharp(await normalizeUiPiece(src, 128, 128, null)).metadata();
    expect([b.width, b.height]).toEqual([128, 128]);
  });

  it('normalizeUiPiece: margem uniforme na peça inteira e caixa de trim compartilhada alinha a parte comum', async () => {
    const sq = await synth({ bg: '#00000000', w: 200, h: 200, shape: '<rect x="40" y="40" width="120" height="120" fill="#456"/>', blur: 0.3 });
    const m = await alphaBox(await normalizeUiPiece(sq, 128, 128, null, { margin: 0.1 }));
    for (const v of [m.x0, m.y0, 127 - m.x1, 127 - m.y1]) expect(Math.abs(v - 13)).toBeLessThanOrEqual(1);
    // "Som liga/desliga": mesmo bloco à esquerda, extensões diferentes à direita.
    const on = await synth({ bg: '#00000000', w: 300, h: 200, shape: '<rect x="20" y="40" width="100" height="120" fill="#456"/><rect x="200" y="60" width="80" height="80" fill="#456"/>', blur: 0.3 });
    const off = await synth({ bg: '#00000000', w: 300, h: 200, shape: '<rect x="20" y="40" width="100" height="120" fill="#456"/><rect x="160" y="80" width="40" height="40" fill="#456"/>', blur: 0.3 });
    const box = { left: 19, top: 39, width: 263, height: 122 };
    const leftBlock = async (b: Buffer) => {
      const { data, info } = await rgba(b);
      let x1 = -1;
      for (let x = 0; x < 64; x++) if (data[(64 * info.width + x) * 4 + 3]! > 128) x1 = x;
      return x1;
    };
    const a = await normalizeUiPiece(on, 128, 128, null, { margin: 0.06, box });
    const c = await normalizeUiPiece(off, 128, 128, null, { margin: 0.06, box });
    expect(await leftBlock(c)).toBe(await leftBlock(a));
    expect((await alphaBox(c)).x0).toBe((await alphaBox(a)).x0);
  });

  it('grava em ui/ (não em tiles/), escreve ui.json e não quebra com peça faltando', async () => {
    const r = await buildAll(paths, quiet);
    expect(r.missing).toEqual(['ui_gem_fire']);
    expect(existsSync(out('tiles'))).toBe(false);
    for (const [k, w, h] of [['ui_btn_primary', 384, 96], ['ui_map_node', 256, 256], ['ui_map_bg', 72, 128]] as const) {
      const m = await sharp(out(`ui/${k}.webp`)).metadata();
      expect([m.format, m.width, m.height]).toEqual(['webp', w, h]);
    }
    const json = JSON.parse(readFileSync(out('ui/ui.json'), 'utf8'));
    expect(json).toEqual({
      ui_btn_primary: { slice: [40, 40, 40, 40], width: 384, height: 96 },
      ui_map_bg: { slice: null, width: 72, height: 128 },
      ui_map_node: { slice: null, width: 256, height: 256 },
    });
    const { px } = await rgba(await sharp(out('ui/ui_map_node.webp')).png().toBuffer());
    expect(px(128, 128)[3]).toBe(0); // miolo vazado
    expect(px(2, 2)[3]).toBe(0); // fundo
    const btn = await rgba(await sharp(out('ui/ui_btn_primary.webp')).png().toBuffer());
    expect(btn.px(192, 48)[3]).toBe(255);
  });
});
