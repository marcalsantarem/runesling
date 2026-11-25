/** QA M2 (BRF-011): números do código/dados conferidos contra o GDD §2.2–2.3, §3.1–3.4, §4, §5.1. */
import { describe, expect, it } from 'vitest';
import { loadGameData } from '../../src/data/types';
import { DEFAULT_AIM_CONFIG } from '../../src/match/aim';
import { physicsConfigFromRules } from '../../src/match/Match';
import { DEFAULT_PHYSICS_CONFIG } from '../../src/match/physicsTypes';
import { enemyHp, talentCost } from '../../src/meta/formulas';

const data = loadGameData();
const ch = data.chapters['chapter_1']!;

describe('QA M2 — GDD §2.2/§2.3 (mira e física)', () => {
  it('mira: trava 0.14 rad, cancelamento 14 px, v0 = 9.5 + min(1, d/120)·3.8', () => {
    const l = data.rules.launch;
    expect([l.minAngleRad, l.cancelPullPx, l.v0Base, l.v0Bonus, l.pullForMaxPx]).toEqual([0.14, 14, 9.5, 3.8, 120]);
    const a = DEFAULT_AIM_CONFIG;
    expect([a.angleMargin, a.cancelDistance, a.basePower, a.powerBonus, a.powerDistance]).toEqual([0.14, 14, 9.5, 3.8, 120]);
  });

  it('física: N = 4, γ 0.9935 → 0.962 após 340 ticks, anti-loop 0.25/1.5/0.04, teto 28 orbes, bumper 15%/15.5', () => {
    for (const p of [physicsConfigFromRules(data), DEFAULT_PHYSICS_CONFIG]) {
      expect(p).toMatchObject({
        subSteps: 4, dampEarly: 0.9935, dampLate: 0.962, dampSwitchTick: 340,
        antiLoopMaxVy: 0.25, antiLoopMinVx: 1.5, antiLoopNudge: 0.04,
        maxBalls: 28, bumperBoost: 1.15, bumperMaxSpeed: 15.5, cloneAngle: 0.22, pierceCooldownFrames: 14,
      });
    }
  });
});

describe('QA M2 — GDD §3.1–3.4 (capítulo, HP, inimigos, arena)', () => {
  it('15 ondas, drafts 2/4/6/7/9/11/13 (7 escolhas de 3), mini-chefe na 7 e chefe na 15', () => {
    expect(ch.totalWaves).toBe(15);
    expect(ch.draftWaves).toEqual([2, 4, 6, 7, 9, 11, 13]);
    expect(ch.draftChoices).toBe(3);
    expect(ch.fixedSpawns).toEqual({ '7': ['miniboss_iron'], '15': ['boss_obsidian'] });
  });

  it('HP(k, w) = max(2, round((4 + 2.8w + 0.55w^1.32)·M_k)) para todos os inimigos, ondas 1–15', () => {
    const M: Record<string, number> = {
      goblin: 1.0, shield: 1.25, shooter: 0.95, bomb: 0.85, splitter: 1.05, mini: 0.45, healer: 1.0, miniboss_iron: 5.2, boss_obsidian: 9.5,
    };
    for (const [id, m] of Object.entries(M)) {
      for (let w = 1; w <= 15; w++) {
        const base = 4 + 2.8 * w + 0.55 * Math.pow(w, 1.32);
        expect(enemyHp(id, w, data)).toBe(Math.max(2, Math.round(base * m)));
      }
    }
  });

  it('tabela §3.3: raio, M_k, ouro e mecânicas', () => {
    const t: Record<string, [number, number, number]> = {
      goblin: [17, 1.0, 2], shield: [19, 1.25, 3], shooter: [18, 0.95, 3], bomb: [18, 0.85, 3], splitter: [19, 1.05, 3],
      mini: [12, 0.45, 1], healer: [18, 1.0, 4], miniboss_iron: [31, 5.2, 18], boss_obsidian: [36, 9.5, 40],
    };
    for (const [id, [r, m, g]] of Object.entries(t)) {
      const e = data.enemies[id]!;
      expect([e.radius, e.hpMult, e.gold]).toEqual([r, m, g]);
    }
    const E = data.enemies;
    expect(E.goblin!.advancePx).toBe(36);
    expect(E.shield!.shieldArc?.minNormalY).toBe(0.3);
    expect(E.shooter!.shoot).toEqual({ cooldown: 2, damage: 1 });
    expect(E.bomb!.explode).toEqual({ radiusPx: 92, atkRatio: 2.5 });
    expect(E.splitter!.split?.spawnId).toBe('mini');
    expect(E.splitter!.split?.offsetsXPx).toEqual([-20, 20]);
    expect(E.healer!.heal).toMatchObject({ maxHpRatio: 0.22, rangePx: 130, targets: 1 });
    const mb = E.miniboss_iron!;
    expect([mb.advancePx, mb.barrierDmg, mb.barrierRecoilPx, mb.summon?.cooldown, mb.summon?.spawnId]).toEqual([22, 4, 72, 2, 'goblin']);
    expect(mb.behaviors).toContain('front_shield');
    expect(E.boss_obsidian!.shoot).toEqual({ cooldown: 2, damage: 2 });
    expect(E.boss_obsidian!.behaviors).toEqual(['shooter', 'summoner']);
  });
});

describe('QA M2 — GDD §4 (perks e fórmula)', () => {
  it('parâmetros das 15 runas', () => {
    const P = data.perks;
    expect(P.chain_lightning.params).toMatchObject({ chance: 0.45, damageRatio: 0.75, rangePx: 155 });
    expect(P.bumper_shock.params).toMatchObject({ radiusPx: 92, damageRatio: 0.85 });
    expect(P.static_crit.params.damageMult).toBe(1.35);
    expect(P.storm_orb.params).toEqual({ orbBonus: 1, chainChanceBonus: 0.15 });
    expect(P.fire_splash.params).toEqual({ damageRatio: 0.45, radiusPx: 60, radiusPxWithMoltenCore: 76 });
    expect(P.ignite.params.damageRatio).toBe(1.0);
    expect(P.supernova.params).toEqual({ radiusPx: 74, damageRatio: 1.5 });
    expect(P.molten_core.params).toEqual({ atkBonus: 3, fireRadiusMult: 1.25 });
    expect(P.ghost_ball.params).toEqual({ orbIndex: 0, hitCooldownFrames: 14 });
    expect(P.ricochet_crit.params.damageMult).toBe(2.0);
    expect(P.wall_clone.params.clonesPerOrb).toBe(1);
    expect(P.arcane_sight.params).toEqual({ previewBounces: 2, critChanceBonus: 0.2 });
    expect(P.extra_orb.params.orbBonus).toBe(1);
    expect(P.power_surge.params.atkBonus).toBe(2);
    expect(P.bastion_heal.params).toEqual({ healHp: 5, maxHpBonus: 2 });
    const triggers = Object.fromEntries(Object.values(P).map((p) => [p.id, p.trigger]));
    expect(triggers).toMatchObject({
      chain_lightning: 'onEnemyHit', bumper_shock: 'onBumperHit', static_crit: 'onDamageCalc', storm_orb: 'onAcquire',
      fire_splash: 'onEnemyHit', ignite: 'onTurnEnd', supernova: 'onKill', molten_core: 'onAcquire',
      ghost_ball: 'onLaunch', ricochet_crit: 'onDamageCalc', wall_clone: 'onCeilingHit', arcane_sight: 'onAcquire',
    });
  });

  it('§4.5: multiplicadores 2.0 / 0.7 / 1.75 / 1.35 e mínimo 1', () => {
    expect(data.rules.damage).toEqual({ minDamage: 1, ricochetMult: 2.0, tempCloneMult: 0.7, critMult: 1.75, shockMult: 1.35 });
  });
});

describe('QA M2 — GDD §5.1 (talentos)', () => {
  it('Custo(L) = C_base + L·ΔC e nível máximo da tabela', () => {
    const t: Record<string, [number, number, number, number]> = {
      atk: [10, 25, 20, 1], hp: [10, 20, 18, 2], balls: [3, 75, 90, 1], crit: [8, 30, 24, 0.05], gold: [6, 35, 28, 0.15],
    };
    for (const [id, [max, base, step, per]] of Object.entries(t)) {
      const d = data.talents[id]!;
      expect([d.maxLevel, d.effect.perLevel]).toEqual([max, per]);
      for (let L = 0; L < max; L++) expect(talentCost(id, L, data)).toBe(base + L * step);
    }
    expect(data.rules.victoryGoldBonus).toBe(60);
  });
});
