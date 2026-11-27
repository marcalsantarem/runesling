/**
 * Tela inicial (mapa da expedição, decisão 45: `docs/mockups/tela-inicial-final.html`) e Talentos
 * (`docs/mockups/telas-estilo.html`). As duas são "abas" da mesma tela de menu.
 */
import type { GameData, TalentStat } from '../data/types';
import type { PlayerData, PlayerProfile, TalentId } from '../meta/profile';
import { artIcon, atlasFrame, el, icon, iconButton, ICONS, plate, ribbon, setPlateLabel, show } from './dom';
import { chapterName, enemyName, t, talentDesc, talentName } from './strings';

// TEMP T-061: remover antes do M7. Flag única do botão "Resetar save" da tela inicial.
export const TEMP_RESET_SAVE = true;

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
  /** TEMP T-061: remover antes do M7. */
  onResetSave?(): void;
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

/** Tamanho de projeto do mapa (coordenadas do mockup 390×844, faixa y 160–684). */
export const MAP_W = 390;
export const MAP_H = 524;

/** Escala do mapa para caber na área livre (nunca maior que 1,15×). */
export function mapScale(w: number, h: number): number {
  if (w <= 0 || h <= 0) return 1;
  return Math.min(w / MAP_W, h / MAP_H, 1.15);
}

/** Sprite do atlas de inimigos em um nó do mapa (fallback: só o fundo do nó). */
function enemyArt(game: GameData, id: string, className: string): HTMLElement {
  const node = el('span', { className: `rs-atlas ${className}`, attrs: { 'aria-hidden': 'true' } });
  atlasFrame(node, 'enemies', game.enemies[id]?.spriteKey ?? id);
  return node;
}

function at(node: HTMLElement, x: number, y: number, size?: number): HTMLElement {
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  if (size !== undefined) {
    node.style.width = `${size}px`;
    node.style.height = `${size}px`;
  }
  return node;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
function mapPaths(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'rs-map-path');
  svg.setAttribute('viewBox', `0 160 ${MAP_W} ${MAP_H}`);
  svg.setAttribute('aria-hidden', 'true');
  const path = (cls: string, d: string) => {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('class', cls);
    p.setAttribute('d', d);
    svg.appendChild(p);
  };
  path('rs-road', 'M150 560 C 60 505, 70 440, 228 410 S 335 330, 262 292 S 120 262, 175 214');
  path('rs-road-locked', 'M228 410 S 335 330, 262 292 S 120 262, 175 214');
  path('rs-road-walk', 'M150 560 C 60 505, 70 440, 228 410');
  return svg;
}

export function createMenu(game: GameData, h: MenuHandlers): MenuView {
  const chapter = Object.values(game.chapters)[0];
  const totalWaves = chapter?.totalWaves ?? 0;
  const bossId = chapterBoss(game);
  const miniBossId = Object.values(game.enemies).find((e) => e.isBoss && e.id !== bossId)?.id;

  const goldPill = (key: string): { node: HTMLElement; value: HTMLElement } => {
    const value = el('span', { attrs: { 'data-ui': key } });
    return {
      node: el('div', { className: 'rs-gold-pill', attrs: { 'aria-label': t('gold.label') } }, [
        icon(ICONS.coin, 30, 'ui_icon_coin'),
        value,
      ]),
      value,
    };
  };

  // ---------- Tela inicial: mapa ----------
  const gold = goldPill('menu-gold');
  const logo = el('div', { className: 'rs-logo', text: t('app.title') });

  const lockedNode = (x: number, y: number, size: number, silhouette: string | undefined) =>
    at(
      el('div', { className: 'rs-node rs-node-lock', attrs: { 'aria-hidden': 'true' } }, [
        silhouette ? enemyArt(game, silhouette, 'rs-node-sil') : null,
        icon(ICONS.lock, 34, 'ui_icon_lock'),
      ]),
      x,
      y,
      size,
    );
  const nodeLabel = (n: string, className = '') =>
    el('div', { className: `rs-node-label ${className}`.trim() }, [
      el('b', { text: t('menu.chapter', { n }) }),
      el('span', { text: t('menu.locked') }),
    ]);

  const bossNode = at(
    el(
      'div',
      {
        className: 'rs-node rs-node-cur',
        attrs: { 'data-ui': 'menu-boss', role: 'img', 'aria-label': bossId ? t('menu.boss', { name: enemyName(bossId) }) : '' },
      },
      [bossId ? enemyArt(game, bossId, 'rs-node-pic') : el('span', { className: 'rs-node-pic' })],
    ),
    150,
    412,
    132,
  );
  const bestValue = el('b', { attrs: { 'data-ui': 'menu-best' } });
  const plaque = at(
    el('div', { className: 'rs-plaque', attrs: { 'data-ui': 'menu-plaque' } }, [
      el('span', { text: t('menu.stat.bestWave'), attrs: { 'aria-hidden': 'true' } }),
      bestValue,
    ]),
    278,
    382,
  );
  const chapterRibbon = ribbon(t('app.subtitle', { n: 'I', name: chapter ? chapterName(chapter.id) : '' }), 'rs-map-ribbon');
  const token = (id: string, x: number, y: number, size: number) => at(enemyArt(game, id, 'rs-token'), x, y, size);
  const dot = (x: number, y: number, on = false) =>
    at(el('span', { className: `rs-wavedot${on ? ' is-on' : ''}`, attrs: { 'aria-hidden': 'true' } }), x, y);

  const mapBox = el('div', { className: 'rs-map-box' }, [
    el('div', { className: 'rs-fog', attrs: { 'aria-hidden': 'true' } }),
    el('div', { className: 'rs-fog rs-fog-2', attrs: { 'aria-hidden': 'true' } }),
    mapPaths(),
    dot(94, 340, true),
    dot(104, 295),
    dot(158, 264),
    token('goblin', 58, 298, 40),
    token('bomb', 258, 360, 34),
    token('shield', 318, 280, 34),
    lockedNode(175, 54, 80, undefined),
    at(nodeLabel('III'), 175, 100),
    lockedNode(228, 250, 96, miniBossId),
    at(nodeLabel('II', 'rs-node-label-left'), 30, 180),
    bossNode,
    at(chapterRibbon.node, 14, 486),
    plaque,
  ]);
  const map = el('div', { className: 'rs-map' }, [mapBox]);

  const playBtn = plate('gold', t('menu.play'), () => h.onPlay(), { size: 'lg', attrs: { 'data-ui': 'menu-play' }, className: 'rs-btn-play' });
  const talentsDot = el('i', { className: 'rs-dot', attrs: { 'data-ui': 'nav-talents-badge', 'aria-hidden': 'true' } });
  const navTalents = iconButton(ICONS.star, t('menu.tab.talents'), () => setTab('talents'), {
    attrs: { 'data-ui': 'nav-talents' },
    piece: 'ui_icon_star',
    className: 'rs-ib-talents',
  });
  navTalents.appendChild(talentsDot);
  const soundBtn = iconButton(ICONS.soundOn, t('sound.label'), () => h.onToggleSound(), {
    attrs: { 'data-ui': 'menu-sound' },
    piece: 'ui_icon_sound',
    size: 22,
    className: 'rs-ib-sm',
  });
  const gearBtn = iconButton(ICONS.gear, t('settings.label'), () => openSettings(), {
    attrs: { 'data-ui': 'menu-settings' },
    piece: 'ui_icon_gear',
    size: 22,
    className: 'rs-ib-sm',
  });
  // TEMP T-061: remover antes do M7. Botão discreto + confirmação no estilo do jogo.
  const resetBtn = TEMP_RESET_SAVE
    ? plate('iron', t('reset.label'), () => show(resetModal, true), { size: 'mini', className: 'rs-btn-reset', attrs: { 'data-ui': 'menu-reset' } })
    : null;
  const resetModal = el(
    'section',
    { className: 'rs-modal rs-modal-center', attrs: { 'data-ui': 'modal-reset', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('reset.title') } },
    [
      el('div', { className: 'rs-modal-body rs-modal-panel' }, [
        ribbon(t('reset.title'), 'rs-ribbon-big rs-modal-ribbon').node,
        el('p', { className: 'rs-modal-sub rs-reset-body', text: t('reset.body') }),
        el('div', { className: 'rs-modal-stack' }, [
          plate('iron', t('reset.confirm'), () => {
            show(resetModal, false);
            h.onResetSave?.();
          }, { attrs: { 'data-ui': 'reset-confirm' } }),
          plate('gold', t('reset.cancel'), () => show(resetModal, false), { attrs: { 'data-ui': 'reset-cancel' } }),
        ]),
      ]),
    ],
  );
  show(resetModal, false);

  const foot = el('div', { className: 'rs-menu-foot' }, [
    playBtn,
    resetBtn,
    el('div', { className: 'rs-talents-slot' }, [
      navTalents,
      el('span', { className: 'rs-ib-label', text: t('menu.tab.talents'), attrs: { 'aria-hidden': 'true' } }),
    ]),
    el('div', { className: 'rs-menu-tools' }, [soundBtn, gearBtn]),
  ]);

  const playPanel = el('div', { className: 'rs-panel rs-panel-play', attrs: { 'data-ui': 'tab-play' } }, [
    el('div', { className: 'rs-menu-top' }, [gold.node]),
    logo,
    map,
    foot,
  ]);

  // ---------- Talentos ----------
  const talentsGold = goldPill('talents-gold');
  const talentList = el('div', { className: 'rs-menu-body rs-talent-list' });
  const startStat = (label: string, key: string) => {
    const value = el('b', { attrs: { 'data-ui': key } });
    return { node: el('span', {}, [el('small', { text: label }), value]), value };
  };
  const atk = startStat(t('menu.stat.atk'), 'menu-atk');
  const hp = startStat(t('menu.stat.hp'), 'menu-hp');
  const orbs = startStat(t('menu.stat.orbs'), 'menu-orbs');
  const crit = startStat(t('menu.stat.crit'), 'menu-crit');
  const talentsPanel = el('div', { className: 'rs-panel rs-panel-talents', attrs: { 'data-ui': 'tab-talents' } }, [
    el('div', { className: 'rs-menu-top' }, [
      iconButton(ICONS.back, t('talents.back'), () => setTab('play'), { attrs: { 'data-ui': 'talents-back' }, piece: 'ui_icon_back', square: true }),
      el('div', { className: 'rs-spacer' }),
      talentsGold.node,
    ]),
    el('div', { className: 'rs-talents-head' }, [
      ribbon(t('talents.title'), 'rs-ribbon-big').node,
      el('div', { className: 'rs-caption', text: t('talents.subtitle') }),
    ]),
    talentList,
    el('div', { className: 'rs-startp', attrs: { 'aria-label': t('menu.startStats') } }, [
      el('small', { text: t('menu.startStats') }),
      el('div', { className: 'rs-startp-row' }, [atk.node, hp.node, orbs.node, crit.node]),
    ]),
  ]);

  // ---------- Configurações (engrenagem): por ora só o som (decisão 23) ----------
  const settingsSound = plate('iron', t('pause.soundOn'), () => h.onToggleSound(), { attrs: { 'data-ui': 'settings-sound' } });
  const settings = el(
    'section',
    { className: 'rs-modal rs-modal-center', attrs: { 'data-ui': 'modal-settings', role: 'dialog', 'aria-modal': 'true' } },
    [
      el('div', { className: 'rs-modal-body rs-modal-panel' }, [
        ribbon(t('settings.title'), 'rs-ribbon-big rs-modal-ribbon').node,
        el('div', { className: 'rs-modal-stack' }, [
          settingsSound,
          plate('gold', t('settings.close'), () => show(settings, false), { attrs: { 'data-ui': 'settings-close' } }),
        ]),
      ]),
    ],
  );
  show(settings, false);
  function openSettings(): void {
    show(settings, true);
  }

  const root = el('section', { className: 'rs-screen rs-menu', attrs: { 'data-ui': 'screen-menu' } }, [
    el('div', { className: 'rs-mapbg', attrs: { 'aria-hidden': 'true' } }),
    playPanel,
    talentsPanel,
    el('div', { className: 'rs-deco-frame', attrs: { 'aria-hidden': 'true' } }),
    settings,
    TEMP_RESET_SAVE ? resetModal : null,
  ]);

  // Mapa em coordenadas do mockup, escalado para a área livre entre o título e o JOGAR.
  const fit = () => mapBox.style.setProperty('--rs-map-s', String(mapScale(map.clientWidth, map.clientHeight)));
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fit).observe(map);

  let tab: MenuTab = 'play';
  function setTab(next: MenuTab): void {
    tab = next;
    show(playPanel, tab === 'play');
    show(talentsPanel, tab === 'talents');
    show(resetModal, false); // TEMP T-061
    if (tab === 'talents') talentList.scrollTop = 0;
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
        let buy: HTMLButtonElement;
        if (cost === null) {
          buy = el('button', { className: 'rs-btn rs-maxb', attrs: { type: 'button', 'data-ui': `talent-buy-${id}` } }, [
            icon(ICONS.check, 18, 'ui_icon_check'),
            el('span', { text: t('talents.max') }),
          ]);
          buy.disabled = true;
        } else {
          buy = plate('gold', t('talents.cost', { cost }), () => h.onBuy(id), {
            size: 'mini',
            className: 'rs-btn-buy',
            icon: icon(ICONS.coin, 22, 'ui_icon_coin'),
            attrs: { 'data-ui': `talent-buy-${id}`, 'aria-label': t('talents.buyLabel', { name: talentName(id), cost }) },
          });
          buy.disabled = !can;
        }
        const pips = el(
          'span',
          { className: 'rs-pips', attrs: { 'aria-hidden': 'true' } },
          Array.from({ length: max }, (_, i) => el('i', { className: i < lv ? 'is-on' : '' })),
        );
        return el(
          'div',
          { className: `rs-talent rs-talent-${id}${cost === null ? ' is-max' : ''}`, attrs: { 'data-ui': `talent-${id}` } },
          [
            el('div', { className: 'rs-talent-in' }, [
              el('span', { className: 'rs-talent-icon' }, [artIcon(def?.iconKey ?? '', 'rs-talent-dot rs-art')]),
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
            ]),
          ],
        );
      }),
    );
    return affordable;
  }

  function render(data: Readonly<PlayerData> | null, profile: PlayerProfile | null): void {
    playBtn.disabled = !data;
    fit();
    if (!data || !profile) {
      gold.value.textContent = t('common.empty');
      talentsGold.value.textContent = t('common.empty');
      show(talentsDot, false);
      return;
    }
    gold.value.textContent = String(data.gold);
    talentsGold.value.textContent = String(data.gold);
    soundBtn.replaceChildren(
      data.settings.muted ? icon(ICONS.soundOff, 22, 'ui_icon_sound_off') : icon(ICONS.soundOn, 22, 'ui_icon_sound'),
    );
    soundBtn.setAttribute('aria-pressed', String(!data.settings.muted));
    setPlateLabel(settingsSound, data.settings.muted ? t('pause.soundOff') : t('pause.soundOn'));
    settingsSound.setAttribute('aria-pressed', String(!data.settings.muted));
    bestValue.textContent = t('menu.stat.bestWaveValue', { wave: data.bestWave, total: totalWaves });
    plaque.setAttribute('aria-label', t('menu.bestLabel', { wave: data.bestWave, total: totalWaves }));
    plaque.classList.toggle('is-cleared', data.cleared);
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
