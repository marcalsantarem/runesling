/**
 * Contador de combo durante o voo (decisão 41). Lógica pura, sem Phaser: o desenho fica em FxLayer.
 * Aparece a partir do 2º acerto do turno; cor e escala sobem por faixa; pulso a cada acerto;
 * no fim do turno vira o "fecho" ("COMBO ×12!") que sobe e some. "Reduzir movimento" (decisão 42):
 * sem pulso, sem escala crescente e sem subida, só o número (cor da faixa e esmaecer continuam).
 */
import { COLOR } from '../views/palette';

/** Combo mínimo para o contador aparecer. */
export const COMBO_MIN = 2;
/** Posição padrão (mundo lógico 360×520): centro, entre os inimigos e a barreira (y 436). */
export const COMBO_X = 180;
export const COMBO_Y = 300;
/** Margens para manter o texto dentro da arena quando a cena passa x/y. */
const MARGIN_X = 70;
const MARGIN_TOP = 40;
const MARGIN_BOTTOM = 400;

/** Faixas: a partir de `min` acertos, cor e escala base. */
export const COMBO_TIERS = [
  { min: 2, color: COLOR.cyan, scale: 1 },
  { min: 5, color: COLOR.gold, scale: 1.15 },
  { min: 10, color: COLOR.magma, scale: 1.3 },
  { min: 20, color: COLOR.crimson, scale: 1.45 },
  { min: 40, color: COLOR.violet, scale: 1.6 },
] as const;

/** Pulso: escala extra no acerto, maior ao subir de faixa; decai por frame. */
export const COMBO_PULSE = 0.28;
export const COMBO_PULSE_TIER = 0.55;
export const COMBO_PULSE_DECAY = 0.78;
const PULSE_EPS = 0.004;
/** Teto da escala total (base + pulso). */
export const COMBO_SCALE_MAX = 2.1;
/** Fecho: duração (frames), subida (px/frame) e pop inicial. */
export const COMBO_END_FRAMES = 54;
export const COMBO_END_RISE = 0.55;
export const COMBO_END_POP = 0.45;
/** Frames finais do fecho em que o alfa cai até 0. */
const END_FADE = 24;
/**
 * Faixa do anúncio de onda (fita HTML centrada no campo, 54 px CSS, ~1,8 s): em mundo lógico,
 * y 260 ± 36 (folga para telas estreitas). Com o banner ativo, o fecho desce para
 * COMBO_SAFE_Y, abaixo da faixa (o contador ao vivo não muda): mesmo no pop máximo e após a subida, o texto não a alcança.
 */
export const BANNER_BAND_TOP = 224;
export const BANNER_BAND_BOTTOM = 296;
export const COMBO_SAFE_Y = 356;
/** Duração do banner em frames (BANNER_MS 1800 da UI a 60 FPS). */
export const BANNER_FRAMES = 108;

/** Índice da faixa do combo `n` (−1 abaixo de COMBO_MIN). */
export function comboTier(n: number): number {
  let k = -1;
  for (let i = 0; i < COMBO_TIERS.length; i++) if (n >= COMBO_TIERS[i]!.min) k = i;
  return k;
}

export function comboColor(n: number): number {
  const k = comboTier(n);
  return k < 0 ? COLOR.white : COMBO_TIERS[k]!.color;
}

/** Escala base da faixa (1 com movimento reduzido). */
export function comboBaseScale(n: number, reduced: boolean): number {
  const k = comboTier(n);
  return reduced || k < 0 ? 1 : COMBO_TIERS[k]!.scale;
}

export const COMBO_STATE = { hidden: 0, live: 1, ending: 2 } as const;
export type ComboState = (typeof COMBO_STATE)[keyof typeof COMBO_STATE];

export class ComboCounter {
  /** Combo exibido (o do turno). */
  value = 0;
  state: ComboState = COMBO_STATE.hidden;
  /** Escala extra do pulso (0 parado). */
  pulse = 0;
  x = COMBO_X;
  y = COMBO_Y;
  /** Frames restantes do fecho. */
  endLeft = 0;
  /** Sobe a cada mudança de texto/cor (o desenho só refaz o texto quando muda). */
  version = 0;
  reduced = false;
  /** Frames restantes do banner de onda (0 = sem banner). */
  bannerLeft = 0;

  /** Banner de onda apareceu: por `frames`, o combo fica abaixo da faixa (se o fecho já começou, desce na hora). */
  banner(frames = BANNER_FRAMES): void {
    this.bannerLeft = Math.max(0, frames);
    if (this.ending) this.avoidBanner();
  }

  get bannerActive(): boolean {
    return this.bannerLeft > 0;
  }

  /** Com banner ativo, põe a âncora abaixo da faixa. */
  private avoidBanner(): void {
    if (this.bannerLeft > 0 && this.y < COMBO_SAFE_Y) this.y = COMBO_SAFE_Y;
  }

  /** Combo atual do turno; idempotente para o mesmo `n`. Pulsa só quando sobe. */
  set(n: number, x?: number, y?: number): void {
    n = Math.max(0, Math.floor(n));
    if (this.state === COMBO_STATE.ending) {
      // Repetição do valor final ou início do turno seguinte (< COMBO_MIN): o fecho segue.
      if (n < COMBO_MIN || n === this.value) return;
      this.reset();
    }
    if (x !== undefined) this.x = Math.min(360 - MARGIN_X, Math.max(MARGIN_X, x));
    if (y !== undefined) this.y = Math.min(MARGIN_BOTTOM, Math.max(MARGIN_TOP, y));
    const prev = this.value;
    if (n === prev) return;
    this.value = n;
    if (n < COMBO_MIN) {
      if (this.state !== COMBO_STATE.hidden) this.version++;
      this.state = COMBO_STATE.hidden;
      this.pulse = 0;
      return;
    }
    const tierUp = comboTier(n) > comboTier(prev);
    this.state = COMBO_STATE.live;
    this.version++;
    if (!this.reduced && n > prev) this.pulse = Math.max(this.pulse, tierUp ? COMBO_PULSE_TIER : COMBO_PULSE);
  }

  /** Fim do turno: com combo ≥ COMBO_MIN vira o fecho; senão só some. */
  end(): void {
    if (this.state === COMBO_STATE.live) {
      this.state = COMBO_STATE.ending;
      this.endLeft = COMBO_END_FRAMES;
      this.pulse = this.reduced ? 0 : COMBO_END_POP;
      this.avoidBanner();
      this.version++;
    } else if (this.state === COMBO_STATE.hidden) {
      this.value = 0;
    }
  }

  step(frames: number): void {
    if (frames > 0 && this.bannerLeft > 0) this.bannerLeft = Math.max(0, this.bannerLeft - frames);
    if (frames <= 0 || this.state === COMBO_STATE.hidden) return;
    if (this.pulse > 0) {
      this.pulse *= Math.pow(COMBO_PULSE_DECAY, frames);
      if (this.pulse < PULSE_EPS) this.pulse = 0;
    }
    if (this.state === COMBO_STATE.ending) {
      const f = Math.min(frames, this.endLeft);
      if (!this.reduced) this.y -= COMBO_END_RISE * f;
      this.endLeft -= f;
      if (this.endLeft <= 0) this.reset();
    }
  }

  get visible(): boolean {
    return this.state !== COMBO_STATE.hidden;
  }

  get ending(): boolean {
    return this.state === COMBO_STATE.ending;
  }

  get color(): number {
    return comboColor(this.value);
  }

  /** Escala de desenho: base da faixa + pulso, limitada; 1 com movimento reduzido. */
  get scale(): number {
    if (this.reduced) return 1;
    return Math.min(COMBO_SCALE_MAX, comboBaseScale(this.value, false) + this.pulse);
  }

  /** Alfa: cheio no voo; no fecho cai nos últimos END_FADE frames. */
  get alpha(): number {
    if (this.state === COMBO_STATE.hidden) return 0;
    if (this.state === COMBO_STATE.live) return 1;
    return Math.min(1, this.endLeft / END_FADE);
  }

  /** Intensidade do brilho aditivo (0..1): base pela faixa + pulso. */
  get glow(): number {
    if (this.state === COMBO_STATE.hidden) return 0;
    const k = Math.max(0, comboTier(this.value));
    const g = 0.3 + 0.1 * k + (this.reduced ? 0 : this.pulse);
    return Math.min(1, g) * this.alpha;
  }

  reset(): void {
    if (this.state !== COMBO_STATE.hidden) this.version++;
    this.state = COMBO_STATE.hidden;
    this.value = 0;
    this.pulse = 0;
    this.endLeft = 0;
    this.x = COMBO_X;
    this.y = COMBO_Y;
  }
}
