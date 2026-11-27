/** API de áudio do jogo (T-045). O jogo nunca chama Web Audio direto, só por aqui. */
export { AudioEngine, UNLOCK_EVENTS, type AudioEngineOptions, type PlayOptions } from './AudioEngine';
export { SFX_KEYS, type SfxKey } from './sfx';
export { PITCH_JITTER, PITCH_MAX, PITCH_STEP, comboPitch, playbackRate } from './pitch';

import { AudioEngine } from './AudioEngine';

/** Instância única do jogo; sem efeito colateral até `attachUnlock()`/`unlock()`. */
export const audio = new AudioEngine();
