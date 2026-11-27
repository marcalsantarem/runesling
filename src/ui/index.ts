/**
 * Entrada da UI HTML (BRF-017). Só conversa com o jogo pelo `gameBus` e com o meta pelo perfil.
 * Uso no main.ts: `mountUI(document.getElementById('ui-root')!)`.
 */
import '../styles/ui.css';
import { mountSkin } from './skin';
import { gameBus, type GameEvents, type RunState } from '../core/events';
import type { EventBus } from '../core/EventBus';
import { loadGameData } from '../data/types';
import { getProfile, type PlayerData, type PlayerProfile } from '../meta/profile';
import { el, show } from './dom';
import { createHud } from './hud';
import { watchLayout } from './layout';
import { createMenu } from './menu';
import { createDraft, createEnd, createPause } from './modals';

export type Screen = 'boot' | 'menu' | 'run';

export interface MountOptions {
  bus?: EventBus<GameEvents>;
  profile?: Promise<PlayerProfile>;
}

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

  const toggleSound = () => {
    if (!profile || !data) return;
    void profile.updateSettings({ muted: !data.settings.muted });
  };

  const menu = createMenu(game, {
    onPlay: () => startRun(),
    onToggleSound: toggleSound,
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
  const draft = createDraft(game, (perkId) => {
    refreshPause();
    bus.emit('ui:pickPerk', { perkId });
  });
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
    onToggleSound: toggleSound,
  });

  const container = el('div', { className: 'rs-ui', attrs: { 'data-ui': 'root' } }, [
    menu.root,
    hud.root,
    draft.root,
    end.root,
    pause.root,
  ]);
  root.appendChild(container);
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
      refreshPause();
    }),
    bus.on('run:ended', ({ won, wave, goldEarned }) => {
      if (screen !== 'run') return;
      draft.hide();
      pause.hide();
      end.open({ won, wave, goldEarned, totalWaves: lastState?.totalWaves ?? defaultTotal });
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
      pause.setMuted(data.settings.muted);
      offProfile = p.onChange((d) => {
        data = d;
        pause.setMuted(d.settings.muted);
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
      unwatch();
      hud.destroy();
      container.remove();
    },
  };
}
