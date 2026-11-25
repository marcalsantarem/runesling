import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/EventBus';

type Events = {
  score: number;
  hit: { id: string; damage: number };
  ready: undefined;
};

describe('EventBus', () => {
  it('entrega o payload tipado aos ouvintes', () => {
    const bus = new EventBus<Events>();
    const fn = vi.fn();
    bus.on('hit', fn);
    bus.emit('hit', { id: 'goblin', damage: 3 });
    expect(fn).toHaveBeenCalledWith({ id: 'goblin', damage: 3 });
  });

  it('suporta vários ouvintes e isola eventos', () => {
    const bus = new EventBus<Events>();
    const a = vi.fn();
    const b = vi.fn();
    const other = vi.fn();
    bus.on('score', a);
    bus.on('score', b);
    bus.on('ready', other);
    bus.emit('score', 10);
    expect(a).toHaveBeenCalledWith(10);
    expect(b).toHaveBeenCalledWith(10);
    expect(other).not.toHaveBeenCalled();
  });

  it('off remove o ouvinte', () => {
    const bus = new EventBus<Events>();
    const fn = vi.fn();
    bus.on('score', fn);
    bus.off('score', fn);
    bus.emit('score', 1);
    expect(fn).not.toHaveBeenCalled();
    expect(bus.listenerCount('score')).toBe(0);
  });

  it('on devolve função de cancelamento', () => {
    const bus = new EventBus<Events>();
    const fn = vi.fn();
    const unsubscribe = bus.on('score', fn);
    unsubscribe();
    bus.emit('score', 1);
    expect(fn).not.toHaveBeenCalled();
  });

  it('once dispara uma única vez', () => {
    const bus = new EventBus<Events>();
    const fn = vi.fn();
    bus.once('ready', fn);
    bus.emit('ready', undefined);
    bus.emit('ready', undefined);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('é seguro remover ouvinte durante o emit', () => {
    const bus = new EventBus<Events>();
    const second = vi.fn();
    const first = vi.fn(() => bus.off('score', second));
    bus.on('score', first);
    bus.on('score', second);
    bus.emit('score', 5);
    expect(second).toHaveBeenCalledTimes(1);
    bus.emit('score', 6);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('emit sem ouvintes não falha e clear limpa tudo', () => {
    const bus = new EventBus<Events>();
    expect(() => bus.emit('score', 1)).not.toThrow();
    bus.on('score', vi.fn());
    bus.on('ready', vi.fn());
    bus.clear('score');
    expect(bus.listenerCount('score')).toBe(0);
    expect(bus.listenerCount('ready')).toBe(1);
    bus.clear();
    expect(bus.listenerCount('ready')).toBe(0);
  });
});
