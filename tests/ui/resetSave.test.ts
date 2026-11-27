// @vitest-environment happy-dom
// TEMP T-061: remover antes do M7 junto com o botão "Resetar save".
import { afterEach, describe, expect, it } from 'vitest';
import { flush, setup, type Harness } from './helpers';

let h: Harness;
afterEach(() => h?.ui.destroy());

describe('botão temporário Resetar save (T-061)', () => {
  it('pede confirmação; cancelar não apaga, confirmar zera e atualiza a tela inicial', async () => {
    h = await setup();
    h.bus.emit('app:ready', {});
    await h.profile.recordRun({ wave: 9, won: false, goldEarned: 500 });
    await h.profile.buyTalent('atk');
    await h.profile.updateSettings({ muted: true });
    expect(h.q('menu-gold').textContent).not.toBe('40');
    expect(h.visible('nav-talents-badge')).toBe(true);

    expect(h.visible('modal-reset')).toBe(false);
    h.click('menu-reset');
    expect(h.visible('modal-reset')).toBe(true);
    h.click('reset-cancel');
    expect(h.visible('modal-reset')).toBe(false);
    expect(h.profile.data().talents.atk).toBe(1);

    h.click('menu-reset');
    h.click('reset-confirm');
    await flush();
    expect(h.visible('modal-reset')).toBe(false);
    expect(h.profile.data()).toMatchObject({ gold: 40, bestWave: 0, talents: { atk: 0 }, settings: { muted: true } });
    expect(h.q('menu-gold').textContent).toBe('40');
    expect(h.q('menu-best').textContent).toBe('0/15');
    expect(h.q('menu-atk').textContent).toBe('3');
  });
});
