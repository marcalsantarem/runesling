/**
 * Match: orquestra física + combate + ondas numa run (TS puro, sem Phaser).
 * Fluxo: aim → launch() → flight (step() por frame; recall()) → fim de turno → próxima onda / draft / won / lost.
 * Buffer de eventos do combate: válido até a próxima chamada de launch/step/recall/pickPerk.
 */
import { CombatResolver, type TurnOutcome } from '../core/CombatResolver';
import { PhysicsEngine } from '../core/PhysicsEngine';
import type { ArenaDef, ChapterDef, GameData, PerkId } from '../data/types';
import type { Arena, PhysicsConfig } from './physicsTypes';
import type { RandomSource } from './rng';
import { createRunState, type RunState, type TalentBonus } from './RunState';
import { isDraftWave, rollDraft, spawnWave } from './waves';

export function physicsConfigFromRules(data: GameData): Partial<PhysicsConfig> {
  const r = data.rules;
  const p = r.physics;
  return {
    worldWidth: r.world.width,
    worldHeight: r.world.height,
    subSteps: p.subSteps,
    dampEarly: p.dampingEarly,
    dampLate: p.dampingLate,
    dampSwitchTick: p.dampingSwitchTicks,
    wallRestitution: p.wallRestitution,
    ceilingRestitution: p.ceilingRestitution,
    floorRestitution: p.floorRestitution,
    pierceCooldownFrames: data.perks.ghost_ball.params.hitCooldownFrames,
    bumperBoost: p.bumper.speedMult,
    bumperMinSpeed: p.bumper.minSpeed,
    bumperMaxSpeed: p.bumper.maxSpeed,
    antiLoopMaxVy: p.antiLoop.maxAbsVy,
    antiLoopMinVx: p.antiLoop.minAbsVx,
    antiLoopNudge: p.antiLoop.nudge,
    maxBalls: r.maxActiveOrbs,
    stopSpeed: p.stopSpeed,
    ballRadius: p.orbRadius,
    cloneRadius: p.ring.cloneRadius,
    cloneAngle: p.ring.cloneAngleRad,
  };
}

export class Match {
  readonly state: RunState;
  readonly engine: PhysicsEngine;
  readonly combat: CombatResolver;
  readonly arenaDef: ArenaDef;
  private readonly data: GameData;
  private readonly chapter: ChapterDef;
  private readonly rng: RandomSource;

  constructor(data: GameData, chapterId: string, rng: RandomSource, bonus: TalentBonus = {}) {
    const chapter = data.chapters[chapterId];
    if (!chapter) throw new Error(`Capítulo desconhecido: ${chapterId}`);
    const arenaDef = data.arenas[chapter.arenaId]!;
    this.data = data;
    this.chapter = chapter;
    this.arenaDef = arenaDef;
    this.rng = rng;
    this.state = createRunState(data, bonus);
    const arena: Arena = {
      bumpers: arenaDef.bumpers.map((c) => ({ x: c.x, y: c.y, r: c.r })),
      pillars: arenaDef.pillars.map((p) => ({ x: p.x, y: p.y, w: p.w, h: p.h })),
      rings: arenaDef.rings.map((c) => ({ x: c.x, y: c.y, r: c.r })),
      enemies: this.state.enemies,
    };
    this.engine = new PhysicsEngine(arena, rng, physicsConfigFromRules(data));
    this.combat = new CombatResolver(this.state, data, chapter, rng);
    spawnWave(this.state, data, chapter, 1, rng);
  }

  /** Dispara os orbes (ângulo/potência já travados por aim.ts). */
  launch(angle: number, power: number): boolean {
    if (this.state.phase !== 'aim') return false;
    this.combat.clearEvents();
    const a = this.arenaDef.launch;
    this.engine.launch(a.x, a.y, angle, power, this.state.orbs, this.data.rules.launch.multishotSpreadRad);
    this.combat.beginTurn(this.engine);
    this.state.phase = 'flight';
    return true;
  }

  /** Um frame de voo. Encerra o turno quando os orbes param ou a onda final é limpa. */
  step(speedMultiplier = 1): void {
    if (this.state.phase !== 'flight') return;
    this.combat.clearEvents();
    this.engine.step(speedMultiplier);
    this.combat.processPhysics(this.engine);
    if (this.engine.isSettled() || this.combat.isFinalWaveCleared()) this.finishTurn();
  }

  /** Botão Recolher: remove todos os orbes e encerra o turno. */
  recall(): void {
    if (this.state.phase !== 'flight') return;
    this.combat.clearEvents();
    this.engine.recall();
    this.finishTurn();
  }

  /** Escolhe uma das runas oferecidas no draft. */
  pickPerk(id: PerkId): boolean {
    const s = this.state;
    if (s.phase !== 'draft' || !s.draftOptions.includes(id)) return false;
    this.combat.clearEvents();
    this.combat.acquirePerk(id);
    s.draftOptions = [];
    s.phase = 'aim';
    return true;
  }

  private finishTurn(): TurnOutcome {
    const s = this.state;
    this.engine.recall();
    s.turn++;
    const out = this.combat.endTurn(this.arenaDef.launch.x, this.arenaDef.barrierY);
    if (out !== 'continue') return out;
    if (s.wave < this.chapter.totalWaves) {
      const draft = isDraftWave(this.chapter, s.wave);
      s.wave++;
      spawnWave(s, this.data, this.chapter, s.wave, this.rng);
      if (draft) {
        s.draftOptions = rollDraft(s, this.data, this.chapter, this.rng);
        s.phase = s.draftOptions.length > 0 ? 'draft' : 'aim';
        return out;
      }
    }
    s.phase = 'aim';
    return out;
  }
}
