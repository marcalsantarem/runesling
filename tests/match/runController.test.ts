import { describe, expect, it } from 'vitest';
import { EventBus } from '../../src/core/EventBus';
import type { GameEvents } from '../../src/core/events';
import { loadGameData, PERK_IDS } from '../../src/data/types';
import type { RunResult } from '../../src/meta/profile';
import { aimConfigFromRules } from '../../src/match/aim';
import { Rng } from '../../src/match/rng';
import { HudTracker, RunController, toUiRunState, uiPhase, waveBanner } from '../../src/match/RunController';
import { createRunState, finalGold } from '../../src/match/RunState';

const data = loadGameData();
const chapter = data.chapters['chapter_1']!;

type Log = { [K in keyof GameEvents]?: GameEvents[K][] };

function setup(seed = 7) {
  const bus = new EventBus<GameEvents>();
  const log: Log = {};
  for (const k of ['run:state', 'run:banner', 'draft:open', 'run:ended'] as const) {
    log[k] = [];
    bus.on(k, (p) => (log[k] as unknown[]).push(p));
  }
  const records: RunResult[] = [];
  const run = new RunController({
    data,
    chapterId: 'chapter_1',
    rng: new Rng(seed),
    bus,
    recordRun: async (r) => {
      records.push(r);
    },
  });
  return { bus, log, records, run };
}

/** Lança para cima e recolhe: encerra o turno sem matar ninguém. */
function skipTurn(run: RunController): void {
  expect(run.launch(-Math.PI / 2, 10)).toBe(true);
  run.recall();
}

describe('RunController — mapeamento para a UI', () => {
  it('toUiRunState: crit, runas em ordem, ouro com multiplicador e fase', () => {
    const s = createRunState(data);
    s.gold = 7;
    s.goldMult = 1.5;
    s.perkOrder = ['extra_orb', 'extra_orb'];
    const ui = toUiRunState(s, 15, 2);
    expect(ui).toMatchObject({ hp: 12, maxHp: 12, atk: 3, orbs: 2, crit: 0.05, wave: 1, totalWaves: 15, gold: 11, speed: 2, phase: 'aim' });
    expect(ui.perks).toEqual(['extra_orb', 'extra_orb']);
    expect(ui.perks).not.toBe(s.perkOrder);
    expect([uiPhase('won'), uiPhase('lost'), uiPhase('flight'), uiPhase('draft')]).toEqual(['ended', 'ended', 'flight', 'draft']);
  });

  it('banners: onda comum, mini-chefe e chefe final pelo nome do JSON', () => {
    expect(waveBanner(data, chapter, 3)).toBe('ONDA 3/15');
    expect(waveBanner(data, chapter, 7)).toBe('MINI-CHEFE: GUARDIÃO DE FERRO');
    expect(waveBanner(data, chapter, 15)).toBe('CHEFE FINAL: SENHOR OBSIDIANA');
  });

  it('HudTracker só acusa mudança quando um campo do HUD muda', () => {
    const s = createRunState(data);
    const t = new HudTracker();
    expect(t.update(s, 1)).toBe(true);
    expect(t.update(s, 1)).toBe(false);
    s.turn++; // fora do HUD
    expect(t.update(s, 1)).toBe(false);
    s.hp--;
    expect(t.update(s, 1)).toBe(true);
    expect(t.update(s, 2)).toBe(true);
  });

  it('aimConfigFromRules usa rules.launch', () => {
    const c = aimConfigFromRules(data);
    const l = data.rules.launch;
    expect([c.angleMargin, c.cancelDistance, c.basePower, c.powerBonus, c.powerDistance, c.fanSpread]).toEqual([
      l.minAngleRad, l.cancelPullPx, l.v0Base, l.v0Bonus, l.pullForMaxPx, l.multishotSpreadRad,
    ]);
  });
});

describe('RunController — fluxo pelo bus', () => {
  it('início: run:state + banner da onda 1; no voo, run:state só quando o HUD muda', () => {
    const { log, run } = setup();
    expect(log['run:state']!.length).toBe(1);
    expect(log['run:banner']).toEqual([{ text: 'ONDA 1/15' }]);
    expect(run.launch(-Math.PI / 2, 10)).toBe(true);
    expect(log['run:state']!.at(-1)!.phase).toBe('flight');
    let frames = 0;
    while (run.state.phase === 'flight' && frames < 2000) {
      run.frame();
      frames++;
    }
    expect(frames).toBeGreaterThan(30);
    expect(log['run:state']!.length).toBeLessThan(frames / 3);
  });

  it('decisão 27: normal = 2 ciclos por frame, rápido = 3 (rules.speed.multipliers)', () => {
    const { run } = setup();
    expect(data.rules.speed.multipliers).toEqual([2, 3]);
    const calls: number[] = [];
    const orig = run.match.step.bind(run.match);
    run.match.step = (k?: number) => {
      calls.push(k ?? 1);
      orig(k);
    };
    run.launch(-Math.PI / 2, 10);
    run.frame();
    run.toggleSpeed();
    run.frame();
    expect(calls).toEqual([2, 3]);
  });

  it('ui:toggleSpeed, ui:pause e ui:recall', () => {
    const { bus, log, run } = setup();
    bus.emit('ui:toggleSpeed', {});
    expect(run.speed).toBe(2);
    expect(log['run:state']!.at(-1)!.speed).toBe(2);
    bus.emit('ui:pause', { paused: true });
    expect(run.canAim()).toBe(false);
    expect(run.launch(-1.2, 10)).toBe(false);
    bus.emit('ui:pause', { paused: false });
    expect(run.launch(-1.2, 10)).toBe(true);
    bus.emit('ui:pause', { paused: true });
    run.frame();
    bus.emit('ui:recall', {});
    expect(run.state.phase).toBe('flight'); // pausado: nada acontece
    bus.emit('ui:pause', { paused: false });
    bus.emit('ui:recall', {});
    expect(run.state.phase).toBe('aim');
    expect(run.state.wave).toBe(2);
    expect(log['run:banner']!.at(-1)).toEqual({ text: 'ONDA 2/15' });
  });

  it('draft: draft:open uma vez, pausa até ui:pickPerk; banner só depois da escolha', () => {
    const { bus, log, run } = setup();
    skipTurn(run); // onda 1 → 2
    skipTurn(run); // onda 2 (draft) → 3
    expect(run.state.phase).toBe('draft');
    expect(log['draft:open']!.length).toBe(1);
    const choices = log['draft:open']![0]!.choices;
    expect(choices.length).toBe(3);
    expect(log['run:banner']!.map((b) => b.text)).toEqual(['ONDA 1/15', 'ONDA 2/15']);
    expect(run.launch(-1.2, 10)).toBe(false);
    const notOffered = PERK_IDS.find((id) => !choices.includes(id))!;
    bus.emit('ui:pickPerk', { perkId: notOffered });
    expect(run.state.phase).toBe('draft');
    bus.emit('ui:pickPerk', { perkId: choices[0]! });
    expect(run.state.phase).toBe('aim');
    expect(run.state.perkOrder.length).toBe(1);
    expect(log['run:state']!.at(-1)!.perks).toEqual(run.state.perkOrder);
    expect(log['run:banner']!.at(-1)).toEqual({ text: 'ONDA 3/15' });
    expect(log['draft:open']!.length).toBe(1);
  });

  it('derrota: grava a run uma vez e emite run:ended com o mesmo resultado', async () => {
    const { bus, log, records, run } = setup(3);
    for (let i = 0; i < 200 && !run.isEnded; i++) {
      if (run.state.phase === 'draft') bus.emit('ui:pickPerk', { perkId: run.state.draftOptions[0]! });
      else skipTurn(run);
    }
    expect(run.state.phase).toBe('lost');
    await run.ended;
    expect(records).toEqual([{ wave: run.state.wave, won: false, goldEarned: finalGold(run.state, data) }]);
    expect(log['run:ended']).toEqual(records);
    expect(log['run:state']!.at(-1)!.phase).toBe('ended');
    run.recall();
    run.frame();
    expect(records.length).toBe(1);
  });

  it('vitória: onda final limpa no voo → won com bônus de vitória', async () => {
    const { log, records, run } = setup();
    run.state.wave = chapter.totalWaves;
    run.state.enemies.length = 0;
    expect(run.launch(-1.2, 10)).toBe(true);
    run.frame();
    expect(run.state.phase).toBe('won');
    await run.ended;
    expect(records).toEqual([{ wave: 15, won: true, goldEarned: data.rules.victoryGoldBonus }]);
    expect(log['run:ended']).toEqual(records);
  });

  it('dispose: remove os ouvintes do bus e não emite mais nada', () => {
    const { bus, log, run } = setup();
    run.dispose();
    for (const k of ['ui:toggleSpeed', 'ui:recall', 'ui:pickPerk', 'ui:pause'] as const) expect(bus.listenerCount(k)).toBe(0);
    const n = log['run:state']!.length;
    expect(run.launch(-1.2, 10)).toBe(false);
    run.toggleSpeed();
    expect(log['run:state']!.length).toBe(n);
  });
});
