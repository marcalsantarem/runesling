/**
 * RunController: liga a Match ao `gameBus` (TS puro, sem Phaser). A BattleScene só desenha e repassa a mira.
 * Emite `run:state` (só quando algo do HUD muda), `run:banner`, `draft:open` e `run:ended`;
 * ouve `ui:toggleSpeed`, `ui:recall`, `ui:pickPerk` e `ui:pause`.
 */
import type { EventBus } from '../core/EventBus';
import type { GameEvents, RunPhase as UiPhase, RunSpeed, RunState as UiRunState } from '../core/events';
import type { ChapterDef, GameData } from '../data/types';
import type { RunResult } from '../meta/profile';
import { Match } from './Match';
import type { RandomSource } from './rng';
import { finalGold, type RunPhase, type RunState, type TalentBonus } from './RunState';

export function uiPhase(phase: RunPhase): UiPhase {
  return phase === 'won' || phase === 'lost' ? 'ended' : phase;
}

/** Ouro mostrado no HUD: ouro bruto × multiplicador (sem o bônus de vitória). */
export function hudGold(state: RunState): number {
  return Math.round(state.gold * state.goldMult);
}

/** Snapshot `run:state` a partir do estado da run. */
export function toUiRunState(state: RunState, totalWaves: number, speed: RunSpeed): UiRunState {
  return {
    hp: state.hp,
    maxHp: state.maxHp,
    atk: state.atk,
    orbs: state.orbs,
    crit: state.critChance,
    perks: [...state.perkOrder],
    wave: state.wave,
    totalWaves,
    gold: hudGold(state),
    speed,
    phase: uiPhase(state.phase),
  };
}

/** Texto do banner da onda: chefe/mini-chefe pelo nome do JSON; senão "ONDA n/total". */
export function waveBanner(data: GameData, chapter: ChapterDef, wave: number): string {
  const fixed = chapter.fixedSpawns[String(wave)];
  const bossId = fixed?.find((id) => data.enemies[id]?.isBoss);
  if (bossId) {
    const name = data.enemies[bossId]!.name.toUpperCase();
    return wave >= chapter.totalWaves ? `CHEFE FINAL: ${name}` : `MINI-CHEFE: ${name}`;
  }
  return `ONDA ${wave}/${chapter.totalWaves}`;
}

/** Guarda os campos do último `run:state` emitido para saber se mudou (sem alocar por frame). */
export class HudTracker {
  private hp = NaN;
  private maxHp = NaN;
  private atk = NaN;
  private orbs = NaN;
  private crit = NaN;
  private perkCount = -1;
  private wave = NaN;
  private gold = NaN;
  private speed = NaN;
  private phase = '';

  /** Verdadeiro se algum campo mudou desde a última chamada (e memoriza os novos valores). */
  update(state: RunState, speed: RunSpeed): boolean {
    const gold = hudGold(state);
    const phase = uiPhase(state.phase);
    if (
      state.hp === this.hp &&
      state.maxHp === this.maxHp &&
      state.atk === this.atk &&
      state.orbs === this.orbs &&
      state.critChance === this.crit &&
      state.perkOrder.length === this.perkCount &&
      state.wave === this.wave &&
      gold === this.gold &&
      speed === this.speed &&
      phase === this.phase
    ) {
      return false;
    }
    this.hp = state.hp;
    this.maxHp = state.maxHp;
    this.atk = state.atk;
    this.orbs = state.orbs;
    this.crit = state.critChance;
    this.perkCount = state.perkOrder.length;
    this.wave = state.wave;
    this.gold = gold;
    this.speed = speed;
    this.phase = phase;
    return true;
  }
}

export interface RunControllerOptions {
  data: GameData;
  chapterId: string;
  rng: RandomSource;
  bus: EventBus<GameEvents>;
  bonus?: TalentBonus;
  /** Grava o resultado no perfil (ex.: `profile.recordRun`). */
  recordRun: (result: RunResult) => Promise<void>;
}

export class RunController {
  readonly match: Match;
  readonly chapter: ChapterDef;
  speed: RunSpeed = 1;
  paused = false;
  private readonly data: GameData;
  private readonly bus: EventBus<GameEvents>;
  private readonly recordRun: (result: RunResult) => Promise<void>;
  private readonly hud = new HudTracker();
  private readonly offs: (() => void)[] = [];
  private lastWave = 0;
  private draftOpened = false;
  private ending = false;
  private disposed = false;
  /** Resolve quando `run:ended` foi emitido (ou a run foi descartada). */
  ended: Promise<void> = Promise.resolve();

  constructor(opts: RunControllerOptions) {
    this.data = opts.data;
    this.bus = opts.bus;
    this.recordRun = opts.recordRun;
    this.chapter = opts.data.chapters[opts.chapterId]!;
    this.match = new Match(opts.data, opts.chapterId, opts.rng, opts.bonus ?? {});
    const bus = opts.bus;
    this.offs.push(
      bus.on('ui:toggleSpeed', () => this.toggleSpeed()),
      bus.on('ui:recall', () => this.recall()),
      bus.on('ui:pickPerk', ({ perkId }) => {
        if (this.paused || !this.match.pickPerk(perkId)) return;
        this.draftOpened = false;
        this.sync();
      }),
      bus.on('ui:pause', ({ paused }) => {
        this.paused = paused;
      }),
    );
    this.sync();
  }

  get state(): RunState {
    return this.match.state;
  }

  get isEnded(): boolean {
    return this.ending;
  }

  /** Pode começar/continuar a mirar. */
  canAim(): boolean {
    return !this.paused && !this.disposed && this.match.state.phase === 'aim';
  }

  launch(angle: number, power: number): boolean {
    if (!this.canAim() || !this.match.launch(angle, power)) return false;
    this.sync();
    return true;
  }

  /** Um frame lógico (60 Hz). No-op fora do voo ou em pausa. */
  frame(): void {
    if (this.paused || this.disposed || this.match.state.phase !== 'flight') return;
    this.match.step(this.speed);
    this.sync();
  }

  recall(): void {
    if (this.paused || this.disposed || this.match.state.phase !== 'flight') return;
    this.match.recall();
    this.sync();
  }

  toggleSpeed(): void {
    if (this.disposed) return;
    this.speed = this.speed === 1 ? 2 : 1;
    this.sync();
  }

  /** Remove os ouvintes do bus; eventos pendentes desta run não são mais emitidos. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const off of this.offs) off();
    this.offs.length = 0;
  }

  /** Reage às mudanças de fase/onda e emite o que mudou. */
  private sync(): void {
    if (this.disposed) return;
    const s = this.match.state;
    if (this.hud.update(s, this.speed)) this.bus.emit('run:state', toUiRunState(s, this.chapter.totalWaves, this.speed));
    if (s.phase === 'draft') {
      if (!this.draftOpened) {
        this.draftOpened = true;
        this.bus.emit('draft:open', { choices: [...s.draftOptions] });
      }
      return; // banner da nova onda só depois da escolha
    }
    if (s.phase === 'won' || s.phase === 'lost') {
      if (!this.ending) this.ended = this.finish();
      return;
    }
    if (s.phase === 'aim' && s.wave !== this.lastWave) {
      this.lastWave = s.wave;
      this.bus.emit('run:banner', { text: waveBanner(this.data, this.chapter, s.wave) });
    }
  }

  private async finish(): Promise<void> {
    this.ending = true;
    const s = this.match.state;
    const won = s.phase === 'won';
    const result = { wave: s.wave, won, goldEarned: finalGold(s, this.data) };
    try {
      await this.recordRun(result);
    } catch (e) {
      console.warn('[run] falha ao gravar o resultado', e);
    }
    if (!this.disposed) this.bus.emit('run:ended', result);
  }
}
