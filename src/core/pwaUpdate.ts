/**
 * Autoatualização do PWA (T-034): lógica pura do registro do service worker.
 * `main.ts` liga isso ao `virtual:pwa-register` só no build de produção.
 */

/** Intervalo da checagem periódica de versão nova (~60 min). */
export const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;
/** Janela em que uma segunda recarga é bloqueada (evita loop). */
export const RELOAD_GUARD_WINDOW_MS = 30 * 1000;
export const RELOAD_GUARD_KEY = 'rs:pwa-reload-at';

/** Subconjunto de `Storage` usado pela guarda (sessionStorage no navegador). */
export interface GuardStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Cria a guarda da recarga: devolve `true` só na primeira chamada desta página
 * e só se não houve recarga pela guarda nos últimos `windowMs` (sobrevive ao reload
 * via storage). Storage indisponível ou com erro não impede a primeira recarga.
 */
export function createReloadGuard(
  storage: GuardStorage | null,
  now: () => number = Date.now,
  windowMs = RELOAD_GUARD_WINDOW_MS,
): () => boolean {
  let used = false;
  return () => {
    if (used) return false;
    used = true;
    const t = now();
    try {
      const last = Number(storage?.getItem(RELOAD_GUARD_KEY));
      if (Number.isFinite(last) && last > 0 && t - last >= 0 && t - last < windowMs) return false;
      storage?.setItem(RELOAD_GUARD_KEY, String(t));
    } catch {
      // storage bloqueado (aba privada etc.): segue com a guarda em memória.
    }
    return true;
  };
}

export interface UpdateCheckDeps {
  doc: Pick<Document, 'addEventListener' | 'visibilityState'>;
  setInterval: (fn: () => void, ms: number) => unknown;
  intervalMs?: number;
}

/** Pede `registration.update()` ao voltar ao primeiro plano e a cada `intervalMs`. */
export function scheduleUpdateChecks(
  registration: Pick<ServiceWorkerRegistration, 'update'>,
  deps: UpdateCheckDeps,
): void {
  const check = (): void => {
    registration.update().catch(() => undefined); // offline: tenta na próxima
  };
  deps.doc.addEventListener('visibilitychange', () => {
    if (deps.doc.visibilityState === 'visible') check();
  });
  deps.setInterval(check, deps.intervalMs ?? UPDATE_CHECK_INTERVAL_MS);
}
