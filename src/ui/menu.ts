/** Menu principal (aba Expedição) e Talentos (aba Talentos). */
import type { GameData, TalentStat } from '../data/types';
import type { PlayerData, PlayerProfile, TalentId } from '../meta/profile';
import { button, el, icon, ICONS, show } from './dom';
import { chapterName, t, talentDesc, talentName } from './strings';

export type MenuTab = 'play' | 'talents';

export interface MenuView {
  readonly root: HTMLElement;
  render(data: Readonly<PlayerData> | null, profile: PlayerProfile | null): void;
  setTab(tab: MenuTab): void;
}

export interface MenuHandlers {
  onPlay(): void;
  onToggleSound(): void;
  onBuy(id: TalentId): void;
}

export interface StartStats {
  atk: number;
  hp: number;
  orbs: number;
  critChance: number;
  goldMult: number;
}

const STAT_FIELD: Record<TalentStat, keyof StartStats> = {
  atk: 'atk',
  maxHp: 'hp',
  orbs: 'orbs',
  critChance: 'critChance',
  goldMult: 'goldMult',
};

/** Atributos de início da run com os talentos (só exibição; a partida calcula os seus). */
export function startStats(talents: Readonly<Record<string, number>>, game: GameData): StartStats {
  const s: StartStats = { ...game.rules.runStart };
  for (const [id, def] of Object.entries(game.talents)) {
    s[STAT_FIELD[def.effect.stat]] += (talents[id] ?? 0) * def.effect.perLevel;
  }
  return s;
}

export function pct(v: number): number {
  return Math.round(v * 100);
}

function miniStat(label: string): { node: HTMLElement; value: HTMLElement } {
  const value = el('b');
  return { node: el('div', { className: 'rs-mini-stat' }, [el('span', { text: label }), value]), value };
}

export function createMenu(game: GameData, h: MenuHandlers): MenuView {
  const chapter = Object.values(game.chapters)[0];
  const totalWaves = chapter?.totalWaves ?? 0;

  const goldValue = el('span', { attrs: { 'data-ui': 'menu-gold' } });
  const soundBtn = el('button', {
    className: 'rs-btn rs-icon-btn',
    attrs: { type: 'button', 'aria-label': t('sound.label'), 'data-ui': 'menu-sound' },
    onClick: () => h.onToggleSound(),
  });
  const header = el('div', { className: 'rs-menu-header' }, [
    el('div', { className: 'rs-gold-pill', attrs: { 'aria-label': t('gold.label') } }, [icon(ICONS.coin, 17), goldValue]),
    soundBtn,
  ]);

  // Aba Expedição
  const hero = el('div', { className: 'rs-hero' }, [
    el('div', { className: 'rs-logo', text: t('app.title') }),
    el('div', {
      className: 'rs-logo-sub',
      text: t('app.subtitle', { n: 'I', name: chapter ? chapterName(chapter.id) : '' }),
    }),
  ]);
  const badge = el('span', { className: 'rs-badge', attrs: { 'data-ui': 'menu-badge' } });
  const best = miniStat(t('menu.stat.bestWave'));
  const atk = miniStat(t('menu.stat.atk'));
  const hp = miniStat(t('menu.stat.hp'));
  const orbs = miniStat(t('menu.stat.orbs'));
  const crit = miniStat(t('menu.stat.crit'));
  best.value.setAttribute('data-ui', 'menu-best');
  atk.value.setAttribute('data-ui', 'menu-atk');
  hp.value.setAttribute('data-ui', 'menu-hp');
  orbs.value.setAttribute('data-ui', 'menu-orbs');
  crit.value.setAttribute('data-ui', 'menu-crit');
  const playBtn = button('rs-btn-primary rs-btn-lg', t('menu.play'), () => h.onPlay(), { 'data-ui': 'menu-play' });
  const chapterCard = el('div', { className: 'rs-card rs-chapter' }, [
    el('div', { className: 'rs-row' }, [
      el('span', { className: 'rs-chapter-name', text: chapter ? chapterName(chapter.id) : '' }),
      badge,
    ]),
    el('div', { className: 'rs-best' }, [best.node]),
    el('div', { className: 'rs-caption', text: t('menu.startStats') }),
    el('div', { className: 'rs-stats' }, [atk.node, hp.node, orbs.node, crit.node]),
    playBtn,
  ]);
  const playPanel = el('div', { className: 'rs-panel rs-panel-play', attrs: { 'data-ui': 'tab-play' } }, [
    hero,
    el('div', { className: 'rs-spacer' }),
    chapterCard,
  ]);

  // Aba Talentos
  const talentList = el('div', { className: 'rs-talent-list' });
  const talentsPanel = el('div', { className: 'rs-panel rs-panel-talents', attrs: { 'data-ui': 'tab-talents' } }, [
    el('div', { className: 'rs-section-title', text: t('talents.title') }),
    el('div', { className: 'rs-caption', text: t('talents.subtitle') }),
    talentList,
  ]);

  const navPlay = button('rs-nav-btn', t('menu.tab.play'), () => setTab('play'), { 'data-ui': 'nav-play' });
  const navTalents = button('rs-nav-btn', t('menu.tab.talents'), () => setTab('talents'), {
    'data-ui': 'nav-talents',
  });
  const nav = el('nav', { className: 'rs-bottom-nav' }, [navPlay, navTalents]);

  const root = el('section', { className: 'rs-screen rs-menu', attrs: { 'data-ui': 'screen-menu' } }, [
    header,
    el('div', { className: 'rs-menu-body' }, [playPanel, talentsPanel]),
    nav,
  ]);

  let tab: MenuTab = 'play';
  function setTab(next: MenuTab): void {
    tab = next;
    show(playPanel, tab === 'play');
    show(talentsPanel, tab === 'talents');
    navPlay.classList.toggle('is-active', tab === 'play');
    navTalents.classList.toggle('is-active', tab === 'talents');
  }
  setTab('play');

  function renderTalents(data: Readonly<PlayerData>, profile: PlayerProfile): void {
    talentList.replaceChildren(
      ...(Object.keys(game.talents) as TalentId[]).map((id) => {
        const def = game.talents[id];
        const lv = data.talents[id] ?? 0;
        const max = def?.maxLevel ?? 0;
        const cost = profile.talentCost(id);
        const can = profile.canBuy(id);
        const buy = button(
          can ? 'rs-btn-gold rs-btn-sm' : 'rs-btn-ghost rs-btn-sm',
          cost === null ? t('talents.max') : t('talents.cost', { cost }),
          () => h.onBuy(id),
          { 'data-ui': `talent-buy-${id}` },
        );
        buy.disabled = !can;
        if (cost !== null) buy.setAttribute('aria-label', t('talents.buyLabel', { name: talentName(id), cost }));
        return el('div', { className: `rs-card rs-talent rs-talent-${id}`, attrs: { 'data-ui': `talent-${id}` } }, [
          el('span', { className: 'rs-talent-dot', attrs: { 'aria-hidden': 'true' } }),
          el('div', { className: 'rs-talent-info' }, [
            el('div', { className: 'rs-row' }, [
              el('span', { className: 'rs-talent-name', text: talentName(id) }),
              el('span', {
                className: 'rs-talent-lv',
                text: t('talents.level', { level: lv, max }),
                attrs: { 'data-ui': `talent-lv-${id}` },
              }),
            ]),
            el('div', { className: 'rs-talent-desc', text: talentDesc(id) }),
          ]),
          buy,
        ]);
      }),
    );
  }

  function render(data: Readonly<PlayerData> | null, profile: PlayerProfile | null): void {
    playBtn.disabled = !data;
    if (!data || !profile) {
      goldValue.textContent = t('common.empty');
      return;
    }
    goldValue.textContent = String(data.gold);
    soundBtn.replaceChildren(icon(data.settings.muted ? ICONS.soundOff : ICONS.soundOn, 20));
    soundBtn.setAttribute('aria-pressed', String(!data.settings.muted));
    badge.textContent = data.cleared ? t('menu.badge.cleared') : t('menu.badge.waves', { total: totalWaves });
    badge.classList.toggle('is-cleared', data.cleared);
    best.value.textContent = t('menu.stat.bestWaveValue', { wave: data.bestWave, total: totalWaves });
    const s = startStats(data.talents, game);
    atk.value.textContent = String(s.atk);
    hp.value.textContent = String(s.hp);
    orbs.value.textContent = String(s.orbs);
    crit.value.textContent = t('hud.critValue', { pct: pct(s.critChance) });
    renderTalents(data, profile);
  }

  return { root, render, setTab };
}
