/** Modais da partida: Draft de runas, Fim de run e Pausa. */
import type { GameData, PerkId, Synergy } from '../data/types';
import { artIcon, button, el, icon, ICONS, ribbon, show } from './dom';
import { perkDesc, perkName, synergyName, t } from './strings';

export interface ModalView {
  readonly root: HTMLElement;
  hide(): void;
  readonly visible: boolean;
}

function modalShell(key: string, children: (HTMLElement | null)[], bodyClass = 'rs-frame rs-modal-panel'): HTMLElement {
  const node = el('section', { className: 'rs-modal', attrs: { 'data-ui': key, role: 'dialog', 'aria-modal': 'true' } }, [
    el('div', { className: `rs-modal-body ${bodyClass}`.trim() }, children),
  ]);
  show(node, false);
  return node;
}

/** Duração do destaque da carta escolhida antes de o Draft sumir (0 com `prefers-reduced-motion`). */
export const DRAFT_PICK_MS = 260;

function reducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Selo da carta: 1ª runa da sinergia ou n-ésima (a sinergia Núcleo não tem selo). */
export function synergySeal(synergy: Synergy, owned: readonly PerkId[], game: GameData): string | null {
  if (synergy === 'core') return null;
  const n = owned.filter((id) => game.perks[id]?.synergy === synergy).length;
  return n === 0 ? t('draft.newSynergy') : t('draft.nthSynergy', { n: n + 1 });
}

// ---------- Draft ----------
export interface DraftView extends ModalView {
  /** `owned`: runas já escolhidas na run (para o selo de sinergia). */
  open(choices: readonly PerkId[], owned?: readonly PerkId[]): void;
}

export function createDraft(game: GameData, onPick: (id: PerkId) => void): DraftView {
  const list = el('div', { className: 'rs-draft-list' });
  const root = modalShell(
    'modal-draft',
    [
      el('div', { className: 'rs-modal-head' }, [
        ribbon(t('draft.title'), 'rs-ribbon-big rs-modal-ribbon').node,
        el('p', { className: 'rs-modal-sub', text: t('draft.subtitle') }),
      ]),
      list,
    ],
    'rs-modal-bare',
  );
  root.classList.add('rs-modal-draft');
  let picked = false;
  let open_ = false;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  function finishClose(): void {
    if (closeTimer !== undefined) clearTimeout(closeTimer);
    closeTimer = undefined;
    root.classList.remove('is-closing');
    show(root, false);
  }

  function open(choices: readonly PerkId[], owned: readonly PerkId[] = []): void {
    finishClose();
    picked = false;
    open_ = true;
    list.replaceChildren(
      ...choices.map((id, i) => {
        const syn = game.perks[id].synergy;
        const seal = synergySeal(syn, owned, game);
        const card: HTMLButtonElement = el(
          'button',
          {
            className: `rs-btn rs-draft-card rs-syn-${syn}`,
            attrs: { type: 'button', 'data-perk': id },
            onClick: () => {
              if (picked) return;
              picked = true;
              open_ = false;
              card.classList.add('is-picked');
              root.classList.add('is-closing');
              onPick(id);
              if (reducedMotion()) finishClose();
              else closeTimer = setTimeout(finishClose, DRAFT_PICK_MS);
            },
          },
          [
            el('span', { className: 'rs-gem', attrs: { 'aria-hidden': 'true' } }),
            el('span', { className: 'rs-draft-syn', text: synergyName(syn) }),
            el('span', { className: 'rs-socket' }, [artIcon(game.perks[id].iconKey, 'rs-draft-gem rs-art')]),
            el('span', { className: 'rs-draft-name', text: perkName(id) }),
            el('span', { className: 'rs-draft-desc', text: perkDesc(id) }),
            seal ? el('span', { className: 'rs-draft-seal', text: seal }) : null,
          ],
        );
        card.style.setProperty('--i', String(i));
        return card;
      }),
    );
    show(root, true);
  }

  return {
    root,
    open,
    hide: () => {
      open_ = false;
      finishClose();
    },
    get visible() {
      return open_;
    },
  };
}

// ---------- Fim de run ----------
export interface EndView extends ModalView {
  open(r: { won: boolean; wave: number; totalWaves: number; goldEarned: number }): void;
}

export function createEnd(onMenu: () => void, onAgain: () => void): EndView {
  const titleRibbon = ribbon('', 'rs-ribbon-big rs-modal-ribbon');
  const title = titleRibbon.label;
  title.setAttribute('data-ui', 'end-title');
  const emblem = el('div', { className: 'rs-end-emblem', attrs: { 'aria-hidden': 'true' } });
  const sub = el('p', { className: 'rs-modal-sub' });
  const wave = el('b', { attrs: { 'data-ui': 'end-wave' } });
  const gold = el('b', { className: 'rs-text-gold', attrs: { 'data-ui': 'end-gold' } });
  const root = modalShell('modal-end', [
    emblem,
    titleRibbon.node,
    sub,
    el('div', { className: 'rs-summary' }, [
      el('div', { className: 'rs-mini-stat rs-inset' }, [el('span', { text: t('end.wave') }), wave]),
      el('div', { className: 'rs-mini-stat rs-inset' }, [
        el('span', { text: t('end.gold') }),
        el('span', { className: 'rs-gold-value' }, [icon(ICONS.coin, 18, 'ui_icon_coin'), gold]),
      ]),
    ]),
    el('div', { className: 'rs-modal-actions' }, [
      button('rs-btn-secondary', t('end.menu'), onMenu, { 'data-ui': 'end-menu' }),
      button('rs-btn-primary', t('end.again'), onAgain, { 'data-ui': 'end-again' }),
    ]),
  ]);

  function open(r: { won: boolean; wave: number; totalWaves: number; goldEarned: number }): void {
    title.textContent = r.won ? t('end.victory') : t('end.defeat');
    titleRibbon.node.classList.toggle('is-victory', r.won);
    titleRibbon.node.classList.toggle('is-defeat', !r.won);
    emblem.replaceChildren(r.won ? icon(ICONS.star, 56, 'ui_icon_star') : icon(ICONS.skull, 56));
    emblem.classList.toggle('is-victory', r.won);
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
  const soundBtn = button('rs-btn-secondary', t('pause.soundOn'), () => h.onToggleSound(), { 'data-ui': 'pause-sound' });
  const root = modalShell('modal-pause', [
    ribbon(t('pause.title'), 'rs-ribbon-big rs-modal-ribbon').node,
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
