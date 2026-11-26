import { describe, expect, it, vi } from 'vitest';
import pkg from '../../package.json';

// Phaser exige navegador; a cena é testada só pelo rótulo de versão.
vi.mock('phaser', () => ({ default: { Scene: class {} } }));

const { GAME_VERSION, bootLabel } = await import('../../src/scenes/BootScene');

describe('versão do jogo', () => {
  it('package.json está na versão 0.4.0', () => {
    expect(pkg.version).toBe('0.4.0');
  });

  it('BootScene lê a versão de package.json', () => {
    expect(GAME_VERSION).toBe(pkg.version);
    expect(bootLabel()).toBe('RuneSling v0.4.0');
  });
});
