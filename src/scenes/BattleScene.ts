import Phaser from 'phaser';
import { gameBus } from '../core/events';
import { loadGameData, type GameData } from '../data/types';
import { getProfile, type PlayerProfile } from '../meta/profile';
import { aimAngle, aimConfigFromRules, type Aim, type AimConfig } from '../match/aim';
import { Rng } from '../match/rng';
import { RunController } from '../match/RunController';
import { talentBonuses } from '../match/RunState';
import { BATTLE_SCENE, WORLD_HEIGHT, WORLD_WIDTH } from './BootScene';
import type { FxTargets } from './fx/FxDirector';
import { FxLayer } from './fx/FxLayer';
import { AimView } from './views/AimView';
import { ArenaView } from './views/ArenaView';
import { BumperView } from './views/BumperView';
import { EnemyView } from './views/EnemyView';
import { LauncherView } from './views/LauncherView';
import { OrbView } from './views/OrbView';
import { DEFAULT_ENEMY_PALETTE, ENEMY_PALETTES } from './views/palette';
import { PillarView } from './views/PillarView';
import { RingView } from './views/RingView';

const CHAPTER_ID = 'chapter_1';
/** Passo lógico fixo (a física do slice é por frame a 60 Hz). */
const FRAME_MS = 1000 / 60;
/** Teto de frames lógicos por update (evita espiral após travadas/aba em segundo plano). */
const MAX_FRAMES_PER_UPDATE = 4;

interface Drag {
  sx: number;
  sy: number;
  cx: number;
  cy: number;
}

/** Partida: desenha o estado da Match (views em ./views, efeitos em ./fx) e repassa a mira. Regras e bus ficam no RunController. */
export class BattleScene extends Phaser.Scene implements FxTargets {
  private gameData!: GameData;
  private aimCfg!: AimConfig;
  private run: RunController | null = null;
  private drag: Drag | null = null;
  private readonly aim: Aim = { angle: 0, power: 0 };
  private acc = 0;
  private res = 1;
  private sweep = 0;
  private alive = false;

  private aimView!: AimView;
  private orbView!: OrbView;
  private launcher!: LauncherView;
  private arena!: ArenaView;
  private bumpers: BumperView[] = [];
  private pillars: PillarView[] = [];
  private rings: RingView[] = [];
  private enemies = new Map<number, EnemyView>();
  private fxLayer!: FxLayer;
  /** Turno já lido do buffer de combate (detecta o Recolher, que encerra o turno fora do laço). */
  private lastTurn = 0;
  private readonly rimCache = new Map<string, number>();

  constructor() {
    super(BATTLE_SCENE);
  }

  create(): void {
    // A cena é reaproveitada entre runs: todo estado é recriado aqui.
    this.alive = true;
    this.run = null;
    this.drag = null;
    this.acc = 0;
    this.bumpers = [];
    this.pillars = [];
    this.rings = [];
    this.enemies = new Map();
    this.gameData = loadGameData();
    this.aimCfg = aimConfigFromRules(this.gameData);

    this.res = this.scale.gameSize.width / WORLD_WIDTH;
    this.cameras.main.setZoom(this.res).centerOn(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);

    const chapter = this.gameData.chapters[CHAPTER_ID]!;
    const arenaDef = this.gameData.arenas[chapter.arenaId]!;
    const fxRng = new Rng(Date.now() ^ 0x5bd1e995);
    this.arena = new ArenaView(this, WORLD_WIDTH, WORLD_HEIGHT, arenaDef.barrierY, this.res, fxRng);
    for (const r of arenaDef.rings) this.rings.push(new RingView(this, r, this.res));
    for (const p of arenaDef.pillars) this.pillars.push(new PillarView(this, p));
    for (const b of arenaDef.bumpers) this.bumpers.push(new BumperView(this, b, this.res));
    this.launcher = new LauncherView(this, arenaDef.launch, this.res);
    this.aimView = new AimView(this, this.aimCfg);
    this.orbView = new OrbView(this, this.gameData.rules.maxActiveOrbs, this.res);
    this.fxLayer = new FxLayer(this, new Rng(Date.now() ^ 0x2545f491), this.res);

    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onDown, this);
    this.input.on(Phaser.Input.Events.POINTER_MOVE, this.onMove, this);
    this.input.on(Phaser.Input.Events.POINTER_UP, this.onUp, this);
    this.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.onUp, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.teardown, this);

    void this.startRun();
  }

  /** Talentos do perfil entram na criação da run (BRF-016). */
  private async startRun(): Promise<void> {
    let profile: PlayerProfile | null = null;
    try {
      profile = await getProfile();
    } catch (e) {
      console.warn('[battle] perfil indisponível; run sem talentos e sem gravar', e);
    }
    if (!this.alive) return;
    const run = new RunController({
      data: this.gameData,
      chapterId: CHAPTER_ID,
      rng: new Rng(Date.now() >>> 0),
      bus: gameBus,
      bonus: profile ? talentBonuses(profile.data().talents, this.gameData) : {},
      recordRun: (r) => (profile ? profile.recordRun(r) : Promise.resolve()),
    });
    this.run = run;
    this.lastTurn = run.state.turn;
    this.syncEnemies(0);
  }

  private teardown(): void {
    this.alive = false;
    this.run?.dispose();
    this.run = null;
    this.input.off(Phaser.Input.Events.POINTER_DOWN, this.onDown, this);
    this.input.off(Phaser.Input.Events.POINTER_MOVE, this.onMove, this);
    this.input.off(Phaser.Input.Events.POINTER_UP, this.onUp, this);
    this.input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.onUp, this);
  }

  // ---------- Mira: arrasto em qualquer ponto do canvas ----------
  private onDown(p: Phaser.Input.Pointer): void {
    if (!this.run?.canAim()) return;
    this.drag = { sx: p.worldX, sy: p.worldY, cx: p.worldX, cy: p.worldY };
  }

  private onMove(p: Phaser.Input.Pointer): void {
    if (!this.drag) return;
    this.drag.cx = p.worldX;
    this.drag.cy = p.worldY;
  }

  private onUp(p: Phaser.Input.Pointer): void {
    const d = this.drag;
    if (!d) return;
    this.drag = null;
    this.aimView.hide();
    const run = this.run;
    if (!run?.canAim()) return;
    d.cx = p.worldX;
    d.cy = p.worldY;
    const aim = aimAngle(d.sx, d.sy, d.cx, d.cy, this.aimCfg, this.aim);
    if (!aim) return; // puxão curto cancela
    if (run.launch(aim.angle, aim.power)) this.orbView.reset();
  }

  // ---------- Laço ----------
  override update(time: number, delta: number): void {
    const run = this.run;
    let frames = 0;
    if (run && run.state.turn !== this.lastTurn) this.readCombat(); // Recolher (fora do laço)
    if (run && !run.paused) {
      this.acc += delta;
      while (this.acc >= FRAME_MS && frames < MAX_FRAMES_PER_UPDATE) {
        this.acc -= FRAME_MS;
        frames++;
        // Fora do voo frame() não roda step(): os buffers são do último passo e não podem ser relidos.
        const flying = run.state.phase === 'flight';
        run.frame();
        if (flying) {
          this.readPhysicsHits();
          this.readCombat();
        }
      }
      if (frames === MAX_FRAMES_PER_UPDATE) this.acc = 0;
    } else {
      this.acc = 0;
    }

    this.arena.update(time, frames);
    for (const r of this.rings) r.update(time, frames);
    for (const b of this.bumpers) b.update(frames);
    for (const p of this.pillars) p.update(frames);
    this.updateFx(frames);
    if (!run) return;

    this.syncEnemies(frames);
    this.orbView.update(run.match.engine, frames);
    this.launcher.setLoaded(run.state.phase === 'aim');

    const d = this.drag;
    if (d && run.canAim()) {
      const aim = aimAngle(d.sx, d.sy, d.cx, d.cy, this.aimCfg, this.aim);
      if (aim) {
        const l = run.match.arenaDef.launch;
        const bounces = run.state.previewBounces >= 2 ? 2 : 1;
        this.aimView.show(l.x, l.y, aim.angle, bounces, d.sx, d.sy, time);
      } else {
        this.aimView.hide();
      }
    } else {
      if (d) this.drag = null; // pausa/draft durante o arrasto cancela a mira
      this.aimView.hide();
    }
  }

  /** Acende bumpers/pilar/anel atingidos no último frame lógico. */
  private readPhysicsHits(): void {
    const engine = this.run?.match.engine;
    if (!engine) return;
    for (let i = 0; i < engine.eventsCount; i++) {
      const ev = engine.getEvent(i);
      if (ev.type === 'bumperHit') this.bumpers[ev.index]?.flash();
      else if (ev.type === 'pillarHit') this.pillars[ev.index]?.flash();
      else if (ev.type === 'ringPass') {
        const ring = this.rings[ev.index];
        if (!ring) continue;
        ring.flash();
        const def = this.run!.match.arenaDef.rings[ev.index];
        if (def) this.fxLayer.fx.onRingPass(def.x, def.y);
      }
    }
  }

  /** Eventos de saída do CombatResolver → efeitos (decisão 21). */
  private readCombat(): void {
    const run = this.run;
    if (!run) return;
    this.lastTurn = run.state.turn;
    const combat = run.match.combat;
    const fx = this.fxLayer.fx;
    for (let i = 0; i < combat.eventsCount; i++) fx.onCombat(combat.getEvent(i), this);
  }

  /** Avança e desenha os efeitos; a tremida desloca a câmera em torno do centro do mundo. */
  private updateFx(frames: number): void {
    const fx = this.fxLayer.fx;
    const wasShaking = fx.shake.active;
    fx.step(frames);
    this.fxLayer.render();
    if (wasShaking || fx.shake.active) {
      this.cameras.main.centerOn(WORLD_WIDTH / 2 + fx.shake.ox, WORLD_HEIGHT / 2 + fx.shake.oy);
    }
  }

  // ---------- FxTargets ----------
  radius(enemyId: number): number {
    return this.enemies.get(enemyId)?.radius ?? 0;
  }

  hit(enemyId: number, squash: boolean): void {
    this.enemies.get(enemyId)?.hit(squash);
  }

  rimColor(typeId: string): number {
    let c = this.rimCache.get(typeId);
    if (c === undefined) {
      const def = this.gameData.enemies[typeId];
      const pal = (def && ENEMY_PALETTES[def.spriteKey]) || DEFAULT_ENEMY_PALETTE;
      c = parseInt(pal.rim.slice(1), 16);
      this.rimCache.set(typeId, c);
    }
    return c;
  }

  /** Cria/atualiza/descarta as views pelos ids dos inimigos vivos (varredura por marca, sem alocar). */
  private syncEnemies(frames: number): void {
    const run = this.run;
    if (!run) return;
    const mark = ++this.sweep;
    for (const en of run.state.enemies) {
      let v = this.enemies.get(en.id);
      if (!v) {
        v = new EnemyView(this, en, this.res);
        this.enemies.set(en.id, v);
      } else {
        v.update(en, frames);
      }
      v.seen = mark;
    }
    if (this.enemies.size === run.state.enemies.length) return;
    for (const [id, v] of this.enemies) {
      if (v.seen !== mark) {
        v.destroy();
        this.enemies.delete(id);
      }
    }
  }
}
