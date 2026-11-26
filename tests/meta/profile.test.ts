import { describe, expect, it } from 'vitest';
import type { SaveStorage } from '../../src/core/SaveManager';
import {
  PlayerProfile,
  PROFILE_SAVE_VERSION,
  STARTING_GOLD,
  getProfile,
  resetProfileForTests,
} from '../../src/meta/profile';

class MemoryStorage implements SaveStorage {
  readonly items = new Map<string, unknown>();
  async getItem<T>(key: string): Promise<T | null> {
    return (this.items.has(key) ? structuredClone(this.items.get(key)) : null) as T | null;
  }
  async setItem<T>(key: string, value: T): Promise<T> {
    this.items.set(key, structuredClone(value));
    return value;
  }
  async removeItem(key: string): Promise<void> {
    this.items.delete(key);
  }
}

const KEY = 'test.profile';
const load = (storage: SaveStorage) => PlayerProfile.load({ storage, key: KEY });

describe('PlayerProfile', () => {
  it('save novo: 40 de ouro, talentos em 0, som ligado', async () => {
    const p = await load(new MemoryStorage());
    expect(p.data()).toEqual({
      gold: STARTING_GOLD,
      bestWave: 0,
      cleared: false,
      talents: { atk: 0, hp: 0, balls: 0, crit: 0, gold: 0 },
      settings: { muted: false },
    });
    expect(STARTING_GOLD).toBe(40);
    expect(Object.isFrozen(p.data())).toBe(true);
  });

  it('compra desconta o custo do GDD §5.1 e sobe o nível', async () => {
    const p = await load(new MemoryStorage());
    expect(p.talentCost('hp')).toBe(20);
    expect(p.canBuy('hp')).toBe(true);
    expect(await p.buyTalent('hp')).toBe(true);
    expect(p.talentLevel('hp')).toBe(1);
    expect(p.data().gold).toBe(20);
    expect(p.talentCost('hp')).toBe(38);
  });

  it('ouro insuficiente: não compra e não altera nada', async () => {
    const p = await load(new MemoryStorage());
    expect(p.canBuy('balls')).toBe(false); // 75 > 40
    const before = p.data();
    expect(await p.buyTalent('balls')).toBe(false);
    expect(p.data()).toBe(before);
  });

  it('no máximo: custo null e compra recusada', async () => {
    const storage = new MemoryStorage();
    const p = await load(storage);
    await p.recordRun({ wave: 1, won: false, goldEarned: 10_000 });
    for (let i = 0; i < 3; i++) expect(await p.buyTalent('balls')).toBe(true);
    expect(p.talentLevel('balls')).toBe(3);
    expect(p.talentCost('balls')).toBeNull();
    expect(p.canBuy('balls')).toBe(false);
    const gold = p.data().gold;
    expect(await p.buyTalent('balls')).toBe(false);
    expect(p.data().gold).toBe(gold);
    // 75 + 165 + 255
    expect(gold).toBe(40 + 10_000 - 495);
  });

  it('recordRun soma ao banco, guarda a melhor onda e marca conquista', async () => {
    const p = await load(new MemoryStorage());
    await p.recordRun({ wave: 7, won: false, goldEarned: 33 });
    expect(p.data()).toMatchObject({ gold: 73, bestWave: 7, cleared: false });
    await p.recordRun({ wave: 4, won: false, goldEarned: 5 });
    expect(p.data()).toMatchObject({ gold: 78, bestWave: 7, cleared: false });
    await p.recordRun({ wave: 15, won: true, goldEarned: 120 });
    expect(p.data()).toMatchObject({ gold: 198, bestWave: 15, cleared: true });
    await p.recordRun({ wave: 2, won: false, goldEarned: 0 });
    expect(p.data().cleared).toBe(true);
  });

  it('recordRun rejeita valores inválidos', async () => {
    const p = await load(new MemoryStorage());
    await expect(p.recordRun({ wave: -1, won: false, goldEarned: 0 })).rejects.toThrow(RangeError);
    await expect(p.recordRun({ wave: 1, won: false, goldEarned: -5 })).rejects.toThrow(RangeError);
    await expect(p.recordRun({ wave: 1, won: false, goldEarned: NaN })).rejects.toThrow(RangeError);
    expect(p.data().gold).toBe(40);
  });

  it('persiste ao recarregar (envelope versão 1)', async () => {
    const storage = new MemoryStorage();
    const p = await load(storage);
    await p.recordRun({ wave: 9, won: false, goldEarned: 60 });
    await p.buyTalent('atk');
    await p.updateSettings({ muted: true });
    expect((storage.items.get(KEY) as { version: number }).version).toBe(PROFILE_SAVE_VERSION);
    const again = await load(storage);
    expect(again.data()).toEqual(p.data());
    expect(again.data()).toMatchObject({ gold: 75, bestWave: 9, settings: { muted: true } });
    expect(again.talentLevel('atk')).toBe(1);
  });

  it('dados corrompidos voltam ao padrão', async () => {
    const storage = new MemoryStorage();
    storage.items.set(KEY, 'lixo');
    expect((await load(storage)).data().gold).toBe(40);

    storage.items.set(KEY, { version: PROFILE_SAVE_VERSION, savedAt: 0, data: null });
    expect((await load(storage)).data().bestWave).toBe(0);

    storage.items.set(KEY, {
      version: PROFILE_SAVE_VERSION,
      savedAt: 0,
      data: { gold: 'abc', bestWave: -3, cleared: 'sim', talents: { atk: 99, hp: 1.5, crit: 2 }, settings: 7 },
    });
    const p = await load(storage);
    expect(p.data()).toEqual({
      gold: 40,
      bestWave: 0,
      cleared: false,
      talents: { atk: 10, hp: 0, balls: 0, crit: 2, gold: 0 },
      settings: { muted: false },
    });
  });

  it('save de outra versão (ex.: futura) volta ao padrão', async () => {
    const storage = new MemoryStorage();
    storage.items.set(KEY, { version: 99, savedAt: 0, data: { gold: 5000 } });
    expect((await load(storage)).data().gold).toBe(40);
  });

  it('storage que falha na leitura não quebra o carregamento', async () => {
    const broken: SaveStorage = {
      getItem: () => Promise.reject(new Error('indisponível')),
      setItem: <T>(_k: string, v: T) => Promise.resolve(v),
      removeItem: () => Promise.resolve(),
    };
    expect((await load(broken)).data().gold).toBe(40);
  });

  it('onChange avisa mudanças e cancela a assinatura', async () => {
    const p = await load(new MemoryStorage());
    const seen: number[] = [];
    const off = p.onChange((d) => seen.push(d.gold));
    await p.recordRun({ wave: 1, won: false, goldEarned: 10 });
    await p.buyTalent('hp');
    off();
    await p.recordRun({ wave: 1, won: false, goldEarned: 1 });
    expect(seen).toEqual([50, 30]);
  });

  it('reset apaga o save e volta aos padrões', async () => {
    const storage = new MemoryStorage();
    const p = await load(storage);
    await p.recordRun({ wave: 15, won: true, goldEarned: 500 });
    await p.updateSettings({ muted: true });
    await p.reset();
    expect(p.data()).toMatchObject({ gold: 40, bestWave: 0, cleared: false, settings: { muted: false } });
    expect(storage.items.has(KEY)).toBe(false);
    expect((await load(storage)).data().gold).toBe(40);
  });

  it('getProfile devolve um singleton', async () => {
    resetProfileForTests({ storage: new MemoryStorage(), key: KEY });
    const [a, b] = await Promise.all([getProfile(), getProfile()]);
    expect(a).toBe(b);
    resetProfileForTests();
  });
});
