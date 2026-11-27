import { describe, expect, it } from 'vitest';
import type { PlayOptions, SfxKey } from '../../src/audio';
import { SFX_KEYS } from '../../src/audio';
import type { CombatEvent } from '../../src/core/CombatResolver';
import { EventBus } from '../../src/core/EventBus';
import type { GameEvents } from '../../src/core/events';
import type { PhysicsEvent } from '../../src/match/physicsTypes';
import { MATCH_SFX, MatchSfx, PAN_WIDTH } from '../../src/scenes/matchSfx';
import { sceneSettings, watchSceneSettings } from '../../src/scenes/sceneSettings';

function player(accept = true) {
  const calls: { key: SfxKey; combo: number; pan: number }[] = [];
  return {
    calls,
    play(key: SfxKey, o: PlayOptions = {}) {
      calls.push({ key, combo: o.combo ?? 0, pan: o.pan ?? 0 });
      return accept ? 1 : null;
    },
  };
}
const W = 360;
const cev = (p: Partial<CombatEvent>): CombatEvent => ({
  type: 'damage', enemyId: 1, typeId: '', amount: 5, crit: false, source: 'orb', x: 180, y: 100, x2: 0, y2: 0, radius: 0, ...p,
});
const pev = (p: Partial<PhysicsEvent>): PhysicsEvent => ({
  type: 'wallHit', ballId: 0, index: 0, enemyId: -1, cloneId: -1, blocked: false, x: 180, y: 100, bounced: false, temp: false, ...p,
});

describe('MatchSfx — sons da partida (T-046)', () => {
  it('todas as chaves da partida existem no motor', () => {
    for (const k of MATCH_SFX) expect(SFX_KEYS).toContain(k);
  });

  it('combate: impacto com combo e pan, crit, kill, fogo, raio, barreira, cura', () => {
    const p = player();
    const s = new MatchSfx(p, W);
    const cases: [Partial<CombatEvent>, SfxKey | null][] = [
      [{ source: 'orb', x: 0 }, 'impact'],
      [{ source: 'orb', crit: true }, 'crit'],
      [{ source: 'splash' }, null],
      [{ type: 'kill' }, 'kill'],
      [{ type: 'explosion', source: 'golem' }, 'explosion'],
      [{ type: 'explosion', source: 'shock' }, 'zap'],
      [{ type: 'chain', source: 'chain' }, 'zap'],
      [{ type: 'barrierHit', source: 'enemy' }, 'barrier_hit'],
      [{ type: 'shot', source: 'enemy' }, 'barrier_hit'],
      [{ type: 'heal', amount: 4 }, 'heal'],
      [{ type: 'heal', amount: 0 }, null],
      [{ type: 'goldGain' }, null],
      [{ type: 'blocked' }, 'wall'],
    ];
    for (const [e, key] of cases) {
      s.beginFrame();
      const n = p.calls.length;
      s.combat(cev(e), 7);
      if (key) expect(p.calls[n]?.key).toBe(key);
      else expect(p.calls.length).toBe(n);
    }
    expect(p.calls[0]).toEqual({ key: 'impact', combo: 7, pan: -PAN_WIDTH });
    expect(s.counts.impact).toBe(1);
  });

  it('física: parede/teto/pilar → wall, bumper, anel, fantasma e clone do Eco', () => {
    const p = player();
    const s = new MatchSfx(p, W);
    const keys = (e: Partial<PhysicsEvent>, ghost = false) => {
      s.beginFrame();
      const n = p.calls.length;
      s.physics(pev(e), 3, ghost);
      return p.calls.slice(n).map((c) => c.key);
    };
    expect(keys({ type: 'wallHit', x: W })).toEqual(['wall']);
    expect(p.calls.at(-1)?.pan).toBeCloseTo(PAN_WIDTH);
    expect(keys({ type: 'pillarHit' })).toEqual(['wall']);
    expect(keys({ type: 'ceilingHit' })).toEqual(['wall']);
    expect(keys({ type: 'ceilingHit', cloneId: 9 })).toEqual(['wall', 'ghost']);
    expect(keys({ type: 'bumperHit' })).toEqual(['bumper']);
    expect(keys({ type: 'ringPass' })).toEqual(['ring']);
    expect(keys({ type: 'enemyHit' })).toEqual([]);
    expect(keys({ type: 'enemyHit' }, true)).toEqual(['ghost']);
    expect(keys({ type: 'enemyHit', blocked: true }, true)).toEqual([]);
  });

  it('anti-enxurrada: uma vez por chave por frame; recusa do motor não conta', () => {
    const p = player(false);
    const s = new MatchSfx(p, W);
    s.beginFrame();
    for (let i = 0; i < 20; i++) s.physics(pev({ type: 'wallHit' }), 0);
    expect(p.calls.length).toBe(1);
    s.beginFrame();
    s.physics(pev({ type: 'wallHit' }), 0);
    expect(p.calls.length).toBe(2);
    expect(s.requested.wall).toBe(2);
    expect(s.counts.wall).toBeUndefined();
  });

  it('wave_start pelo banner da onda', () => {
    const p = player();
    new MatchSfx(p, W).waveStart();
    expect(p.calls[0]).toEqual({ key: 'wave_start', combo: 0, pan: 0 });
  });
});

describe('sceneSettings — settings:changed (T-049)', () => {
  it('guarda o último reducedMotion e desliga', () => {
    const bus = new EventBus<GameEvents>();
    const off = watchSceneSettings(bus);
    bus.emit('settings:changed', { muted: false, sfxVolume: 1, reducedMotion: true });
    expect(sceneSettings.reducedMotion).toBe(true);
    off();
    bus.emit('settings:changed', { muted: false, sfxVolume: 1, reducedMotion: false });
    expect(sceneSettings.reducedMotion).toBe(true);
    sceneSettings.reducedMotion = false;
  });
});
