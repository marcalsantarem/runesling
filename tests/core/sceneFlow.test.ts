import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/EventBus';
import type { GameEvents } from '../../src/core/events';

vi.mock('phaser', () => ({ default: { Scene: class {} } }));

const { wireSceneFlow, BATTLE_SCENE } = await import('../../src/scenes/BootScene');

function fakeScenes() {
  const active = new Set<string>();
  return {
    active,
    launch: vi.fn((k: string) => active.add(k)),
    stop: vi.fn((k: string) => active.delete(k)),
    isActive: (k: string) => active.has(k),
  };
}

describe('fluxo de cenas', () => {
  it('ui:startRun lança a Battle e ui:quitRun a para', () => {
    const bus = new EventBus<GameEvents>();
    const scenes = fakeScenes();
    wireSceneFlow(bus, scenes);
    expect(BATTLE_SCENE).toBe('Battle');
    bus.emit('ui:startRun', {});
    expect(scenes.launch).toHaveBeenCalledWith('Battle');
    expect(scenes.active.has('Battle')).toBe(true);
    bus.emit('ui:quitRun', {});
    expect(scenes.stop).toHaveBeenCalledWith('Battle');
    expect(scenes.active.has('Battle')).toBe(false);
  });

  it('nova run com Battle ativa reinicia; quit sem Battle não faz nada', () => {
    const bus = new EventBus<GameEvents>();
    const scenes = fakeScenes();
    wireSceneFlow(bus, scenes);
    bus.emit('ui:quitRun', {});
    expect(scenes.stop).not.toHaveBeenCalled();
    bus.emit('ui:startRun', {});
    bus.emit('ui:startRun', {});
    expect(scenes.stop).toHaveBeenCalledTimes(1);
    expect(scenes.launch).toHaveBeenCalledTimes(2);
  });

  it('a função de retorno remove os ouvintes', () => {
    const bus = new EventBus<GameEvents>();
    const unwire = wireSceneFlow(bus, fakeScenes());
    unwire();
    expect(bus.listenerCount('ui:startRun')).toBe(0);
    expect(bus.listenerCount('ui:quitRun')).toBe(0);
  });
});
