// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BANNER_MS } from '../../src/ui/hud';
import { flush, runState, setup, type Harness } from './helpers';

let h: Harness;
afterEach(() => {
  h?.ui.destroy();
  vi.useRealTimers();
});

const names = () => h.emitted.map((e) => e.name);

async function inRun(): Promise<void> {
  h = await setup();
  h.bus.emit('app:ready', {});
  h.click('menu-play');
}

describe('fluxo de telas', () => {
  it('menu só aparece em app:ready; Jogar emite ui:startRun e mostra o HUD', async () => {
    h = await setup();
    expect(h.ui.screen()).toBe('boot');
    expect(h.visible('screen-menu')).toBe(false);
    h.bus.emit('app:ready', {});
    expect(h.visible('screen-menu')).toBe(true);
    expect(h.q('menu-gold').textContent).toBe('40');
    expect(h.q('menu-best').textContent).toBe('0 / 15');
    expect(h.q('menu-atk').textContent).toBe('3');
    expect(h.q('menu-hp').textContent).toBe('12');
    expect(h.q('menu-orbs').textContent).toBe('2');
    expect(h.q('menu-crit').textContent).toBe('5%');
    h.click('menu-play');
    expect(names()).toEqual(['ui:startRun']);
    expect(h.visible('screen-hud')).toBe(true);
    expect(h.visible('screen-menu')).toBe(false);
  });

  it('run:state atualiza HUD; Recolher só no voo; 2× e Recolher emitem', async () => {
    await inRun();
    h.bus.emit('run:state', runState({ hp: 7, maxHp: 14, wave: 4, gold: 33, atk: 5, orbs: 3, crit: 0.15 }));
    expect(h.q('hud-hp').textContent).toBe('7/14');
    expect(h.q('hud-wave').textContent).toBe('ONDA 4/15');
    expect(h.q('hud-gold').textContent).toBe('33');
    expect(h.q('hud-atk').textContent).toBe('5');
    expect(h.q('hud-orbs').textContent).toBe('3');
    expect(h.q('hud-crit').textContent).toBe('15%');
    expect(h.visible('hud-recall')).toBe(false);
    expect(h.q('hud-speed').textContent).toBe('1×');
    h.bus.emit('run:state', runState({ phase: 'flight', speed: 2 }));
    expect(h.visible('hud-recall')).toBe(true);
    expect(h.q('hud-speed').textContent).toBe('1,5×');
    expect(h.q('hud-speed').getAttribute('aria-label')).toBe('Alternar velocidade (atual 1,5×)');
    h.click('hud-recall');
    h.click('hud-speed');
    expect(names()).toEqual(['ui:startRun', 'ui:recall', 'ui:toggleSpeed']);
  });

  it('faixa de runas agrupa repetidas e usa a cor da sinergia', async () => {
    await inRun();
    h.bus.emit('run:state', runState({ perks: ['chain_lightning', 'extra_orb', 'extra_orb'] }));
    const tags = [...h.q('hud-runes').querySelectorAll('[data-perk]')];
    expect(tags.map((n) => n.getAttribute('data-perk'))).toEqual(['chain_lightning', 'extra_orb']);
    expect(tags[0]?.classList.contains('rs-syn-lightning')).toBe(true);
    expect(tags[1]?.textContent).toMatch(/×2$/);
  });

  it('draft: 3 cartas com sinergia; escolher emite ui:pickPerk e fecha', async () => {
    await inRun();
    h.bus.emit('draft:open', { choices: ['fire_splash', 'ghost_ball', 'power_surge'] });
    expect(h.visible('modal-draft')).toBe(true);
    const cards = [...h.q('modal-draft').querySelectorAll<HTMLButtonElement>('.rs-draft-card')];
    expect(cards).toHaveLength(3);
    expect(cards.map((c) => [...c.classList].find((k) => k.startsWith('rs-syn-')))).toEqual([
      'rs-syn-fire',
      'rs-syn-spectral',
      'rs-syn-core',
    ]);
    expect(cards[0]?.textContent).toContain('Ígnea');
    expect(h.q<HTMLButtonElement>('hud-pause').disabled).toBe(true);
    cards[1]?.click();
    cards[1]?.click();
    expect(h.emitted.filter((e) => e.name === 'ui:pickPerk')).toEqual([
      { name: 'ui:pickPerk', payload: { perkId: 'ghost_ball' } },
    ]);
    expect(h.visible('modal-draft')).toBe(false);
    expect(h.q<HTMLButtonElement>('hud-pause').disabled).toBe(false);
  });

  it('banner aparece e some sozinho', async () => {
    await inRun();
    vi.useFakeTimers();
    h.bus.emit('run:banner', { text: 'ONDA 5' });
    expect(h.visible('hud-banner')).toBe(true);
    expect(h.q('hud-banner').textContent).toBe('ONDA 5');
    vi.advanceTimersByTime(BANNER_MS + 1);
    expect(h.visible('hud-banner')).toBe(false);
  });

  it('fim de run: vitória e derrota; Menu emite ui:quitRun; Jogar de novo reinicia', async () => {
    await inRun();
    h.bus.emit('run:state', runState({ wave: 9 }));
    h.bus.emit('run:ended', { won: false, wave: 9, goldEarned: 57 });
    expect(h.visible('modal-end')).toBe(true);
    expect(h.q('end-title').textContent).toBe('BARREIRA ROMPIDA');
    expect(h.q('end-wave').textContent).toBe('9/15');
    expect(h.q('end-gold').textContent).toBe('+57');
    h.click('end-again');
    expect(names().slice(-1)).toEqual(['ui:startRun']);
    expect(h.visible('modal-end')).toBe(false);
    h.bus.emit('run:ended', { won: true, wave: 15, goldEarned: 300 });
    expect(h.q('end-title').textContent).toBe('CRIPTA CONQUISTADA');
    h.click('end-menu');
    expect(names().slice(-1)).toEqual(['ui:quitRun']);
    expect(h.ui.screen()).toBe('menu');
  });

  it('pausa: continuar, som e sair da run', async () => {
    await inRun();
    h.click('hud-pause');
    expect(h.visible('modal-pause')).toBe(true);
    expect(h.emitted.slice(-1)).toEqual([{ name: 'ui:pause', payload: { paused: true } }]);
    h.click('pause-resume');
    expect(h.visible('modal-pause')).toBe(false);
    expect(h.emitted.slice(-1)).toEqual([{ name: 'ui:pause', payload: { paused: false } }]);

    h.click('hud-pause');
    expect(h.q('pause-sound').textContent).toBe('SOM: LIGADO');
    h.click('pause-sound');
    await flush();
    expect(h.profile.data().settings.muted).toBe(true);
    expect(h.q('pause-sound').textContent).toBe('SOM: DESLIGADO');
    h.click('pause-quit');
    expect(names().slice(-1)).toEqual(['ui:quitRun']);
    expect(h.ui.screen()).toBe('menu');
    expect(h.visible('modal-pause')).toBe(false);
  });

  it('eventos da partida fora da run são ignorados', async () => {
    h = await setup();
    h.bus.emit('app:ready', {});
    h.bus.emit('draft:open', { choices: ['ignite', 'supernova', 'molten_core'] });
    h.bus.emit('run:ended', { won: false, wave: 1, goldEarned: 0 });
    expect(h.visible('modal-draft')).toBe(false);
    expect(h.visible('modal-end')).toBe(false);
    expect(h.ui.screen()).toBe('menu');
  });

  it('nenhum placeholder {var} sobra no DOM e destroy remove a UI', async () => {
    await inRun();
    h.bus.emit('run:state', runState());
    h.bus.emit('draft:open', { choices: ['ignite', 'supernova', 'molten_core'] });
    expect(h.root.textContent).not.toMatch(/\{\w+\}/);
    h.ui.destroy();
    expect(h.root.childElementCount).toBe(0);
    h.bus.emit('run:state', runState());
  });
});
