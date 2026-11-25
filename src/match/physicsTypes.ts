/**
 * Tipos puros da física (sem Phaser, sem src/data/). Mundo lógico 360×520.
 */

export interface Circle {
  x: number;
  y: number;
  r: number;
}

/** AABB com (x, y) no canto superior esquerdo. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FrontShield {
  /** Impacto com normal n_y > minNormalY (orbe vindo de baixo) é bloqueado. */
  minNormalY: number;
}

export interface EnemyShape extends Circle {
  id: number;
  frontShield?: FrontShield;
}

/** Arena: paredes laterais e teto são implícitos (largura/altura da config). */
export interface Arena {
  bumpers: Circle[];
  pillars: Rect[];
  rings: Circle[];
  /** Apenas inimigos vivos; o combate remove os mortos (ou usa PhysicsEngine.removeEnemy). */
  enemies: EnemyShape[];
}

export interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** Já quicou em parede, teto, bumper ou pilar. */
  bounced: boolean;
  /** Clone temporário (anel). */
  temp: boolean;
  /** Já gerou (ou é) clone de anel. */
  ringUsed: boolean;
  /** Já tocou o teto. */
  ceilingHit: boolean;
  /** Orbe Fantasma: atravessa inimigos não bloqueados pelo escudo. */
  pierce: boolean;
  /** Cooldown de acerto por inimigo do orbe perfurante (slots fixos, sem alocação). */
  hitCdIds: Int32Array;
  hitCdFrames: Int32Array;
}

/** Eco do Teto (wall_clone): parâmetros do clone criado no 1º quique no teto de cada orbe principal. */
export interface WallCloneConfig {
  radius: number;
  /** vx do clone = vx do orbe (já refletido) × vxMult. */
  vxMult: number;
  offsetY: number;
}

export type PhysicsEventType =
  | 'wallHit'
  | 'ceilingHit'
  | 'bumperHit'
  | 'pillarHit'
  | 'ringPass'
  | 'enemyHit'
  | 'floorHit';

/**
 * Evento emitido por sub-passo. Objetos vêm de um pool reutilizado a cada step():
 * o consumidor deve copiar o que precisar antes do próximo step().
 * - wallHit/ceilingHit: ballId.
 * - bumperHit/pillarHit/ringPass: ballId, index (posição no array da arena).
 * - ringPass: cloneId = id do clone criado, ou -1 se o teto de orbes impediu.
 * - ceilingHit: cloneId = clone do Eco do Teto, ou -1.
 * - enemyHit: ballId, enemyId, blocked (escudo frontal).
 * - floorHit: ballId (quique no chão).
 * x, y, bounced, temp: estado do orbe no momento do evento.
 */
export interface PhysicsEvent {
  type: PhysicsEventType;
  ballId: number;
  index: number;
  enemyId: number;
  cloneId: number;
  blocked: boolean;
  x: number;
  y: number;
  bounced: boolean;
  temp: boolean;
}

/** Parâmetros numéricos; padrões = GDD §2.3/§3.4 e, onde o GDD é omisso, o vertical slice. */
export interface PhysicsConfig {
  worldWidth: number;
  worldHeight: number;
  subSteps: number;
  dampEarly: number;
  dampLate: number;
  /** Ticks (frames lógicos) com dampEarly; depois dampLate. */
  dampSwitchTick: number;
  /** Restituição em paredes laterais (slice: 0.96). */
  wallRestitution: number;
  ceilingRestitution: number;
  /** Quique no chão (slice: 0.94). */
  floorRestitution: number;
  /** Frames de cooldown por inimigo do orbe perfurante (ghost_ball: 14). */
  pierceCooldownFrames: number;
  bumperBoost: number;
  bumperMaxSpeed: number;
  /** Velocidade mínima após bumper (slice: 7.5). */
  bumperMinSpeed: number;
  bumperGap: number;
  pillarGap: number;
  enemyGap: number;
  antiLoopMaxVy: number;
  antiLoopMinVx: number;
  antiLoopNudge: number;
  maxBalls: number;
  /** Orbe abaixo desta velocidade conta como parado (slice: 0.85). */
  stopSpeed: number;
  ballRadius: number;
  cloneRadius: number;
  cloneAngle: number;
}

export const DEFAULT_PHYSICS_CONFIG: Readonly<PhysicsConfig> = Object.freeze({
  worldWidth: 360,
  worldHeight: 520,
  subSteps: 4,
  dampEarly: 0.9935,
  dampLate: 0.962,
  dampSwitchTick: 340,
  wallRestitution: 0.96,
  ceilingRestitution: 0.96,
  floorRestitution: 0.94,
  pierceCooldownFrames: 14,
  bumperBoost: 1.15,
  bumperMaxSpeed: 15.5,
  bumperMinSpeed: 7.5,
  bumperGap: 0.5,
  pillarGap: 0.5,
  enemyGap: 0.6,
  antiLoopMaxVy: 0.25,
  antiLoopMinVx: 1.5,
  antiLoopNudge: 0.04,
  maxBalls: 28,
  stopSpeed: 0.85,
  ballRadius: 7.5,
  cloneRadius: 6.8,
  cloneAngle: 0.22,
});
