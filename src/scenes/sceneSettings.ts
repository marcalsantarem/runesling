import type { EventBus } from '../core/EventBus';
import type { GameEvents } from '../core/events';

/**
 * Último `settings:changed` visto (T-049). A UI o emite no `app:ready`, antes de a BattleScene
 * existir; a Boot liga este ouvinte cedo e a Battle lê o valor ao ser criada.
 */
export const sceneSettings = { reducedMotion: false };

/** Mantém `sceneSettings` em dia. Retorna o desligamento. */
export function watchSceneSettings(bus: EventBus<GameEvents>): () => void {
  return bus.on('settings:changed', (s) => {
    sceneSettings.reducedMotion = s.reducedMotion;
  });
}
