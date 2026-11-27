/**
 * Entrada da UI HTML (BRF-017). Só conversa com o jogo pelo `gameBus` e com o meta pelo perfil.
 * Uso no main.ts: `mountUI(document.getElementById('ui-root')!)`.
 */
import '../styles/ui.css';
import { mountSkin } from './skin';
import { gameBus, type GameEvents, type RunState } from '../core/events';
import type { EventBus } from '../core/EventBus';
import { loadGameData } from '../data/types';
import { audio as defaultAudio, type AudioEngine } from '../audio';
import {
  effectiveReducedMotion,
  getProfile,
  type PlayerData,
  type PlayerProfile,
  type PlayerSettings,
  type ReducedMotionPref,
} from '../meta/profile';
import { el, show } from './dom';
import { createHud } from './hud';
import { watchLayout } from './layout';
import { createMenu } from './menu';
import { createDraft, createEnd, createPause, systemPrefersReducedMotion } from './modals';
import type { SettingsHandlers } from './settings';

export type Screen = 'boot' | 'menu' | 'run';

/** O que a UI usa do áudio (T-046); injetável nos testes. */
export type UiAudio = Pick<AudioEngine, 'attachUnlock' | 'play' | 'setVolume' | 'setMuted'>;

export interface MountOptions {
  bus?: EventBus<GameEvents>;
  profile?: Promise<PlayerProfile>;
  audio?: UiAudio;
}

const SFX_ATTR = 'data-sfx';
const UI_SFX = new Set(['ui_tap', 'ui_back', 'pick'] as const);
type UiSfx = typeof UI_SFX extends Set<infer K> ? K : never;

export interface UIHandle {
  /** Resolve quando o perfil carregou (ou falhou). */
  readonly ready: Promise<void>;
  screen(): Screen;
  destroy(): void;
}

export function mountUI(root: HTMLElement, options: MountOptions = {}): UIHandle {
  const bus = options.bus ?? gameBus;
  const game = loadGameData();
  const defaultTotal = Object.values(game.chapters)[0]?.totalWaves ?? 0;

  let profile: PlayerProfile | null = null;
  let data: Readonly<PlayerData> | null = null;
  let screen: Screen = 'boot';
  let lastState: RunState | null = null;
  let appReady = false;

  const sfx = options.audio ?? defaultAudio;
  const detachUnlock = sfx.attachUnlock();

  // Ajustes (T-049): aplica no áudio e avisa a cena pelo `settings:changed`.
  const motionQuery =
    typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  let lastSent = '';
  function isReducedMotion(): boolean {
    return effectiveReducedMotion(data?.settings.reducedMotion ?? 'system', systemPrefersReducedMotion());
  }
  function applySettings(s: PlayerSettings, force = false): void {
    sfx.setMuted(s.muted);
    sfx.setVolume(s.sfxVolume);
    const reducedMotion = isReducedMotion();
    container.setAttribute('data-reduced-motion', String(reducedMotion));
    pause.setSettings(s);
    const payload = { muted: s.muted, sfxVolume: s.sfxVolume, reducedMotion };
    const key = JSON.stringify(payload);
    if (!force && key === lastSent) return;
    lastSent = key;
    bus.emit('settings:changed', payload);
  }
  const onSystemMotion = (): void => {
    if (data) applySettings(data.settings);
  };
  motionQuery?.addEventListener?.('change', onSystemMotion);

  const settingsHandlers: SettingsHandlers = {
    onToggleSound: () => {
      if (!profile || !data) return;
      // `updateSettings` aplica o estado na hora: ao religar, o toque já soa; ao desligar, não.
      void profile.updateSettings({ muted: !data.settings.muted });
      sfx.play('ui_tap');
    },
    onVolumeInput: (v) => sfx.setVolume(v),
    onVolumeCommit: (v) => {
      if (!profile) return;
      void profile.updateSettings({ sfxVolume: v });
      sfx.play('ui_tap');
    },
    onReducedMotion: (pref: ReducedMotionPref) => {
      void profile?.updateSettings({ reducedMotion: pref });
    },
  };

  const menu = createMenu(game, {
    onPlay: () => startRun(),
    ...settingsHandlers,
    onBuy: (id) => {
      void profile?.buyTalent(id);
    },
    // TEMP T-061: remover antes do M7 (a tela inicial atualiza pelo onChange do perfil).
    onResetSave: () => {
      void profile?.reset();
    },
  });
  const hud = createHud(game, {
    onPause: () => {
      if (screen !== 'run' || draft.visible || end.visible || pause.visible) return;
      pause.open();
      bus.emit('ui:pause', { paused: true });
    },
    onToggleSpeed: () => bus.emit('ui:toggleSpeed', {}),
    onRecall: () => bus.emit('ui:recall', {}),
  });
  const draft = createDraft(
    game,
    (perkId) => {
      refreshPause();
      bus.emit('ui:pickPerk', { perkId });
    },
    isReducedMotion,
  );
  const end = createEnd(
    () => quitToMenu(),
    () => startRun(),
    game,
  );
  const pause = createPause({
    onResume: () => {
      pause.hide();
      refreshPause();
      bus.emit('ui:pause', { paused: false });
    },
    onQuit: () => quitToMenu(),
    ...settingsHandlers,
  });

  const container = el('div', { className: 'rs-ui', attrs: { 'data-ui': 'root' } }, [
    menu.root,
    hud.root,
    draft.root,
    end.root,
    pause.root,
  ]);
  root.appendChild(container);

  // Som dos botões (T-046): um só ouvinte, na captura (antes do clique mudar o estado do botão).
  // `data-sfx` escolhe o efeito (`ui_back`, `pick`) ou `none`; o padrão é `ui_tap`.
  const onClickSfx = (e: Event): void => {
    const btn = (e.target as Element | null)?.closest?.('button');
    if (!btn || btn.disabled || !container.contains(btn) || btn.closest('.is-closing')) return;
    const key = btn.getAttribute(SFX_ATTR) ?? 'ui_tap';
    if (UI_SFX.has(key as UiSfx)) sfx.play(key as UiSfx);
  };
  container.addEventListener('click', onClickSfx, true);
  const unwatch = watchLayout(root, container);
  void mountSkin(container);

  function refreshPause(): void {
    hud.setPauseEnabled(!draft.visible && !end.visible && !pause.visible);
  }

  function setScreen(next: Screen): void {
    screen = next;
    container.setAttribute('data-screen', next);
    show(menu.root, next === 'menu');
    show(hud.root, next === 'run');
    // Toda troca de tela (inclusive Jogar de novo) começa sem modal aberto.
    draft.hide();
    end.hide();
    pause.hide();
    if (next === 'menu') {
      menu.setTab('play');
      menu.render(data, profile);
    }
    refreshPause();
  }

  function startRun(): void {
    if (!data) return;
    lastState = null;
    hud.reset();
    setScreen('run');
    bus.emit('ui:startRun', {});
  }

  function quitToMenu(): void {
    setScreen('menu');
    bus.emit('ui:quitRun', {});
  }

  const offs = [
    bus.on('app:ready', () => {
      appReady = true;
      // A cena pode ter assinado depois do 1º aviso: reenvia os ajustes.
      if (data) applySettings(data.settings, true);
      if (screen === 'boot') setScreen('menu');
    }),
    bus.on('run:state', (s) => {
      lastState = s;
      if (screen === 'run') hud.update(s);
    }),
    bus.on('run:banner', ({ text }) => {
      if (screen === 'run') hud.banner(text);
    }),
    bus.on('draft:open', ({ choices }) => {
      if (screen !== 'run') return;
      draft.open(choices, lastState?.perks ?? []);
      sfx.play('draft_open');
      refreshPause();
    }),
    bus.on('run:ended', ({ won, wave, goldEarned }) => {
      if (screen !== 'run') return;
      draft.hide();
      pause.hide();
      end.open({ won, wave, goldEarned, totalWaves: lastState?.totalWaves ?? defaultTotal });
      sfx.play(won ? 'victory' : 'defeat');
      refreshPause();
    }),
  ];

  setScreen('boot');

  let offProfile: (() => void) | undefined;
  let destroyed = false;
  const ready = (options.profile ?? getProfile()).then(
    (p) => {
      if (destroyed) return;
      profile = p;
      data = p.data();
      applySettings(data.settings, true);
      offProfile = p.onChange((d) => {
        data = d;
        applySettings(d.settings);
        if (screen === 'menu') menu.render(d, p);
      });
      if (screen === 'menu') menu.render(data, profile);
      else if (appReady && screen === 'boot') setScreen('menu');
    },
    (e: unknown) => {
      console.warn('[ui] falha ao carregar o perfil', e);
    },
  );

  return {
    ready,
    screen: () => screen,
    destroy: () => {
      destroyed = true;
      for (const off of offs) off();
      offProfile?.();
      container.removeEventListener('click', onClickSfx, true);
      motionQuery?.removeEventListener?.('change', onSystemMotion);
      detachUnlock();
      unwatch();
      hud.destroy();
      container.remove();
    },
  };
}
