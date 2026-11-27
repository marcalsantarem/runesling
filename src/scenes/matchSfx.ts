import type { PlayOptions, SfxKey } from '../audio';
import type { CombatEvent } from '../core/CombatResolver';
import type { PhysicsEvent } from '../match/physicsTypes';

/** O que a cena precisa do motor de áudio (o `audio` de src/audio; nunca Web Audio direto). */
export interface SfxPlayer {
  play(key: SfxKey, opts?: PlayOptions): number | null;
}

/** Abertura estéreo máxima (a arena é estreita; ±1 soa duro no fone). */
export const PAN_WIDTH = 0.7;

/** Chaves tocadas pela partida (T-046). */
export const MATCH_SFX = [
  'impact', 'wall', 'bumper', 'ring', 'explosion', 'zap', 'ghost', 'kill', 'crit', 'barrier_hit', 'heal', 'wave_start',
] as const satisfies readonly SfxKey[];

/**
 * Sons da partida (T-046): traduz eventos de física e de combate em `play()`. Lógica pura.
 * Anti-enxurrada: no máximo um disparo por chave por frame lógico (`beginFrame`); o resto
 * fica com os limites de voz do motor. `log` guarda as últimas chaves (diagnóstico/QA).
 */
export class MatchSfx {
  private readonly player: SfxPlayer;
  private readonly width: number;
  private readonly fired = new Set<SfxKey>();
  private readonly opts: PlayOptions = { combo: 0, pan: 0 };
  /** Contagem de disparos aceitos pelo motor, por chave. */
  readonly counts: Partial<Record<SfxKey, number>> = {};
  /** Contagem de pedidos (antes do limite de voz/mudo/destrave), por chave. */
  readonly requested: Partial<Record<SfxKey, number>> = {};

  constructor(player: SfxPlayer, worldWidth: number) {
    this.player = player;
    this.width = worldWidth;
  }

  /** Novo frame lógico: libera de novo cada chave. */
  beginFrame(): void {
    this.fired.clear();
  }

  pan(x: number): number {
    const p = (x / this.width) * 2 - 1;
    return Math.max(-1, Math.min(1, p)) * PAN_WIDTH;
  }

  /** Evento do PhysicsEngine; `ghost`: o orbe é o Orbe Fantasma atravessando (enemyHit não bloqueado). */
  physics(ev: PhysicsEvent, combo: number, ghost = false): void {
    switch (ev.type) {
      case 'wallHit':
      case 'pillarHit':
      case 'floorHit':
        this.play('wall', ev.x, 0);
        break;
      case 'ceilingHit':
        this.play('wall', ev.x, 0);
        if (ev.cloneId >= 0) this.play('ghost', ev.x, 0);
        break;
      case 'bumperHit':
        this.play('bumper', ev.x, combo);
        break;
      case 'ringPass':
        this.play('ring', ev.x, combo);
        break;
      case 'enemyHit':
        if (ghost && !ev.blocked) this.play('ghost', ev.x, 0);
        break;
    }
  }

  /** Evento de saída do CombatResolver; `combo` = `run.state.turnCombo`. */
  combat(ev: CombatEvent, combo: number): void {
    switch (ev.type) {
      case 'damage':
        if (ev.source === 'orb') this.play(ev.crit ? 'crit' : 'impact', ev.x, combo);
        break;
      case 'blocked':
        this.play('wall', ev.x, 0);
        break;
      case 'kill':
        this.play('kill', ev.x, combo);
        break;
      case 'explosion':
        this.play(ev.source === 'shock' ? 'zap' : 'explosion', ev.x, combo);
        break;
      case 'chain':
        this.play('zap', ev.x2, combo);
        break;
      case 'barrierHit':
      case 'shot':
        this.play('barrier_hit', ev.x, 0);
        break;
      case 'heal':
        if (ev.amount > 0) this.play('heal', ev.x2, 0);
        break;
      case 'goldGain':
        break;
    }
  }

  waveStart(): void {
    this.play('wave_start', this.width / 2, 0);
  }

  private play(key: SfxKey, x: number, combo: number): void {
    if (this.fired.has(key)) return;
    this.fired.add(key);
    this.requested[key] = (this.requested[key] ?? 0) + 1;
    this.opts.combo = combo;
    this.opts.pan = this.pan(x);
    if (this.player.play(key, this.opts) !== null) this.counts[key] = (this.counts[key] ?? 0) + 1;
  }
}
