// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import { loadGameData } from '../../src/data/types';
import { computeFieldRect } from '../../src/ui/layout';
import { startStats } from '../../src/ui/menu';
import { flush, setup, type Harness } from './helpers';

let h: Harness;
afterEach(() => h?.ui.destroy());

describe('Talentos', () => {
  it('lista os 5 talentos com nível, custo e compra', async () => {
    h = await setup();
    h.bus.emit('app:ready', {});
    h.click('nav-talents');
    expect(h.visible('tab-talents')).toBe(true);
    expect(h.visible('tab-play')).toBe(false);
    for (const id of ['atk', 'hp', 'balls', 'crit', 'gold']) expect(h.visible(`talent-${id}`)).toBe(true);

    const buyAtk = h.q<HTMLButtonElement>('talent-buy-atk');
    expect(buyAtk.textContent).toBe('25');
    expect(buyAtk.disabled).toBe(false);
    expect(h.q<HTMLButtonElement>('talent-buy-balls').disabled).toBe(true); // 75 G > 40 G

    buyAtk.click();
    await flush();
    expect(h.profile.talentLevel('atk')).toBe(1);
    expect(h.q('menu-gold').textContent).toBe('15');
    expect(h.q('talent-lv-atk').textContent).toBe('Nv. 1/10');
    expect(h.q('talent-buy-atk').textContent).toBe('45');
    expect(h.q<HTMLButtonElement>('talent-buy-atk').disabled).toBe(true);
    expect(h.q('menu-atk').textContent).toBe('4');
  });

  it('talento no máximo mostra MÁX e fica desabilitado', async () => {
    h = await setup();
    await h.profile.recordRun({ wave: 1, won: false, goldEarned: 10_000 });
    h.bus.emit('app:ready', {});
    for (let i = 0; i < 3; i++) {
      h.click('talent-buy-balls');
      await flush();
    }
    const btn = h.q<HTMLButtonElement>('talent-buy-balls');
    expect(btn.textContent).toBe('MÁX');
    expect(btn.disabled).toBe(true);
    expect(h.q('menu-orbs').textContent).toBe('5');
  });

  it('atributos iniciais somam os talentos', () => {
    const s = startStats({ atk: 2, hp: 3, balls: 1, crit: 2, gold: 0 }, loadGameData());
    expect(s).toMatchObject({ atk: 5, hp: 18, orbs: 3 });
    expect(s.critChance).toBeCloseTo(0.15);
  });
});

describe('layout do campo', () => {
  it('retrato 390×844: faixas de ~140 px acima e abaixo do mundo 360×520', () => {
    const r = computeFieldRect(390, 844, 360, 520);
    expect(r.w).toBe(390);
    expect(r.h).toBeCloseTo(563.3, 1);
    expect(r.y).toBeCloseTo(140.3, 1);
  });

  it('paisagem: campo centrado na horizontal', () => {
    const r = computeFieldRect(1280, 720, 360, 520);
    expect(r.h).toBe(720);
    expect(r.y).toBe(0);
    expect(r.x).toBeCloseTo((1280 - 498.46) / 2, 1);
  });

  it('root sem tamanho não quebra', () => {
    expect(computeFieldRect(0, 0, 360, 520)).toEqual({ x: 0, y: 0, w: 0, h: 0 });
  });
});
