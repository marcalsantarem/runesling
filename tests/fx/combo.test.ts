import { describe, expect, it } from 'vitest';
import { Rng } from '../../src/match/rng';
import {
  COMBO_END_FRAMES,
  COMBO_MIN,
  COMBO_PULSE,
  COMBO_PULSE_TIER,
  COMBO_SCALE_MAX,
  COMBO_TIERS,
  COMBO_X,
  COMBO_Y,
  ComboCounter,
  comboBaseScale,
  comboColor,
  comboTier,
} from '../../src/scenes/fx/combo';
import { FxDirector } from '../../src/scenes/fx/FxDirector';
import { COLOR } from '../../src/scenes/views/palette';

describe('fx — contador de combo', () => {
  it('degraus de cor e escala por faixa, com limites nas bordas', () => {
    expect(comboTier(0)).toBe(-1);
    expect(comboTier(1)).toBe(-1);
    expect(comboTier(2)).toBe(0);
    expect(comboTier(4)).toBe(0);
    expect(comboTier(5)).toBe(1);
    expect(comboTier(9)).toBe(1);
    expect(comboTier(10)).toBe(2);
    expect(comboTier(20)).toBe(3);
    expect(comboTier(40)).toBe(4);
    expect(comboTier(9999)).toBe(COMBO_TIERS.length - 1);
    expect(comboColor(2)).toBe(COLOR.cyan);
    expect(comboColor(5)).toBe(COLOR.gold);
    expect(comboColor(12)).toBe(COLOR.magma);
    expect(comboColor(1)).toBe(COLOR.white);
    for (let i = 1; i < COMBO_TIERS.length; i++) {
      expect(COMBO_TIERS[i]!.min).toBeGreaterThan(COMBO_TIERS[i - 1]!.min);
      expect(COMBO_TIERS[i]!.scale).toBeGreaterThan(COMBO_TIERS[i - 1]!.scale);
    }
    expect(comboBaseScale(40, false)).toBe(COMBO_TIERS[4]!.scale);
    expect(comboBaseScale(40, true)).toBe(1);
  });

  it('aparece a partir do 2º acerto, pulsa ao subir e é idempotente no mesmo valor', () => {
    const c = new ComboCounter();
    c.set(1);
    expect(c.visible).toBe(false);
    c.set(COMBO_MIN);
    expect(c.visible).toBe(true);
    expect(c.pulse).toBe(COMBO_PULSE_TIER); // entrou na 1ª faixa
    c.step(30);
    expect(c.pulse).toBe(0);
    const v = c.version;
    c.set(COMBO_MIN);
    expect(c.version).toBe(v);
    expect(c.pulse).toBe(0);
    c.set(3);
    expect(c.pulse).toBe(COMBO_PULSE);
    expect(c.scale).toBeCloseTo(1 + COMBO_PULSE, 5);
    c.step(30);
    c.set(5);
    expect(c.pulse).toBe(COMBO_PULSE_TIER);
    c.set(999);
    expect(c.scale).toBeLessThanOrEqual(COMBO_SCALE_MAX);
  });

  it('fecho no fim do turno: sobe, esmaece e some; ignora o resto do turno e o início do próximo', () => {
    const c = new ComboCounter();
    c.set(12);
    c.end();
    expect(c.ending).toBe(true);
    expect(c.value).toBe(12);
    c.set(12);
    c.set(0);
    c.set(1);
    expect(c.ending).toBe(true);
    c.step(10);
    expect(c.y).toBeLessThan(COMBO_Y);
    expect(c.alpha).toBe(1);
    c.step(COMBO_END_FRAMES - 12);
    expect(c.alpha).toBeGreaterThan(0);
    expect(c.alpha).toBeLessThan(1);
    c.step(5);
    expect(c.visible).toBe(false);
    expect(c.y).toBe(COMBO_Y);
  });

  it('novo combo ≥ 2 durante o fecho reinicia o contador; turno de 1 acerto não mostra fecho', () => {
    const c = new ComboCounter();
    c.set(12);
    c.end();
    c.step(5);
    c.set(2);
    expect(c.ending).toBe(false);
    expect(c.value).toBe(2);
    expect(c.y).toBe(COMBO_Y);
    const d = new ComboCounter();
    d.set(1);
    d.end();
    expect(d.visible).toBe(false);
    d.set(2);
    expect(d.visible).toBe(true);
  });

  it('âncora x/y opcional, limitada à arena', () => {
    const c = new ComboCounter();
    c.set(2);
    expect([c.x, c.y]).toEqual([COMBO_X, COMBO_Y]);
    c.set(3, -50, 2000);
    expect(c.x).toBeGreaterThan(0);
    expect(c.x).toBeLessThan(180);
    expect(c.y).toBeLessThan(436);
  });

  it('reduzir movimento: sem pulso, sem escala e sem subida no fecho (só o número)', () => {
    const fx = new FxDirector(new Rng(1));
    fx.combo(2);
    expect(fx.comboCounter.pulse).toBeGreaterThan(0);
    fx.setReducedMotion(true);
    expect(fx.comboCounter.pulse).toBe(0);
    fx.combo(25);
    expect(fx.comboCounter.pulse).toBe(0);
    expect(fx.comboCounter.scale).toBe(1);
    expect(fx.comboCounter.color).toBe(COLOR.crimson);
    fx.comboEnd();
    expect(fx.comboCounter.pulse).toBe(0);
    fx.step(20);
    expect(fx.comboCounter.y).toBe(COMBO_Y);
    expect(fx.comboCounter.scale).toBe(1);
    fx.step(COMBO_END_FRAMES);
    expect(fx.comboCounter.visible).toBe(false);
  });

  it('FxDirector.clear zera o contador', () => {
    const fx = new FxDirector(new Rng(1));
    fx.combo(7);
    fx.clear();
    expect(fx.comboCounter.visible).toBe(false);
    expect(fx.comboCounter.value).toBe(0);
  });
});
