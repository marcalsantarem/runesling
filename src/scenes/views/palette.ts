/** Paleta Obsidian Arcane (GDD §6) usada pelo desenho procedural (decisão 19). Cor = mecânica. */
export const COLOR = {
  bgCenter: '#1a203d',
  bgMid: '#0d1020',
  bgEdge: '#070912',
  cyan: 0x00cec9,
  violet: 0x7c6cf6,
  gold: 0xfeca57,
  crimson: 0xff5e57,
  white: 0xffffff,
  plate: 0x0a0c16,
  pillar: 0x1b213b,
  pillarHit: 0x3a4673,
  pillarRim: 0x586699,
  bumper: 0x151b33,
} as const;

export const CSS = {
  cyan: '#00cec9',
  violet: '#7c6cf6',
  gold: '#feca57',
  crimson: '#ff5e57',
  white: '#ffffff',
} as const;

export interface EnemyPalette {
  readonly col1: string;
  readonly col2: string;
  readonly rim: string;
  readonly eye: string;
}

/** Cores do medalhão por `spriteKey` (valores do vertical slice). */
export const ENEMY_PALETTES: { readonly [spriteKey: string]: EnemyPalette } = {
  enemy_goblin: { col1: '#c87d4b', col2: '#4a2511', rim: '#d4a373', eye: '#feca57' },
  enemy_shield: { col1: '#6474a8', col2: '#1e2540', rim: '#9fb0e0', eye: '#00cec9' },
  enemy_shooter: { col1: '#9c6bff', col2: '#2d1459', rim: '#d1b3ff', eye: '#ff5e57' },
  enemy_bomb: { col1: '#ff9f43', col2: '#7a2208', rim: '#ffeaa7', eye: '#fff6cc' },
  enemy_splitter: { col1: '#e056fd', col2: '#47126b', rim: '#f5b5ff', eye: '#ffffff' },
  enemy_mini: { col1: '#c56cf0', col2: '#381254', rim: '#e9b8ff', eye: '#ffffff' },
  enemy_healer: { col1: '#1dd1a1', col2: '#0b4d3c', rim: '#8ef5d8', eye: '#e8fff8' },
  miniboss_iron: { col1: '#7c8bb8', col2: '#1b223b', rim: '#feca57', eye: '#00cec9' },
  boss_obsidian: { col1: '#ff5e57', col2: '#450c17', rim: '#feca57', eye: '#fff3b0' },
};

export const DEFAULT_ENEMY_PALETTE: EnemyPalette = ENEMY_PALETTES['enemy_goblin']!;
