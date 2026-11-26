/** Modais da partida: Draft de runas, Fim de run e Pausa. */
import type { GameData, PerkId } from '../data/types';
import { button, el, show } from './dom';
import { perkDesc, perkName, synergyName, t } from './strings';

export interface ModalView {
  readonly root: HTMLElement;
  hide(): void;
  readonly visible: boolean;
}

function modalShell(key: string, children: HTMLElement[]): HTMLElement {
  const node = el('section', { className: 'rs-modal', attrs: { 'data-ui': key, role: 'dialog', 'aria-modal': 'true' } }, [
    el('div', { className: 'rs-modal-body' }, children),
  ]);
  show(node, false);
  return node;
}

// ---------- Draft ----------
export interface DraftView extends ModalView {
  open(choices: readonly PerkId[]): void;
}

export function createDraft(game: GameData, onPick: (id: PerkId) => void): DraftView {
  const list = el('div', { className: 'rs-draft-list' });
  const root = modalShell('modal-draft', [
    el('h2', { className: 'rs-modal-title', text: t('draft.title') }),
    el('p', { className: 'rs-modal-sub', text: t('draft.subtitle') }),
    list,
  ]);
  let picked = false;

  function open(choices: readonly PerkId[]): void {
    picked = false;
    list.replaceChildren(
      ...choices.map((id) => {
        const syn = game.perks[id].synergy;
        const card = el(
          'button',
          {
            className: `rs-btn rs-draft-card rs-syn-${syn}`,
            attrs: { type: 'button', 'data-perk': id },
            onClick: () => {
              if (picked) return;
              picked = true;
              show(root, false);
              onPick(id);
            },
          },
          [
            el('span', { className: 'rs-draft-gem', attrs: { 'aria-hidden': 'true' } }),
            el('span', { className: 'rs-draft-text' }, [
              el('span', { className: 'rs-draft-syn', text: synergyName(syn) }),
              el('span', { className: 'rs-draft-name', text: perkName(id) }),
              el('span', { className: 'rs-draft-desc', text: perkDesc(id) }),
            ]),
          ],
        );
        return card;
      }),
    );
    show(root, true);
  }

  return {
    root,
    open,
    hide: () => show(root, false),
    get visible() {
      return !root.hidden;
    },
  };
}

// ---------- Fim de run ----------
export interface EndView extends ModalView {
  open(r: { won: boolean; wave: number; totalWaves: number; goldEarned: number }): void;
}

export function createEnd(onMenu: () => void, onAgain: () => void): EndView {
  const title = el('h2', { className: 'rs-modal-title', attrs: { 'data-ui': 'end-title' } });
  const sub = el('p', { className: 'rs-modal-sub' });
  const wave = el('b', { attrs: { 'data-ui': 'end-wave' } });
  const gold = el('b', { className: 'rs-text-gold', attrs: { 'data-ui': 'end-gold' } });
  const root = modalShell('modal-end', [
    title,
    sub,
    el('div', { className: 'rs-summary' }, [
      el('div', { className: 'rs-mini-stat' }, [el('span', { text: t('end.wave') }), wave]),
      el('div', { className: 'rs-mini-stat' }, [el('span', { text: t('end.gold') }), gold]),
    ]),
    el('div', { className: 'rs-modal-actions' }, [
      button('rs-btn-ghost', t('end.menu'), onMenu, { 'data-ui': 'end-menu' }),
      button('rs-btn-primary', t('end.again'), onAgain, { 'data-ui': 'end-again' }),
    ]),
  ]);

  function open(r: { won: boolean; wave: number; totalWaves: number; goldEarned: number }): void {
    title.textContent = r.won ? t('end.victory') : t('end.defeat');
    title.classList.toggle('is-victory', r.won);
    title.classList.toggle('is-defeat', !r.won);
    sub.textContent = r.won ? t('end.victorySub') : t('end.defeatSub');
    wave.textContent = t('end.waveValue', { wave: r.wave, total: r.totalWaves });
    gold.textContent = t('end.goldValue', { gold: r.goldEarned });
    show(root, true);
  }

  return {
    root,
    open,
    hide: () => show(root, false),
    get visible() {
      return !root.hidden;
    },
  };
}

// ---------- Pausa ----------
export interface PauseView extends ModalView {
  open(): void;
  setMuted(muted: boolean): void;
}

export function createPause(h: { onResume(): void; onQuit(): void; onToggleSound(): void }): PauseView {
  const soundBtn = button('rs-btn-ghost', t('pause.soundOn'), () => h.onToggleSound(), { 'data-ui': 'pause-sound' });
  const root = modalShell('modal-pause', [
    el('h2', { className: 'rs-modal-title', text: t('pause.title') }),
    el('div', { className: 'rs-modal-stack' }, [
      soundBtn,
      button('rs-btn-danger', t('pause.quit'), () => h.onQuit(), { 'data-ui': 'pause-quit' }),
      button('rs-btn-primary rs-btn-lg', t('pause.resume'), () => h.onResume(), { 'data-ui': 'pause-resume' }),
    ]),
  ]);

  function setMuted(muted: boolean): void {
    soundBtn.textContent = muted ? t('pause.soundOff') : t('pause.soundOn');
    soundBtn.setAttribute('aria-pressed', String(!muted));
  }

  return {
    root,
    open: () => show(root, true),
    setMuted,
    hide: () => show(root, false),
    get visible() {
      return !root.hidden;
    },
  };
}
