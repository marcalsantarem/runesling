/**
 * EventBus tipado: comunicação desacoplada entre Phaser e a UI HTML.
 * O mapa de eventos é genérico: cada chave é o nome do evento e o valor é o payload.
 */
export type EventMap = Record<string, unknown>;

export type Handler<P> = (payload: P) => void;

export class EventBus<E extends EventMap> {
  private readonly handlers = new Map<keyof E, Set<Handler<never>>>();

  /** Registra um ouvinte. Retorna uma função que o remove. */
  on<K extends keyof E>(event: K, handler: Handler<E[K]>): () => void {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler as Handler<never>);
    return () => this.off(event, handler);
  }

  /** Registra um ouvinte que roda uma única vez. */
  once<K extends keyof E>(event: K, handler: Handler<E[K]>): () => void {
    const off = this.on(event, (payload) => {
      off();
      handler(payload);
    });
    return off;
  }

  /** Remove um ouvinte específico. */
  off<K extends keyof E>(event: K, handler: Handler<E[K]>): void {
    const set = this.handlers.get(event);
    if (!set) return;
    set.delete(handler as Handler<never>);
    if (set.size === 0) this.handlers.delete(event);
  }

  /** Emite um evento para todos os ouvintes registrados (cópia da lista, seguro contra off durante o emit). */
  emit<K extends keyof E>(event: K, payload: E[K]): void {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const handler of [...set]) {
      (handler as Handler<E[K]>)(payload);
    }
  }

  /** Remove todos os ouvintes de um evento, ou de todos se nenhum for informado. */
  clear(event?: keyof E): void {
    if (event === undefined) this.handlers.clear();
    else this.handlers.delete(event);
  }

  /** Quantidade de ouvintes de um evento. */
  listenerCount(event: keyof E): number {
    return this.handlers.get(event)?.size ?? 0;
  }
}
