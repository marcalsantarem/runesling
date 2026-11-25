import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/EventBus';
import { gameBus, type GameEvents, type RunState } from '../../src/core/events';
import { PERK_IDS } from '../../src/data/types';

describe('contrato de eventos (GameEvents)', () => {
  it('gameBus é um EventBus único', async () => {
    expect(gameBus).toBeInstanceOf(EventBus);
    const again = await import('../../src/core/events');
    expect(again.gameBus).toBe(gameBus);
  });

  it('entrega payloads tipados jogo → UI', () => {
    const bus = new EventBus<GameEvents>();
    const onState = vi.fn<(s: RunState) => void>();
    const onDraft = vi.fn();
    bus.on('run:state', onState);
    bus.on('draft:open', onDraft);
    const state: RunState = {
      hp: 10, maxHp: 10, atk: 2, orbs: 3, wave: 1, totalWaves: 10, gold: 0, speed: 1, phase: 'aim',
    };
    bus.emit('run:state', state);
    bus.emit('draft:open', { choices: PERK_IDS.slice(0, 3) });
    expect(onState).toHaveBeenCalledWith(state);
    expect(onDraft).toHaveBeenCalledWith({ choices: PERK_IDS.slice(0, 3) });
  });

  it('entrega eventos UI → jogo, inclusive os de payload vazio', () => {
    const bus = new EventBus<GameEvents>();
    const fn = vi.fn();
    bus.on('ui:startRun', fn);
    bus.on('ui:pause', fn);
    bus.on('ui:pickPerk', fn);
    bus.emit('ui:startRun', {});
    bus.emit('ui:pause', { paused: true });
    const perkId = PERK_IDS[0]!;
    bus.emit('ui:pickPerk', { perkId });
    expect(fn.mock.calls).toEqual([[{}], [{ paused: true }], [{ perkId }]]);
  });

  it('rejeita payloads errados em tempo de compilação', () => {
    const bus = new EventBus<GameEvents>();
    // @ts-expect-error speed só aceita 1 | 2
    bus.emit('run:state', { hp: 1, maxHp: 1, atk: 1, orbs: 1, wave: 1, totalWaves: 1, gold: 0, speed: 3, phase: 'aim' });
    // @ts-expect-error perkId precisa ser um PerkId
    bus.emit('ui:pickPerk', { perkId: 'nao_existe' });
    // @ts-expect-error payload vazio não aceita campos
    bus.emit('app:ready', { x: 1 });
    // @ts-expect-error evento fora do contrato
    bus.emit('ui:desconhecido', {});
    expect(true).toBe(true);
  });
});
