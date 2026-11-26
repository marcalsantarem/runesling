import Phaser from 'phaser';
import { FONT_UI_STACK } from '../../core/fonts';
import type { EnemyDef } from '../../data/types';
import type { EnemyState } from '../../match/RunState';
import { hitFlashFrames, SQUASH_PEAK, squashScale } from '../fx/fxMath';
import { ensureCanvasTexture, glowTexture } from './draw';
import { COLOR, CSS, DEFAULT_ENEMY_PALETTE, ENEMY_PALETTES, type EnemyPalette } from './palette';

/** Fração do caminho até a posição lógica por frame (avanço suave no fim do turno). */
const FOLLOW = 0.2;
const DEPTH_ENEMY = 5;
const FLASH_FRAMES = hitFlashFrames();

type Face = 'slits' | 'eye' | 'cross';

/** Detalhe interno por `spriteKey` (o resto usa as duas fendas do slice). */
const FACES: { readonly [spriteKey: string]: Face } = {
  enemy_healer: 'cross',
  enemy_shooter: 'eye',
};

/** Sprites com chifres (Chefe Final do slice). */
const HORNED = new Set(['boss_obsidian']);

/** Meia largura da textura do corpo (chifres do chefe passam do raio). */
export function bodyHalfSize(def: EnemyDef): number {
  return HORNED.has(def.spriteKey) ? def.radius * 1.45 + 2 : def.radius + 3;
}

/** Medalhão procedural (decisão 19): gradiente metálico, aro, rosto e chifres. Desenha com origem no centro. */
function paintMedallion(ctx: CanvasRenderingContext2D, def: EnemyDef, pal: EnemyPalette): void {
  const r = def.radius;
  if (HORNED.has(def.spriteKey)) {
    ctx.fillStyle = '#2d1424';
    ctx.strokeStyle = CSS.gold;
    ctx.lineWidth = 1.8;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(-22 * s, -20);
      ctx.quadraticCurveTo(-44 * s, -38, -34 * s, -50);
      ctx.quadraticCurveTo(-20 * s, -32, -8 * s, -28);
      ctx.fill();
      ctx.stroke();
    }
  }
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.35, 3, 0, 0, r);
  grad.addColorStop(0, pal.col1);
  grad.addColorStop(1, pal.col2);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = pal.rim;
  ctx.lineWidth = def.isBoss ? 3 : 2;
  ctx.stroke();
  ctx.fillStyle = pal.eye;
  const face = FACES[def.spriteKey] ?? 'slits';
  if (face === 'cross') {
    ctx.fillRect(-6, -8, 12, 3);
    ctx.fillRect(-1.5, -12.5, 3, 12);
  } else if (face === 'eye') {
    ctx.beginPath();
    ctx.arc(0, -5, 4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(-7, -7, 4.5, 3);
    ctx.fillRect(2.5, -7, 4.5, 3);
  }
}

/** Textura do corpo: a chave é o `spriteKey` do JSON (no M4 o sprite real ocupa a mesma chave). */
export function enemyBodyTexture(scene: Phaser.Scene, def: EnemyDef, res: number): string {
  const h = bodyHalfSize(def);
  const pal = ENEMY_PALETTES[def.spriteKey] ?? DEFAULT_ENEMY_PALETTE;
  return ensureCanvasTexture(scene, def.spriteKey, h * 2, h * 2, res, (ctx) => {
    ctx.translate(h, h);
    paintMedallion(ctx, def, pal);
  });
}

function shieldTexture(scene: Phaser.Scene, r: number, res: number): string {
  const h = r + 14;
  return ensureCanvasTexture(scene, `fx_shield_${r}`, h * 2, h * 2, res, (ctx) => {
    ctx.translate(h, h);
    ctx.strokeStyle = CSS.cyan;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.shadowColor = CSS.cyan;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 2, r + 3.5, 0.16 * Math.PI, 0.84 * Math.PI);
    ctx.stroke();
  });
}

/** Medalhão de um inimigo: corpo, aura (chefe/queimando), choque, escudo frontal, placa de HP e contador do atirador. */
export class EnemyView {
  readonly id: number;
  private readonly root: Phaser.GameObjects.Container;
  private readonly aura: Phaser.GameObjects.Image | null;
  private readonly body: Phaser.GameObjects.Image;
  private readonly shock: Phaser.GameObjects.Graphics;
  private readonly plate: Phaser.GameObjects.Graphics;
  private readonly hpText: Phaser.GameObjects.Text;
  private readonly cdText: Phaser.GameObjects.Text | null;
  private readonly def: EnemyDef;
  private readonly burnKey: string;
  private readonly bossKey: string;
  private hp = NaN;
  private hpDigits = 0;
  private cd = NaN;
  private burning = false;
  /** Frames de hit-flash restantes e escala do squash (GDD §6.3). */
  private flash = 0;
  private tinted = false;
  private scale = 1;
  /** Marca de varredura usada pela cena para descartar views de inimigos mortos. */
  seen = 0;

  constructor(scene: Phaser.Scene, en: EnemyState, res: number) {
    const def = en.def;
    const r = def.radius;
    this.id = en.id;
    this.def = def;
    this.root = scene.add.container(en.x, en.y).setDepth(DEPTH_ENEMY);

    this.bossKey = glowTexture(scene, 'fx_glow_boss', 'rgba(255,94,87,0.32)', res);
    this.burnKey = glowTexture(scene, 'fx_glow_burn', 'rgba(255,159,67,0.42)', res);
    const auraSize = (r + 16) * 2;
    this.aura = scene.add.image(0, 0, this.bossKey).setDisplaySize(auraSize, auraSize).setVisible(!!def.isBoss);
    this.root.add(this.aura);

    const h = bodyHalfSize(def);
    this.body = scene.add.image(0, 0, enemyBodyTexture(scene, def, res)).setDisplaySize(h * 2, h * 2);
    this.root.add(this.body);

    this.shock = scene.add.graphics().lineStyle(def.isBoss ? 3 : 2, COLOR.cyan, 1).strokeCircle(0, 0, r).setVisible(false);
    this.root.add(this.shock);

    if (en.frontShield) {
      const sh = (r + 14) * 2;
      this.root.add(scene.add.image(0, 0, shieldTexture(scene, r, res)).setDisplaySize(sh, sh));
    }

    this.plate = scene.add.graphics();
    this.hpText = scene.add
      .text(0, r - 6, '', { fontFamily: FONT_UI_STACK, fontSize: '10.5px', fontStyle: '800', color: CSS.white, resolution: res })
      .setOrigin(0.5);
    this.root.add([this.plate, this.hpText]);

    if (def.shoot) {
      this.root.add(scene.add.graphics().fillStyle(COLOR.crimson, 1).fillCircle(r - 2, -r + 2, 8.5));
      this.cdText = scene.add
        .text(r - 2, -r + 2.5, '', { fontFamily: FONT_UI_STACK, fontSize: '9.5px', fontStyle: '800', color: CSS.white, resolution: res })
        .setOrigin(0.5);
      this.root.add(this.cdText);
    } else {
      this.cdText = null;
    }
    this.update(en, 0);
  }

  get radius(): number {
    return this.def.radius;
  }

  /** Acerto: hit-flash branco (50 ms) e, com `squash`, escala 1.18× voltando exponencialmente. */
  hit(squash: boolean): void {
    this.flash = FLASH_FRAMES;
    if (squash) this.scale = SQUASH_PEAK;
  }

  update(en: EnemyState, frames: number): void {
    this.updateFeel(frames);
    const k = frames <= 0 ? 1 : Math.min(1, FOLLOW * frames);
    const dx = en.x - this.root.x;
    const dy = en.y - this.root.y;
    if (Math.abs(dx) + Math.abs(dy) < 0.1) this.root.setPosition(en.x, en.y);
    else this.root.setPosition(this.root.x + dx * k, this.root.y + dy * k);

    if (this.shock.visible !== en.shocked) this.shock.setVisible(en.shocked);

    if (this.aura && this.burning !== en.burning) {
      this.burning = en.burning;
      this.aura.setTexture(en.burning ? this.burnKey : this.bossKey).setVisible(en.burning || !!this.def.isBoss);
      const s = (this.def.radius + 16) * 2;
      this.aura.setDisplaySize(s, s);
    }

    const hp = Math.max(0, en.hp);
    if (hp !== this.hp) {
      this.hp = hp;
      const txt = String(hp);
      this.hpText.setText(txt);
      if (txt.length !== this.hpDigits) {
        this.hpDigits = txt.length;
        const w = Math.max(32, txt.length * 7 + 10);
        const r = this.def.radius;
        this.plate.clear().fillStyle(COLOR.plate, 0.85).fillRoundedRect(-w / 2, r - 13, w, 14, 6);
      }
    }

    if (this.cdText && en.shootCd !== this.cd) {
      this.cd = en.shootCd;
      this.cdText.setText(String(en.shootCd));
    }
  }

  private updateFeel(frames: number): void {
    const white = this.flash > 0;
    if (white !== this.tinted) {
      this.tinted = white;
      if (white) this.body.setTintFill(COLOR.white);
      else this.body.clearTint();
    }
    if (white) this.flash = Math.max(0, this.flash - frames);
    if (this.scale !== 1 || this.root.scale !== 1) {
      this.scale = squashScale(this.scale, frames);
      this.root.setScale(this.scale);
    }
  }

  destroy(): void {
    this.root.destroy();
  }
}
