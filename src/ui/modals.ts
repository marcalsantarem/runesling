/** Modais da partida: Draft de runas, Fim de run e Pausa. */
import type { ItemDrop } from '../core/events';
import { loadGameData, type GameData, type PerkId, type Synergy } from '../data/types';
import { itemChip } from './equipment';
import { artIcon, atlasFrame, el, icon, ICONS, plate, ribbon, show } from './dom';
import type { PlayerSettings } from '../meta/profile';
import { createSettingsControls, type SettingsHandlers } from './settings';
import { perkDesc, perkName, synergyName, t } from './strings';

export interface ModalView {
  readonly root: HTMLElement;
  hide(): void;
  readonly visible: boolean;
}

function modalShell(key: string, children: (HTMLElement | null)[], bodyClass = 'rs-modal-panel'): HTMLElement {
  const node = el('section', { className: 'rs-modal', attrs: { 'data-ui': key, role: 'dialog', 'aria-modal': 'true' } }, [
    el('div', { className: `rs-modal-body ${bodyClass}`.trim() }, children),
  ]);
  show(node, false);
  return node;
}

/** Duração do destaque da carta escolhida antes de o Draft sumir (0 com movimento reduzido). */
export const DRAFT_PICK_MS = 260;

/** Preferência do sistema por menos movimento. */
export function systemPrefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Selo da carta: 1ª runa da sinergia ou n-ésima (a sinergia Arcana não tem selo). */
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

/** `reducedMotion`: valor efetivo de "Reduzir movimento" (padrão: o do sistema). */
export function createDraft(
  game: GameData,
  onPick: (id: PerkId) => void,
  reducedMotion: () => boolean = systemPrefersReducedMotion,
): DraftView {
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
        const r = game.perks[id].rarity;
        const rarity = r === 'rare' || r === 'epic' ? t(`draft.rarity.${r}`) : null;
        const card: HTMLButtonElement = el(
          'button',
          {
            className: `rs-btn rs-draft-card rs-syn-${syn}`,
            attrs: { type: 'button', 'data-perk': id, 'data-sfx': 'pick' },
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
            // Capas de canto na cor da sinergia (peça ui_gem_* entra no encaixe do ícone).
            el('span', { className: 'rs-gem', attrs: { 'aria-hidden': 'true' } }, [
              el('i', { className: 'rs-cap rs-cap-tl' }),
              el('i', { className: 'rs-cap rs-cap-tr' }),
              el('i', { className: 'rs-cap rs-cap-bl' }),
              el('i', { className: 'rs-cap rs-cap-br' }),
            ]),
            el('span', { className: 'rs-draft-in' }, [
              el('span', { className: 'rs-socket rs-draft-socket' }, [artIcon(game.perks[id].iconKey, 'rs-draft-gem rs-art')]),
              el('span', { className: 'rs-draft-tx' }, [
                el('span', { className: 'rs-draft-name', text: perkName(id) }),
                el('span', { className: 'rs-draft-tags' }, [
                  el('span', { className: 'rs-draft-syn', text: synergyName(syn) }),
                  rarity ? el('span', { className: 'rs-draft-syn rs-draft-rare', text: rarity }) : null,
                ]),
                el('span', { className: 'rs-draft-desc', text: perkDesc(id) }),
              ]),
              seal ? el('span', { className: `rs-draft-seal${owned.some((o) => game.perks[o]?.synergy === syn) ? '' : ' is-new'}`, text: seal }) : null,
            ]),
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
  open(r: { won: boolean; wave: number; totalWaves: number; goldEarned: number; items?: readonly ItemDrop[] }): void;
}

export function createEnd(onMenu: () => void, onAgain: () => void, game?: GameData): EndView {
  const titleRibbon = ribbon('', 'rs-ribbon-big rs-modal-ribbon rs-end-ribbon');
  const title = titleRibbon.label;
  title.setAttribute('data-ui', 'end-title');
  // Medalhão: chefe com selo de vitória, ou escudo da barreira rachado soltando cacos (CSS/SVG).
  const bossPic = el('span', { className: 'rs-atlas rs-end-pic', attrs: { 'aria-hidden': 'true' } });
  const bossId = game ? Object.values(game.enemies).filter((e) => e.isBoss).pop()?.id : undefined;
  if (game && bossId) atlasFrame(bossPic, 'enemies', game.enemies[bossId]?.spriteKey ?? bossId);
  const seal = el('span', { className: 'rs-end-seal' }, [icon(ICONS.check, 34, 'ui_icon_check')]);
  const shield = el('span', { className: 'rs-end-shield' }, [
    icon(ICONS.shield, 100),
    ...[0, 1, 2].map((i) => el('i', { className: `rs-shard rs-shard-${i}` })),
  ]);
  const emblem = el('div', { className: 'rs-end-emblem', attrs: { 'aria-hidden': 'true' } }, [bossPic, seal, shield]);
  const sub = el('p', { className: 'rs-modal-sub rs-end-sub' });
  const wave = el('b', { attrs: { 'data-ui': 'end-wave' } });
  const gold = el('b', { className: 'rs-text-gold', attrs: { 'data-ui': 'end-gold' } });
  // Itens ganhos na run (T-079, `run:ended.items`); some quando não veio nenhum.
  const endItemsRow = el('div', { className: 'rs-end-items-row' });
  const endItems = el('div', { className: 'rs-end-items', attrs: { 'data-ui': 'end-items' } }, [
    el('small', { text: t('end.items') }),
    endItemsRow,
  ]);
  const rivets = ['tl', 'tr', 'bl', 'br'].map((p) => el('i', { className: `rs-rv4 rs-rv4-${p}`, attrs: { 'aria-hidden': 'true' } }));
  const root = modalShell(
    'modal-end',
    [
      el('div', { className: 'rs-end-fx', attrs: { 'aria-hidden': 'true' } }, [
        el('div', { className: 'rs-end-rays' }),
        ...[40, 90, 150, 230, 300, 350].map((x, i) => {
          const e = el('i', { className: 'rs-ember' });
          e.style.left = `${(x / 390) * 100}%`;
          e.style.setProperty('--d', `${5.5 + (i % 3)}s`);
          e.style.setProperty('--dl', `${(i * 0.9) % 3}s`);
          e.style.setProperty('--dx', `${i % 2 ? -24 : 26}px`);
          return e;
        }),
      ]),
      emblem,
      titleRibbon.node,
      sub,
      el('div', { className: 'rs-summary' }, [
        ...rivets,
        el('div', { className: 'rs-summary-in' }, [
          el('div', { className: 'rs-summary-row' }, [el('small', { text: t('end.wave') }), wave]),
          el('div', { className: 'rs-summary-row' }, [
            el('small', { text: t('end.gold') }),
            el('span', { className: 'rs-gold-value' }, [icon(ICONS.coin, 34, 'ui_icon_coin'), gold]),
          ]),
        ]),
      ]),
      endItems,
      el('div', { className: 'rs-modal-actions' }, [
        plate('gold', t('end.again'), onAgain, { size: 'lg', className: 'rs-btn-wide', attrs: { 'data-ui': 'end-again' } }),
        plate('iron', t('end.menu'), onMenu, { attrs: { 'data-ui': 'end-menu', 'data-sfx': 'ui_back' } }),
      ]),
    ],
    'rs-modal-bare rs-end-body',
  );
  root.classList.add('rs-modal-end');

  function open(r: { won: boolean; wave: number; totalWaves: number; goldEarned: number; items?: readonly ItemDrop[] }): void {
    const items = r.items ?? [];
    const data = game ?? loadGameData();
    endItemsRow.replaceChildren(...items.map((i) => itemChip(data, i)));
    show(endItems, items.length > 0);
    title.textContent = r.won ? t('end.victory') : t('end.defeat');
    titleRibbon.node.classList.toggle('is-victory', r.won);
    titleRibbon.node.classList.toggle('is-defeat', !r.won);
    emblem.classList.toggle('is-victory', r.won);
    root.classList.toggle('is-victory', r.won);
    root.classList.toggle('is-defeat', !r.won);
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
  setSettings(settings: PlayerSettings): void;
}

export interface PauseHandlers extends SettingsHandlers {
  onResume(): void;
  onQuit(): void;
}

export function createPause(h: PauseHandlers): PauseView {
  const controls = createSettingsControls('pause', h);
  const root = modalShell(
    'modal-pause',
    [
      ribbon(t('pause.title'), 'rs-ribbon-big rs-modal-ribbon').node,
      el('div', { className: 'rs-modal-stack' }, [
        plate('gold', t('pause.resume'), () => h.onResume(), { size: 'lg', className: 'rs-btn-wide', attrs: { 'data-ui': 'pause-resume' } }),
        ...controls.nodes,
        plate('iron', t('pause.quit'), () => h.onQuit(), { attrs: { 'data-ui': 'pause-quit', 'data-sfx': 'ui_back' } }),
      ]),
    ],
    'rs-modal-panel rs-pause-body',
  );
  root.classList.add('rs-modal-center');

  return {
    root,
    open: () => show(root, true),
    setSettings: (s) => controls.update(s),
    hide: () => show(root, false),
    get visible() {
      return !root.hidden;
    },
  };
}
