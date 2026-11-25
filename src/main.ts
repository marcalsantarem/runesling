import Phaser from 'phaser';
import { BattleScene } from './scenes/BattleScene';
import { BootScene, WORLD_HEIGHT, WORLD_WIDTH } from './scenes/BootScene';
import { mountUI } from './ui';

const BACKGROUND_COLOR = '#0D1020';
/** Nitidez em telas HiDPI, limitada a 2 (vertical slice). */
const RENDER_SCALE = Math.min(window.devicePixelRatio || 1, 2);

function ensureElement(id: string, parent: HTMLElement): HTMLElement {
  const existing = document.getElementById(id);
  if (existing) return existing;
  const el = document.createElement('div');
  el.id = id;
  parent.appendChild(el);
  return el;
}

const app = ensureElement('app', document.body);
const gameParent = ensureElement('game', app);
// Camada HTML sobre o canvas (UI do AG02, via EventBus).
mountUI(ensureElement('ui-root', app));

new Phaser.Game({
  type: Phaser.AUTO, // WebGL com fallback automático para Canvas
  parent: gameParent,
  width: WORLD_WIDTH * RENDER_SCALE,
  height: WORLD_HEIGHT * RENDER_SCALE,
  backgroundColor: BACKGROUND_COLOR,
  // Sem Arcade/Matter: nenhuma física do Phaser é configurada.
  render: { antialias: true, powerPreference: 'high-performance' },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // Boot é a raiz (fica viva); Battle é lançada por `ui:startRun` (ver BootScene).
  scene: [BootScene, BattleScene],
});
