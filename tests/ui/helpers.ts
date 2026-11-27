import type { SaveStorage } from '../../src/core/SaveManager';
import { EventBus } from '../../src/core/EventBus';
import type { GameEventName, GameEvents, RunState } from '../../src/core/events';
import { PlayerProfile } from '../../src/meta/profile';
import { mountUI, type UiAudio, type UIHandle } from '../../src/ui';

/** Áudio falso: registra o que tocou (respeitando mudo e volume 0, como o motor real). */
export class FakeAudio implements UiAudio {
  readonly played: string[] = [];
  muted = false;
  volume = 1;
  unlockAttached = 0;
  attachUnlock(): () => void {
    this.unlockAttached++;
    return () => {};
  }
  play(key: Parameters<UiAudio['play']>[0]): number | null {
    if (this.muted || this.volume <= 0) return null;
    this.played.push(key);
    return 1;
  }
  setVolume(v: number): void {
    this.volume = v;
  }
  setMuted(m: boolean): void {
    this.muted = m;
  }
}

export class MemoryStorage implements SaveStorage {
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

export interface Harness {
  bus: EventBus<GameEvents>;
  root: HTMLElement;
  ui: UIHandle;
  profile: PlayerProfile;
  emitted: { name: GameEventName; payload: unknown }[];
  /** Avisos `settings:changed`, em ordem. */
  settings: GameEvents['settings:changed'][];
  audio: FakeAudio;
  q<T extends HTMLElement = HTMLElement>(key: string): T;
  visible(key: string): boolean;
  click(key: string): void;
}

const UI_EVENTS: GameEventName[] = ['ui:startRun', 'ui:toggleSpeed', 'ui:recall', 'ui:pickPerk', 'ui:pause', 'ui:quitRun'];

export async function setup(opts: { storage?: SaveStorage } = {}): Promise<Harness> {
  document.body.innerHTML = '<div id="ui-root"></div>';
  const root = document.getElementById('ui-root') as HTMLElement;
  const bus = new EventBus<GameEvents>();
  const emitted: Harness['emitted'] = [];
  for (const name of UI_EVENTS) bus.on(name, (payload) => emitted.push({ name, payload }));
  const settings: Harness['settings'] = [];
  bus.on('settings:changed', (p) => settings.push(p));
  const audio = new FakeAudio();
  const profile = await PlayerProfile.load({ storage: opts.storage ?? new MemoryStorage(), key: 'test.ui' });
  const ui = mountUI(root, { bus, profile: Promise.resolve(profile), audio });
  await ui.ready;
  const q = <T extends HTMLElement = HTMLElement>(key: string): T => {
    const node = root.querySelector<T>(`[data-ui="${key}"]`);
    if (!node) throw new Error(`sem [data-ui="${key}"]`);
    return node;
  };
  /** Visível = nem o nó nem um ancestral dentro do root está `hidden`. */
  const visible = (key: string): boolean => {
    for (let n: HTMLElement | null = q(key); n && n !== root; n = n.parentElement) if (n.hidden) return false;
    return true;
  };
  const click = (key: string) => q(key).click();
  return { bus, root, ui, profile, emitted, settings, audio, q, visible, click };
}

export function runState(over: Partial<RunState> = {}): RunState {
  return {
    hp: 12,
    maxHp: 12,
    atk: 3,
    orbs: 2,
    crit: 0.05,
    perks: [],
    wave: 1,
    totalWaves: 15,
    gold: 0,
    speed: 1,
    phase: 'aim',
    ...over,
  };
}

export const flush = () => new Promise<void>((r) => setTimeout(r, 0));
