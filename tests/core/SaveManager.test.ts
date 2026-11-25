import { describe, expect, it, vi } from 'vitest';
import { SaveManager, type SaveStorage } from '../../src/core/SaveManager';

class MemoryStorage implements SaveStorage {
  readonly items = new Map<string, unknown>();
  async getItem<T>(key: string): Promise<T | null> {
    return (this.items.has(key) ? this.items.get(key) : null) as T | null;
  }
  async setItem<T>(key: string, value: T): Promise<T> {
    this.items.set(key, structuredClone(value));
    return value;
  }
  async removeItem(key: string): Promise<void> {
    this.items.delete(key);
  }
}

type Save = { gold: number; unlocked: string[] };
const defaults = (): Save => ({ gold: 0, unlocked: [] });

function make(storage: SaveStorage, extra: Partial<ConstructorParameters<typeof SaveManager<Save>>[0]> = {}) {
  return new SaveManager<Save>({ version: 2, defaults, storage, key: 'test', now: () => 1000, ...extra });
}

describe('SaveManager', () => {
  it('sem save devolve os padrões', async () => {
    const sm = make(new MemoryStorage());
    expect(await sm.load()).toEqual(defaults());
  });

  it('save grava envelope versionado e load recupera', async () => {
    const storage = new MemoryStorage();
    const sm = make(storage);
    await sm.save({ gold: 50, unlocked: ['chain_lightning'] });
    expect(storage.items.get('test')).toEqual({
      version: 2,
      savedAt: 1000,
      data: { gold: 50, unlocked: ['chain_lightning'] },
    });
    expect(await sm.load()).toEqual({ gold: 50, unlocked: ['chain_lightning'] });
  });

  it('reset apaga o save e devolve os padrões', async () => {
    const storage = new MemoryStorage();
    const sm = make(storage);
    await sm.save({ gold: 9, unlocked: [] });
    expect(await sm.reset()).toEqual(defaults());
    expect(storage.items.has('test')).toBe(false);
    expect(await sm.load()).toEqual(defaults());
  });

  it('dados inválidos voltam aos padrões', async () => {
    const storage = new MemoryStorage();
    storage.items.set('test', 'lixo');
    expect(await make(storage).load()).toEqual(defaults());
  });

  it('versão antiga sem migrador volta aos padrões', async () => {
    const storage = new MemoryStorage();
    storage.items.set('test', { version: 1, savedAt: 0, data: { coins: 7 } });
    expect(await make(storage).load()).toEqual(defaults());
  });

  it('versão antiga com migrador migra e regrava', async () => {
    const storage = new MemoryStorage();
    storage.items.set('test', { version: 1, savedAt: 0, data: { coins: 7 } });
    const migrate = vi.fn((data: unknown) => ({ gold: (data as { coins: number }).coins, unlocked: [] }));
    const sm = make(storage, { migrate });
    expect(await sm.load()).toEqual({ gold: 7, unlocked: [] });
    expect(migrate).toHaveBeenCalledWith({ coins: 7 }, 1);
    expect(storage.items.get('test')).toMatchObject({ version: 2, data: { gold: 7 } });
  });

  it('versão futura não é migrada e volta aos padrões', async () => {
    const storage = new MemoryStorage();
    storage.items.set('test', { version: 3, savedAt: 0, data: { gold: 1 } });
    const migrate = vi.fn();
    expect(await make(storage, { migrate }).load()).toEqual(defaults());
    expect(migrate).not.toHaveBeenCalled();
  });
});
