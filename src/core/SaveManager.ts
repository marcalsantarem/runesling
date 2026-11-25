import localforage from 'localforage';

/** Subconjunto assíncrono do localForage usado pelo SaveManager (permite mock em testes). */
export interface SaveStorage {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<T>;
  removeItem(key: string): Promise<void>;
}

/** Envelope gravado no storage: dados sempre versionados. */
export interface SaveEnvelope<T> {
  version: number;
  savedAt: number;
  data: T;
}

export interface SaveManagerOptions<T> {
  /** Versão atual do formato dos dados. */
  version: number;
  /** Fábrica dos dados padrão (save novo ou inválido). */
  defaults: () => T;
  /** Chave no storage. */
  key?: string;
  /** Storage assíncrono; por padrão, uma instância do localForage. */
  storage?: SaveStorage;
  /** Migra dados de uma versão anterior. Sem migrador, versão diferente volta aos padrões. */
  migrate?: (data: unknown, fromVersion: number) => T;
  /** Relógio injetável (testes). */
  now?: () => number;
}

export const DEFAULT_SAVE_KEY = 'runesling.save';

function isEnvelope(value: unknown): value is SaveEnvelope<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { version?: unknown }).version === 'number' &&
    'data' in value
  );
}

export class SaveManager<T> {
  private readonly version: number;
  private readonly defaults: () => T;
  private readonly key: string;
  private readonly storage: SaveStorage;
  private readonly migrate: ((data: unknown, fromVersion: number) => T) | undefined;
  private readonly now: () => number;

  constructor(options: SaveManagerOptions<T>) {
    this.version = options.version;
    this.defaults = options.defaults;
    this.key = options.key ?? DEFAULT_SAVE_KEY;
    this.storage =
      options.storage ?? localforage.createInstance({ name: 'runesling', storeName: 'save' });
    this.migrate = options.migrate;
    this.now = options.now ?? Date.now;
  }

  /** Carrega os dados. Ausente, inválido ou de versão sem migração → padrões. */
  async load(): Promise<T> {
    const raw = await this.storage.getItem<unknown>(this.key);
    if (!isEnvelope(raw)) return this.defaults();
    if (raw.version === this.version) return raw.data as T;
    if (this.migrate && raw.version < this.version) {
      const migrated = this.migrate(raw.data, raw.version);
      await this.save(migrated);
      return migrated;
    }
    return this.defaults();
  }

  /** Grava os dados com a versão atual. */
  async save(data: T): Promise<void> {
    const envelope: SaveEnvelope<T> = { version: this.version, savedAt: this.now(), data };
    await this.storage.setItem(this.key, envelope);
  }

  /** Apaga o save e devolve os padrões. */
  async reset(): Promise<T> {
    await this.storage.removeItem(this.key);
    return this.defaults();
  }
}
