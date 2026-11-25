/**
 * Traduz os eventos de saída do CombatResolver (e o ×2 do anel) em efeitos: partículas, ondas,
 * feixes, números flutuantes, tremida e pedidos de flash/squash ao medalhão. Lógica pura (sem Phaser).
 * Valores visuais (contagens, vidas, offsets) seguem o vertical slice v0.1.
 */
import type { CombatEvent } from '../../core/CombatResolver';
import type { RandomSource } from '../../match/rng';
import { COLOR } from '../views/palette';
import { Shake, shakeFor } from './fxMath';
import { BeamPool, FloatTextPool, ParticlePool, WavePool } from './pools';

/** O que o diretor precisa saber/acionar nos inimigos (implementado pela cena). */
export interface FxTargets {
  /** Raio do inimigo vivo (ou 0 se não houver view). */
  radius(enemyId: number): number;
  /** Hit-flash; `squash` também aplica o 1.18×. */
  hit(enemyId: number, squash: boolean): void;
  /** Cor do aro do medalhão do tipo (partículas de morte). */
  rimColor(typeId: string): number;
}

export const FX_CAPACITY = { particles: 640, waves: 24, beams: 32, floats: 48 } as const;

const DEFAULT_RADIUS = 14;

export class FxDirector {
  readonly particles = new ParticlePool(FX_CAPACITY.particles);
  readonly waves = new WavePool(FX_CAPACITY.waves);
  readonly beams = new BeamPool(FX_CAPACITY.beams);
  readonly floats = new FloatTextPool(FX_CAPACITY.floats);
  readonly shake = new Shake();
  private readonly rng: RandomSource;

  constructor(rng: RandomSource) {
    this.rng = rng;
  }

  onCombat(ev: CombatEvent, t: FxTargets): void {
    this.shake.add(shakeFor(ev.type, ev.source));
    switch (ev.type) {
      case 'damage': {
        t.hit(ev.enemyId, true);
        const r = t.radius(ev.enemyId) || DEFAULT_RADIUS;
        const tint = sourceColor(ev.source);
        const crit = ev.crit;
        const n = Math.round(ev.amount);
        const txt = crit ? `-${n}!` : `-${n}`;
        const col = tint !== 0 ? tint : crit ? COLOR.gold : COLOR.white;
        this.floats.spawn(ev.x + (this.rng.next() * 14 - 7), ev.y - r, txt, col, crit ? 15 : 12);
        this.particles.burst(ev.x, ev.y, tint !== 0 ? tint : COLOR.crimson, crit ? 8 : 5, crit ? 6 : 4, this.rng);
        break;
      }
      case 'blocked': {
        t.hit(ev.enemyId, false);
        const r = t.radius(ev.enemyId) || DEFAULT_RADIUS;
        this.floats.spawn(ev.x, ev.y + r + 6, 'ESCUDO', COLOR.cyan, 10);
        break;
      }
      case 'kill':
        this.particles.burst(ev.x, ev.y, t.rimColor(ev.typeId), 12, 6, this.rng);
        break;
      case 'explosion': {
        const shock = ev.source === 'shock';
        const death = ev.source === 'golem' || ev.source === 'supernova';
        const col = shock ? COLOR.cyan : COLOR.magma;
        this.waves.spawn(ev.x, ev.y, shock ? 16 : death ? 10 : 8, ev.radius, shock ? 14 : death ? 16 : 12, col);
        if (death) this.particles.burst(ev.x, ev.y, col, 10, 7, this.rng);
        break;
      }
      case 'chain':
        this.beams.spawn(ev.x, ev.y, ev.x2, ev.y2, 11, COLOR.cyan, true);
        break;
      case 'shot':
        this.beams.spawn(ev.x, ev.y, ev.x2, ev.y2, 18, COLOR.crimson, false);
        this.floats.spawn(ev.x2, ev.y2 - 12, `-${Math.round(ev.amount)} HP`, COLOR.crimson, 14);
        break;
      case 'barrierHit':
        this.floats.spawn(ev.x, ev.y - 10, `-${Math.round(ev.amount)} BARREIRA!`, COLOR.crimson, 13);
        this.particles.burst(ev.x, ev.y, COLOR.crimson, 10, 5, this.rng);
        break;
      case 'heal': {
        if (ev.amount <= 0) break;
        const r = t.radius(ev.enemyId) || DEFAULT_RADIUS;
        this.beams.spawn(ev.x, ev.y, ev.x2, ev.y2, 16, COLOR.emerald, false);
        this.floats.spawn(ev.x2, ev.y2 - r, `+${Math.round(ev.amount)}`, COLOR.emerald, 12);
        break;
      }
      case 'goldGain':
        break;
    }
  }

  /** Orbe cruzou o anel multiplicador. */
  onRingPass(x: number, y: number): void {
    this.floats.spawn(x, y - 20, '×2!', COLOR.gold, 13);
  }

  step(frames: number): void {
    if (frames <= 0) return;
    this.particles.step(frames);
    this.waves.step(frames);
    this.beams.step(frames);
    this.floats.step(frames);
    this.shake.step(frames, this.rng);
  }

  clear(): void {
    this.particles.clear();
    this.waves.clear();
    this.beams.clear();
    this.floats.clear();
    this.shake.reset();
  }
}

/** Cor do dano por fonte (0 = padrão do acerto do orbe). */
function sourceColor(source: CombatEvent['source']): number {
  switch (source) {
    case 'splash':
    case 'golem':
    case 'supernova':
    case 'ignite':
      return COLOR.magma;
    case 'chain':
    case 'shock':
      return COLOR.cyan;
    default:
      return 0;
  }
}
