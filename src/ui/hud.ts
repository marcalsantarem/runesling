/** HUD da partida: faixa superior (HP, onda, ouro, pausa), faixa de runas, barra inferior e banner. */
import type { RunState } from '../core/events';
import type { GameData, PerkId } from '../data/types';
import { artIcon, button, el, icon, ICONS, show } from './dom';
import { pct } from './menu';
import { perkName, t } from './strings';

export interface HudHandlers {
  onPause(): void;
  onToggleSpeed(): void;
  onRecall(): void;
}

export interface HudView {
  readonly root: HTMLElement;
  update(state: RunState): void;
  reset(): void;
  banner(text: string): void;
  setPauseEnabled(enabled: boolean): void;
  destroy(): void;
}

export const BANNER_MS = 1800;

/** Agrupa runas repetidas, mantendo a ordem da primeira escolha. */
export function groupPerks(perks: readonly PerkId[]): { id: PerkId; count: number }[] {
  const out: { id: PerkId; count: number }[] = [];
  for (const id of perks) {
    const g = out.find((o) => o.id === id);
    if (g) g.count += 1;
    else out.push({ id, count: 1 });
  }
  return out;
}

function stat(label: string, key: string): { node: HTMLElement; value: HTMLElement } {
  const value = el('b', { attrs: { 'data-ui': key } });
  return { node: el('span', { className: 'rs-foot-stat rs-inset' }, [el('small', { text: label }), value]), value };
}

export function createHud(game: GameData, h: HudHandlers): HudView {
  const hpFill = el('div', { className: 'rs-hp-fill' });
  const hpText = el('span', { className: 'rs-hp-txt', attrs: { 'data-ui': 'hud-hp' } });
  const waveNum = el('b');
  const waveTotal = el('em');
  const waveText = el('div', { className: 'rs-wave', attrs: { 'data-ui': 'hud-wave', role: 'status' } }, [
    el('small', { text: t('hud.waveLabel'), attrs: { 'aria-hidden': 'true' } }),
    el('span', { className: 'rs-wave-num', attrs: { 'aria-hidden': 'true' } }, [waveNum, waveTotal]),
  ]);
  const goldText = el('span', { attrs: { 'data-ui': 'hud-gold' } });
  const pauseBtn = el(
    'button',
    {
      className: 'rs-btn rs-btn-icon',
      attrs: { type: 'button', 'aria-label': t('hud.pause'), 'data-ui': 'hud-pause' },
      onClick: () => h.onPause(),
    },
    [icon(ICONS.pause, 22, 'ui_icon_pause')],
  );

  const top = el('div', { className: 'rs-hud-bar rs-hud-top' }, [
    el('div', { className: 'rs-hp', attrs: { 'aria-label': t('hud.hpLabel') } }, [
      icon(ICONS.heart, 20, 'ui_icon_heart'),
      el('div', { className: 'rs-hp-track' }, [hpFill]),
      hpText,
    ]),
    waveText,
    el('span', { className: 'rs-hud-gold', attrs: { 'aria-label': t('hud.goldLabel') } }, [
      icon(ICONS.coin, 18, 'ui_icon_coin'),
      goldText,
    ]),
    pauseBtn,
  ]);
  const strip = el('div', { className: 'rs-rune-strip', attrs: { 'data-ui': 'hud-runes' } });
  const topBand = el('div', { className: 'rs-band rs-band-top' }, [top, strip]);

  const atk = stat(t('hud.atk'), 'hud-atk');
  const orbs = stat(t('hud.orbs'), 'hud-orbs');
  const crit = stat(t('hud.crit'), 'hud-crit');
  const recallBtn = el(
    'button',
    {
      className: 'rs-btn rs-btn-action rs-btn-recall',
      attrs: { type: 'button', 'data-ui': 'hud-recall' },
      onClick: () => h.onRecall(),
    },
    [icon(ICONS.recall, 20), el('span', { text: t('hud.recall') })],
  );
  const speedBtn = button('rs-btn-secondary rs-btn-speed', t('hud.speed.1'), () => h.onToggleSpeed(), {
    'data-ui': 'hud-speed',
  });
  const bottom = el('div', { className: 'rs-hud-bar rs-hud-bottom' }, [
    el('div', { className: 'rs-foot-stats' }, [atk.node, orbs.node, crit.node]),
    el('div', { className: 'rs-foot-btns' }, [speedBtn, recallBtn]),
  ]);
  const bottomBand = el('div', { className: 'rs-band rs-band-bottom' }, [bottom]);

  const bannerText = el('span', { className: 'rs-ribbon-text' });
  const bannerEl = el('div', { className: 'rs-banner rs-ribbon rs-ribbon-big', attrs: { 'data-ui': 'hud-banner', role: 'status' } }, [
    bannerText,
  ]);

  const root = el('section', { className: 'rs-screen rs-hud', attrs: { 'data-ui': 'screen-hud' } }, [
    topBand,
    bannerEl,
    bottomBand,
  ]);

  let bannerTimer: ReturnType<typeof setTimeout> | undefined;
  let lastPerks = '';

  function renderRunes(perks: readonly PerkId[]): void {
    const key = perks.join(',');
    if (key === lastPerks && strip.childElementCount > 0) return;
    lastPerks = key;
    if (perks.length === 0) {
      strip.replaceChildren(el('span', { className: 'rs-rune-hint', text: t('hud.runesEmpty') }));
      return;
    }
    strip.replaceChildren(
      ...groupPerks(perks).map(({ id, count }) =>
        el(
          'span',
          {
            className: `rs-rune rs-syn-${game.perks[id].synergy}`,
            attrs: {
              'data-perk': id,
              'aria-label': count > 1 ? t('hud.runeCount', { name: perkName(id), count }) : perkName(id),
            },
          },
          [
            artIcon(game.perks[id].iconKey, 'rs-rune-icon rs-art'),
            count > 1 ? el('span', { className: 'rs-rune-count', text: t('hud.runeStack', { count }) }) : null,
          ],
        ),
      ),
    );
  }

  function update(s: RunState): void {
    const ratio = s.maxHp > 0 ? Math.max(0, Math.min(1, s.hp / s.maxHp)) : 0;
    hpFill.style.width = `${ratio * 100}%`;
    hpText.textContent = t('hud.hp', { hp: s.hp, max: s.maxHp });
    waveNum.textContent = String(s.wave);
    waveTotal.textContent = t('hud.waveTotal', { total: s.totalWaves });
    waveText.setAttribute('aria-label', t('hud.wave', { wave: s.wave, total: s.totalWaves }));
    goldText.textContent = String(s.gold);
    atk.value.textContent = String(s.atk);
    orbs.value.textContent = String(s.orbs);
    crit.value.textContent = t('hud.critValue', { pct: pct(s.crit) });
    const speedText = t(`hud.speed.${s.speed}`);
    speedBtn.textContent = speedText;
    speedBtn.setAttribute('aria-label', t('hud.speedLabel', { speed: speedText }));
    speedBtn.classList.toggle('is-on', s.speed === 2);
    show(recallBtn, s.phase === 'flight');
    renderRunes(s.perks);
  }

  function hideBanner(): void {
    if (bannerTimer !== undefined) clearTimeout(bannerTimer);
    bannerTimer = undefined;
    bannerEl.classList.remove('is-shown');
    show(bannerEl, false);
  }

  function banner(text: string): void {
    hideBanner();
    bannerText.textContent = text;
    show(bannerEl, true);
    bannerEl.classList.add('is-shown');
    bannerTimer = setTimeout(hideBanner, BANNER_MS);
  }

  function reset(): void {
    hideBanner();
    lastPerks = '';
    hpFill.style.width = '100%';
    for (const n of [hpText, waveNum, waveTotal, goldText, atk.value, orbs.value, crit.value]) n.textContent = '';
    waveText.removeAttribute('aria-label');
    speedBtn.textContent = t('hud.speed.1');
    speedBtn.setAttribute('aria-label', t('hud.speedLabel', { speed: t('hud.speed.1') }));
    speedBtn.classList.remove('is-on');
    show(recallBtn, false);
    renderRunes([]);
  }

  function setPauseEnabled(enabled: boolean): void {
    pauseBtn.disabled = !enabled;
  }

  reset();
  return { root, update, reset, banner, setPauseEnabled, destroy: hideBanner };
}
