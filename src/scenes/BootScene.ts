import Phaser from 'phaser';
import { version } from '../../package.json';
import type { EventBus } from '../core/EventBus';
import { gameBus, type GameEvents } from '../core/events';
import { FONT_TITLE_STACK, waitForFonts } from '../core/fonts';

/** Versão do jogo: fonte única em package.json. */
export const GAME_VERSION: string = version;

/** Mundo lógico (referência do vertical slice): 360×520, retrato. */
export const WORLD_WIDTH = 360;
export const WORLD_HEIGHT = 520;

/** Key da cena de partida (dona: AG01). */
export const BATTLE_SCENE = 'Battle';

export function bootLabel(v: string = GAME_VERSION): string {
  return `RuneSling v${v}`;
}

/** Subconjunto do ScenePlugin usado pelo fluxo (facilita teste sem Phaser). */
export interface SceneControl {
  launch(key: string): unknown;
  stop(key: string): unknown;
  isActive(key: string): boolean;
}

/**
 * Fluxo de cenas: `ui:startRun` (re)inicia a Battle em paralelo à Boot; `ui:quitRun` a para.
 * Retorna a função que remove os ouvintes.
 */
export function wireSceneFlow(bus: EventBus<GameEvents>, scenes: SceneControl): () => void {
  const offStart = bus.on('ui:startRun', () => {
    if (scenes.isActive(BATTLE_SCENE)) scenes.stop(BATTLE_SCENE);
    scenes.launch(BATTLE_SCENE);
  });
  const offQuit = bus.on('ui:quitRun', () => {
    if (scenes.isActive(BATTLE_SCENE)) scenes.stop(BATTLE_SCENE);
  });
  return () => {
    offStart();
    offQuit();
  };
}

/** Cena raiz: espera as fontes, liga o fluxo de cenas e avisa a UI com `app:ready`. Fica viva o app todo. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    // O canvas é renderizado em WORLD × renderScale (DPR ≤ 2); a câmera volta às coordenadas lógicas.
    const renderScale = this.scale.gameSize.width / WORLD_WIDTH;
    this.cameras.main.setZoom(renderScale).centerOn(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);

    const unwire = wireSceneFlow(gameBus, this.scene);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, unwire);

    void waitForFonts().then(() => {
      this.add
        .text(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, bootLabel(), {
          fontFamily: FONT_TITLE_STACK,
          fontSize: '24px',
          fontStyle: '700',
          color: '#E8C26A',
        })
        .setOrigin(0.5);
      gameBus.emit('app:ready', {});
    });
  }
}
