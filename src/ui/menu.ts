/** Menu principal (aba Expedição) e Talentos (aba Talentos). */
import type { GameData, TalentStat } from '../data/types';
import type { PlayerData, PlayerProfile, TalentId } from '../meta/profile';
import { artIcon, atlasFrame, button, el, icon, ICONS, ribbon, show } from './dom';
import { chapterName, enemyName, t, talentDesc, talentName } from './strings';

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

function miniStat(label: string, className = 'rs-mini-stat rs-inset'): { node: HTMLElement; value: HTMLElement } {
  const value = el('b');
  return { node: el('div', { className }, [el('span', { text: label }), value]), value };
}

/** Chefe do capítulo: o inimigo fixo da última onda. */
function chapterBoss(game: GameData): string | undefined {
  const chapter = Object.values(game.chapters)[0];
  if (!chapter) return undefined;
  const waves = Object.keys(chapter.fixedSpawns).map(Number).sort((a, b) => b - a);
  for (const w of waves) {
    const id = chapter.fixedSpawns[String(w)]?.find((e) => game.enemies[e]?.isBoss);
    if (id) return id;
  }
  return undefined;
}

export function createMenu(game: GameData, h: MenuHandlers): MenuView {
  const chapter = Object.values(game.chapters)[0];
  const totalWaves = chapter?.totalWaves ?? 0;
  const bossId = chapterBoss(game);

  const goldValue = el('span', { attrs: { 'data-ui': 'menu-gold' } });
  const soundBtn = el('button', {
    className: 'rs-btn rs-btn-icon',
    attrs: { type: 'button', 'aria-label': t('sound.label'), 'data-ui': 'menu-sound' },
    onClick: () => h.onToggleSound(),
  });
  const gearBtn = el(
    'button',
    {
      className: 'rs-btn rs-btn-icon',
      attrs: { type: 'button', 'aria-label': t('settings.label'), 'data-ui': 'menu-settings' },
      onClick: () => openSettings(),
    },
    [icon(ICONS.gear, 22, 'ui_icon_gear')],
  );
  const header = el('div', { className: 'rs-menu-header' }, [
    el('div', { className: 'rs-frame rs-gold-pill', attrs: { 'aria-label': t('gold.label') } }, [
      icon(ICONS.coin, 20, 'ui_icon_coin'),
      goldValue,
      el('span', { className: 'rs-plus', text: t('menu.goldPlus'), attrs: { 'aria-hidden': 'true' } }),
    ]),
    el('div', { className: 'rs-spacer' }),
    soundBtn,
    gearBtn,
  ]);

  // Aba Expedição
  const titleBlock = el('div', { className: 'rs-titleblock' }, [
    el('div', { className: 'rs-logo', text: t('app.title') }),
    ribbon(t('app.subtitle', { n: 'I', name: chapter ? chapterName(chapter.id) : '' }), 'rs-ribbon-sub').node,
  ]);
  const bossArt = el('span', { className: 'rs-boss-art', attrs: { 'aria-hidden': 'true' } }, [icon(ICONS.skull, 64)]);
  if (bossId) atlasFrame(bossArt, 'enemies', game.enemies[bossId]?.spriteKey ?? bossId);
  const hero = el('div', { className: 'rs-hero', attrs: { 'data-ui': 'menu-boss' } }, [
    el('div', { className: 'rs-medallion' }, [bossArt]),
    bossId ? el('div', { className: 'rs-boss-name', text: t('menu.boss', { name: enemyName(bossId) }) }) : null,
  ]);
  const badge = el('span', { className: 'rs-tag', attrs: { 'data-ui': 'menu-badge' } });
  const best = miniStat(t('menu.stat.bestWave'), 'rs-best rs-inset');
  const progFill = el('div', { className: 'rs-prog-fill', attrs: { 'data-ui': 'menu-progress' } });
  best.node.appendChild(el('div', { className: 'rs-prog' }, [progFill]));
  const atk = miniStat(t('menu.stat.atk'));
  const hp = miniStat(t('menu.stat.hp'));
  const orbs = miniStat(t('menu.stat.orbs'));
  const crit = miniStat(t('menu.stat.crit'));
  best.value.setAttribute('data-ui', 'menu-best');
  atk.value.setAttribute('data-ui', 'menu-atk');
  hp.value.setAttribute('data-ui', 'menu-hp');
  orbs.value.setAttribute('data-ui', 'menu-orbs');
  crit.value.setAttribute('data-ui', 'menu-crit');
  const playBtn = button('rs-btn-primary rs-btn-play', t('menu.play'), () => h.onPlay(), { 'data-ui': 'menu-play' });
  const chapterCard = el('div', { className: 'rs-frame rs-chapter' }, [
    el('div', { className: 'rs-row' }, [
      el('h3', { className: 'rs-chapter-name', text: chapter ? chapterName(chapter.id) : '' }),
      badge,
    ]),
    best.node,
    el('div', { className: 'rs-stats', attrs: { 'aria-label': t('menu.startStats') } }, [atk.node, hp.node, orbs.node, crit.node]),
    playBtn,
  ]);
  const playPanel = el('div', { className: 'rs-panel rs-panel-play', attrs: { 'data-ui': 'tab-play' } }, [
    titleBlock,
    hero,
    chapterCard,
  ]);

  // Aba Talentos
  const talentList = el('div', { className: 'rs-talent-list' });
  const talentsPanel = el('div', { className: 'rs-panel rs-panel-talents', attrs: { 'data-ui': 'tab-talents' } }, [
    el('div', { className: 'rs-talents-head' }, [
      ribbon(t('talents.title'), 'rs-ribbon-big').node,
      el('div', { className: 'rs-caption', text: t('talents.subtitle') }),
    ]),
    talentList,
  ]);

  const talentsDot = el('i', { className: 'rs-dot', attrs: { 'data-ui': 'nav-talents-badge', 'aria-hidden': 'true' } });
  const navBtn = (key: string, label: string, ico: string, piece: string, extra: HTMLElement | null, onClick: () => void) =>
    el('button', { className: 'rs-btn rs-frame rs-nav-btn', attrs: { type: 'button', 'data-ui': key }, onClick }, [
      icon(ico, 22, piece),
      el('span', { text: label }),
      extra,
    ]);
  const navPlay = navBtn('nav-play', t('menu.tab.play'), ICONS.sword, 'ui_icon_sword', null, () => setTab('play'));
  const navTalents = navBtn('nav-talents', t('menu.tab.talents'), ICONS.star, 'ui_icon_star', talentsDot, () =>
    setTab('talents'),
  );
  const nav = el('nav', { className: 'rs-bottom-nav' }, [navPlay, navTalents]);

  // Configurações (engrenagem): por ora só o som (decisão 23).
  const settingsSound = button('rs-btn-secondary', t('pause.soundOn'), () => h.onToggleSound(), {
    'data-ui': 'settings-sound',
  });
  const settings = el(
    'section',
    { className: 'rs-modal rs-modal-center', attrs: { 'data-ui': 'modal-settings', role: 'dialog', 'aria-modal': 'true' } },
    [
      el('div', { className: 'rs-modal-body rs-frame rs-modal-panel' }, [
        ribbon(t('settings.title'), 'rs-ribbon-big rs-modal-ribbon').node,
        el('div', { className: 'rs-modal-stack' }, [
          settingsSound,
          button('rs-btn-primary rs-btn-lg', t('settings.close'), () => show(settings, false), {
            'data-ui': 'settings-close',
          }),
        ]),
      ]),
    ],
  );
  show(settings, false);
  function openSettings(): void {
    show(settings, true);
  }

  const root = el('section', { className: 'rs-screen rs-menu', attrs: { 'data-ui': 'screen-menu' } }, [
    el('div', { className: 'rs-menu-bg', attrs: { 'aria-hidden': 'true' } }),
    header,
    el('div', { className: 'rs-menu-body' }, [playPanel, talentsPanel]),
    nav,
    settings,
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

  function renderTalents(data: Readonly<PlayerData>, profile: PlayerProfile): number {
    let affordable = 0;
    talentList.replaceChildren(
      ...(Object.keys(game.talents) as TalentId[]).map((id) => {
        const def = game.talents[id];
        const lv = data.talents[id] ?? 0;
        const max = def?.maxLevel ?? 0;
        const cost = profile.talentCost(id);
        const can = profile.canBuy(id);
        if (can) affordable += 1;
        const buy = button(
          cost === null ? 'rs-btn-secondary rs-btn-buy is-max' : can ? 'rs-btn-primary rs-btn-buy' : 'rs-btn-secondary rs-btn-buy',
          cost === null ? t('talents.max') : t('talents.cost', { cost }),
          () => h.onBuy(id),
          { 'data-ui': `talent-buy-${id}` },
        );
        if (cost !== null) buy.prepend(icon(ICONS.coin, 16, 'ui_icon_coin'));
        buy.disabled = !can;
        if (cost !== null) buy.setAttribute('aria-label', t('talents.buyLabel', { name: talentName(id), cost }));
        const pips = el(
          'span',
          { className: 'rs-pips', attrs: { 'aria-hidden': 'true' } },
          Array.from({ length: max }, (_, i) => el('i', { className: i < lv ? 'is-on' : '' })),
        );
        return el('div', { className: `rs-frame rs-talent rs-talent-${id}`, attrs: { 'data-ui': `talent-${id}` } }, [
          el('span', { className: 'rs-socket rs-socket-sm' }, [artIcon(def?.iconKey ?? '', 'rs-talent-dot rs-art')]),
          el('div', { className: 'rs-talent-info' }, [
            el('div', { className: 'rs-talent-name', text: talentName(id) }),
            el('div', { className: 'rs-talent-desc', text: talentDesc(id) }),
            el('div', { className: 'rs-talent-level' }, [
              pips,
              el('span', {
                className: 'rs-talent-lv',
                text: t('talents.level', { level: lv, max }),
                attrs: { 'data-ui': `talent-lv-${id}` },
              }),
            ]),
          ]),
          buy,
        ]);
      }),
    );
    return affordable;
  }

  function render(data: Readonly<PlayerData> | null, profile: PlayerProfile | null): void {
    playBtn.disabled = !data;
    if (!data || !profile) {
      goldValue.textContent = t('common.empty');
      show(talentsDot, false);
      return;
    }
    goldValue.textContent = String(data.gold);
    soundBtn.replaceChildren(
      data.settings.muted ? icon(ICONS.soundOff, 22, 'ui_icon_sound_off') : icon(ICONS.soundOn, 22, 'ui_icon_sound'),
    );
    soundBtn.setAttribute('aria-pressed', String(!data.settings.muted));
    settingsSound.textContent = data.settings.muted ? t('pause.soundOff') : t('pause.soundOn');
    settingsSound.setAttribute('aria-pressed', String(!data.settings.muted));
    badge.textContent = data.cleared ? t('menu.badge.cleared') : t('menu.badge.waves', { total: totalWaves });
    badge.classList.toggle('is-cleared', data.cleared);
    best.value.textContent = t('menu.stat.bestWaveValue', { wave: data.bestWave, total: totalWaves });
    progFill.style.width = `${totalWaves > 0 ? Math.min(100, (data.bestWave / totalWaves) * 100) : 0}%`;
    const s = startStats(data.talents, game);
    atk.value.textContent = String(s.atk);
    hp.value.textContent = String(s.hp);
    orbs.value.textContent = String(s.orbs);
    crit.value.textContent = t('hud.critValue', { pct: pct(s.critChance) });
    const affordable = renderTalents(data, profile);
    talentsDot.textContent = String(affordable);
    show(talentsDot, affordable > 0);
    if (affordable > 0) navTalents.setAttribute('aria-description', t('menu.tabBadgeLabel', { count: affordable }));
    else navTalents.removeAttribute('aria-description');
  }

  return { root, render, setTab };
}
