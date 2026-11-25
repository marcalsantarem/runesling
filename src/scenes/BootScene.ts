import Phaser from 'phaser';
import { version } from '../../package.json';

/** Versão do jogo: fonte única em package.json. */
export const GAME_VERSION: string = version;

/** Mundo lógico (referência do vertical slice): 360×520, retrato. */
export const WORLD_WIDTH = 360;
export const WORLD_HEIGHT = 520;

export function bootLabel(v: string = GAME_VERSION): string {
  return `RuneSling v${v}`;
}

/** Placeholder: futuramente fará o preload de atlases e áudio. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    // O canvas é renderizado em WORLD × renderScale (DPR ≤ 2); a câmera volta às coordenadas lógicas.
    const renderScale = this.scale.gameSize.width / WORLD_WIDTH;
    this.cameras.main.setZoom(renderScale).centerOn(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    this.add
      .text(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, bootLabel(), {
        fontFamily: 'Cinzel, serif',
        fontSize: '24px',
        color: '#E8C26A',
      })
      .setOrigin(0.5);
  }
}
