import Phaser from 'phaser';
import { FONT_UI_STACK } from '../../core/fonts';
import type { RandomSource } from '../../match/rng';
import { FxDirector } from './FxDirector';

/** Ondas sob os inimigos (5), feixes sobre eles, partículas e números acima dos orbes (10). */
const DEPTH_WAVES = 4;
const DEPTH_BEAMS = 6;
const DEPTH_PARTS = 11;
const DEPTH_FLOATS = 12;
const PART_SIZE = 3.5;
const LINE_W = 3;
const ZIG_PX = 16;

/** Desenho dos efeitos do FxDirector. Objetos criados uma vez; por frame só reposiciona e redesenha. */
export class FxLayer {
  readonly fx: FxDirector;
  private readonly rng: RandomSource;
  private readonly waveG: Phaser.GameObjects.Graphics;
  private readonly beamG: Phaser.GameObjects.Graphics;
  private readonly partG: Phaser.GameObjects.Graphics;
  private readonly texts: Phaser.GameObjects.Text[] = [];
  private readonly textVersion: Uint32Array;
  private readonly textSize: Float32Array;
  private readonly textColor: Uint32Array;
  private readonly css = new Map<number, string>();
  private drawn = { waves: 0, beams: 0, parts: 0 };

  constructor(scene: Phaser.Scene, rng: RandomSource, res: number) {
    this.rng = rng;
    this.fx = new FxDirector(rng);
    this.waveG = scene.add.graphics().setDepth(DEPTH_WAVES);
    this.beamG = scene.add.graphics().setDepth(DEPTH_BEAMS);
    this.partG = scene.add.graphics().setDepth(DEPTH_PARTS);
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
  }

  /** Redesenha o estado atual dos pools (chamar depois de fx.step). */
  render(): void {
    const fx = this.fx;

    const w = fx.waves;
    if (w.count > 0 || this.drawn.waves > 0) {
      const g = this.waveG.clear();
      for (let i = 0; i < w.count; i++) {
        g.lineStyle(LINE_W, w.color[i]!, w.alpha(i)).strokeCircle(w.x[i]!, w.y[i]!, w.r[i]!);
      }
      this.drawn.waves = w.count;
    }

    const b = fx.beams;
    if (b.count > 0 || this.drawn.beams > 0) {
      const g = this.beamG.clear();
      for (let i = 0; i < b.count; i++) {
        g.lineStyle(LINE_W, b.color[i]!, b.alpha(i)).beginPath().moveTo(b.x1[i]!, b.y1[i]!);
        if (b.zig[i]) {
          const mx = (b.x1[i]! + b.x2[i]!) / 2 + (this.rng.next() - 0.5) * ZIG_PX;
          const my = (b.y1[i]! + b.y2[i]!) / 2 + (this.rng.next() - 0.5) * ZIG_PX;
          g.lineTo(mx, my);
        }
        g.lineTo(b.x2[i]!, b.y2[i]!).strokePath();
      }
      this.drawn.beams = b.count;
    }

    const p = fx.particles;
    if (p.count > 0 || this.drawn.parts > 0) {
      const g = this.partG.clear();
      for (let i = 0; i < p.count; i++) {
        g.fillStyle(p.color[i]!, p.alpha(i)).fillRect(p.x[i]!, p.y[i]!, PART_SIZE, PART_SIZE);
      }
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
