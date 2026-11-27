import Phaser from 'phaser';
import { FONT_TITLE_STACK, FONT_UI_STACK } from '../../core/fonts';
import type { RandomSource } from '../../match/rng';
import { ensureCanvasTexture } from '../views/draw';
import { t as str } from '../../ui/strings';
import { FxDirector } from './FxDirector';

/** Ondas sob os inimigos (5), feixes sobre eles, partículas e números acima dos orbes (10). */
const DEPTH_WAVES = 4;
const DEPTH_BEAMS = 6;
const DEPTH_PARTS = 11;
const DEPTH_FLOATS = 12;
/** Contador de combo acima de tudo do mundo; brilho aditivo por cima do texto nítido. */
const DEPTH_COMBO = 13;
const COMBO_PX = 26;
const COMBO_LABEL_PX = 11;
/** Escala do texto de brilho sobre o nítido. */
const COMBO_GLOW_SCALE = 1;
const LINE_W = 3;
/** Passada de brilho (bloom leve): traço largo e fraco sob o traço nítido, em mistura aditiva. */
const GLOW_W = 9;
const GLOW_ALPHA = 0.28;
const ZIG_PX = 16;
/** Pontos intermediários do zigue-zague do raio. */
const ZIG_POINTS = 3;
/** Textura da partícula: núcleo claro + halo radial; o sprite é GLOW_SCALE× o tamanho do núcleo. */
const PART_TEX = 'fx_spark_glow';
const PART_TEX_PX = 32;
const GLOW_SCALE = 3.2;

/**
 * Desenho dos efeitos do FxDirector. Objetos criados uma vez; por frame só reposiciona e redesenha.
 * Partículas, feixes e ondas em mistura aditiva (decisão 41); as partículas são sprites de uma textura
 * de brilho com tint (um lote só no WebGL), sem filtros de pós-processamento (custo no celular).
 */
export class FxLayer {
  readonly fx: FxDirector;
  private readonly rng: RandomSource;
  private readonly waveG: Phaser.GameObjects.Graphics;
  private readonly beamG: Phaser.GameObjects.Graphics;
  private readonly parts: Phaser.GameObjects.Image[] = [];
  private readonly partTint: Uint32Array;
  private readonly texts: Phaser.GameObjects.Text[] = [];
  private readonly textVersion: Uint32Array;
  private readonly textSize: Float32Array;
  private readonly textColor: Uint32Array;
  private readonly css = new Map<number, string>();
  private drawn = { waves: 0, beams: 0, parts: 0 };
  private readonly zig = new Float32Array(ZIG_POINTS * 2);
  private readonly comboNum: Phaser.GameObjects.Text;
  private readonly comboGlow: Phaser.GameObjects.Text;
  private readonly comboLabel: Phaser.GameObjects.Text;
  private comboVersion = -1;

  constructor(scene: Phaser.Scene, rng: RandomSource, res: number) {
    this.rng = rng;
    this.fx = new FxDirector(rng);
    const ADD = Phaser.BlendModes.ADD;
    this.waveG = scene.add.graphics().setDepth(DEPTH_WAVES).setBlendMode(ADD);
    this.beamG = scene.add.graphics().setDepth(DEPTH_BEAMS).setBlendMode(ADD);
    const S = PART_TEX_PX;
    const key = ensureCanvasTexture(scene, PART_TEX, S, S, res, (ctx) => {
      const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.16, 'rgba(255,255,255,0.95)');
      g.addColorStop(0.32, 'rgba(255,255,255,0.35)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, S, S);
    });
    const pc = this.fx.particles.capacity;
    this.partTint = new Uint32Array(pc);
    for (let i = 0; i < pc; i++) {
      this.parts.push(scene.add.image(0, 0, key).setDepth(DEPTH_PARTS).setBlendMode(ADD).setVisible(false));
    }
    const n = this.fx.floats.capacity;
    this.textVersion = new Uint32Array(n);
    this.textSize = new Float32Array(n);
    this.textColor = new Uint32Array(n);
    for (let i = 0; i < n; i++) {
      this.texts.push(
        scene.add
          .text(0, 0, '', { fontFamily: FONT_UI_STACK, fontSize: '12px', fontStyle: '800', color: '#ffffff', resolution: res })
          .setOrigin(0.5, 1)
          .setDepth(DEPTH_FLOATS)
          .setVisible(false),
      );
    }
    const title = (px: number, weight: string) =>
      scene.add
        .text(0, 0, '', { fontFamily: FONT_TITLE_STACK, fontSize: `${px}px`, fontStyle: weight, color: '#ffffff', resolution: res })
        .setOrigin(0.5, 0.5)
        .setDepth(DEPTH_COMBO)
        .setVisible(false);
    this.comboNum = title(COMBO_PX, '900').setStroke('#070912', 4);
    this.comboGlow = title(COMBO_PX, '900').setBlendMode(ADD);
    this.comboLabel = title(COMBO_LABEL_PX, '700').setText(str('fx.combo')).setStroke('#070912', 3);
  }

  /** Redesenha o estado atual dos pools (chamar depois de fx.step). */
  render(): void {
    const fx = this.fx;

    const w = fx.waves;
    if (w.count > 0 || this.drawn.waves > 0) {
      const g = this.waveG.clear();
      for (let i = 0; i < w.count; i++) {
        const a = w.alpha(i);
        g.lineStyle(GLOW_W, w.color[i]!, a * GLOW_ALPHA).strokeCircle(w.x[i]!, w.y[i]!, w.r[i]!);
        g.lineStyle(LINE_W, w.color[i]!, a).strokeCircle(w.x[i]!, w.y[i]!, w.r[i]!);
      }
      this.drawn.waves = w.count;
    }

    const b = fx.beams;
    if (b.count > 0 || this.drawn.beams > 0) {
      const g = this.beamG.clear();
      for (let i = 0; i < b.count; i++) {
        const x1 = b.x1[i]!;
        const y1 = b.y1[i]!;
        const x2 = b.x2[i]!;
        const y2 = b.y2[i]!;
        const a = b.alpha(i);
        const col = b.color[i]!;
        if (b.zig[i]) {
          // Mesmo zigue-zague nas duas passadas: sorteia os pontos uma vez por frame.
          for (let k = 0; k < ZIG_POINTS; k++) {
            const f = (k + 1) / (ZIG_POINTS + 1);
            this.zig[k * 2] = x1 + (x2 - x1) * f + (this.rng.next() - 0.5) * ZIG_PX;
            this.zig[k * 2 + 1] = y1 + (y2 - y1) * f + (this.rng.next() - 0.5) * ZIG_PX;
          }
          for (let pass = 0; pass < 2; pass++) {
            if (pass === 0) g.lineStyle(GLOW_W, col, a * GLOW_ALPHA);
            else g.lineStyle(LINE_W, col, a);
            g.beginPath().moveTo(x1, y1);
            for (let k = 0; k < ZIG_POINTS; k++) g.lineTo(this.zig[k * 2]!, this.zig[k * 2 + 1]!);
            g.lineTo(x2, y2).strokePath();
          }
        } else {
          g.lineStyle(GLOW_W, col, a * GLOW_ALPHA).lineBetween(x1, y1, x2, y2);
          g.lineStyle(LINE_W, col, a).lineBetween(x1, y1, x2, y2);
        }
      }
      this.drawn.beams = b.count;
    }

    const p = fx.particles;
    if (p.count > 0 || this.drawn.parts > 0) {
      for (let i = 0; i < p.count; i++) {
        const img = this.parts[i]!;
        const col = p.color[i]!;
        if (this.partTint[i] !== col || !img.visible) {
          this.partTint[i] = col;
          img.setTint(col);
        }
        const d = p.drawSize(i) * GLOW_SCALE;
        img.setPosition(p.x[i]!, p.y[i]!).setDisplaySize(d, d).setAlpha(p.alpha(i));
        if (!img.visible) img.setVisible(true);
      }
      for (let i = p.count; i < this.drawn.parts; i++) this.parts[i]!.setVisible(false);
      this.drawn.parts = p.count;
    }

    const f = fx.floats;
    for (let i = 0; i < f.capacity; i++) {
      const t = this.texts[i]!;
      if (!f.alive(i)) {
        if (t.visible) t.setVisible(false);
        continue;
      }
      if (this.textVersion[i] !== f.version[i]) {
        this.textVersion[i] = f.version[i]!;
        const size = f.size[i]!;
        if (this.textSize[i] !== size) {
          this.textSize[i] = size;
          t.setFontSize(size);
        }
        const col = f.color[i]!;
        if (this.textColor[i] !== col) {
          this.textColor[i] = col;
          t.setColor(this.cssOf(col));
        }
        t.setText(f.text[i]!).setVisible(true);
      }
      t.setPosition(f.x[i]!, f.y[i]!).setAlpha(f.alpha(i));
    }

    this.renderCombo();
  }

  private renderCombo(): void {
    const c = this.fx.comboCounter;
    const num = this.comboNum;
    const glow = this.comboGlow;
    const label = this.comboLabel;
    if (!c.visible) {
      if (num.visible) {
        num.setVisible(false);
        glow.setVisible(false);
        label.setVisible(false);
      }
      return;
    }
    if (this.comboVersion !== c.version) {
      this.comboVersion = c.version;
      const txt = c.ending ? `${str('fx.combo')} ×${c.value}!` : `×${c.value}`;
      const css = this.cssOf(c.color);
      num.setText(txt).setColor(css).setVisible(true);
      glow.setText(txt).setColor(css).setVisible(true);
      label.setColor(css).setVisible(!c.ending);
    }
    const s = c.scale;
    const a = c.alpha;
    num.setPosition(c.x, c.y).setScale(s).setAlpha(a);
    glow.setPosition(c.x, c.y).setScale(s * COMBO_GLOW_SCALE).setAlpha(c.glow);
    if (!c.ending) label.setPosition(c.x, c.y - (COMBO_PX * 0.5 + COMBO_LABEL_PX * 0.5 + 1) * s).setScale(Math.sqrt(s)).setAlpha(a * 0.9);
  }

  private cssOf(col: number): string {
    let s = this.css.get(col);
    if (!s) {
      s = '#' + col.toString(16).padStart(6, '0');
      this.css.set(col, s);
    }
    return s;
  }
}
