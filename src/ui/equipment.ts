/**
 * Tela de Equipamentos (T-079; decisões 62–70; contrato `docs/briefings/_contrato-m8-itens.md`) e as
 * peças de item reaproveitadas no aviso de drop do HUD e no Fim de run.
 * Equipar, fundir e abrir baú são chamadas diretas do `PlayerProfile` (sem evento); a tela redesenha
 * pelo `onChange` do perfil (menu.render).
 */
import { ITEM_SLOTS, type GameData, type ItemDef, type ItemRarity, type ItemSlot } from '../data/types';
import type { PlayerData, PlayerProfile } from '../meta/profile';
import { itemValue, nextRarity, rarityColor, type ItemRef, type ItemStack } from '../meta/items';
import { artIcon, el, icon, iconButton, ICONS, plate, ribbon, show } from './dom';
import { itemLegendaryDesc, itemName, perkName, t } from './strings';

/** Ícone provisório de cada espaço (SVG 24×24, tingido pela escola via `currentColor`). */
const SLOT_GLYPHS: Record<ItemSlot, string> = {
  staff:
    '<path d="M5 20.5 15.2 10.3" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="17.2" cy="7.2" r="3.8" fill="currentColor"/><circle cx="16.2" cy="6.2" r="1.2" fill="#fff" opacity=".7"/>',
  orb: '<circle cx="12" cy="10.5" r="7" fill="currentColor"/><circle cx="9.5" cy="8" r="2" fill="#fff" opacity=".55"/><path d="M6.5 21h11l-2.2-3.2H8.7z" fill="currentColor" opacity=".7"/>',
  ring: '<circle cx="12" cy="14.5" r="6" fill="none" stroke="currentColor" stroke-width="2.8"/><path d="M12 2.5 15.2 6.5 12 10 8.8 6.5z" fill="currentColor"/>',
  amulet:
    '<path d="M5.5 2.5c0 6 3 8.6 6.5 9.5 3.5-.9 6.5-3.5 6.5-9.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 11 17 16 12 22 7 16z" fill="currentColor"/>',
  cloak: '<path d="M8.5 2.5h7l1.2 3.2L21 21.5H3L7.3 5.7z" fill="currentColor"/><path d="M12 5.5V21" stroke="#000" stroke-width="1.2" opacity=".35"/>',
  boots: '<path d="M6.5 2.5h6.5v10.2l6.8 3.8v5H5.5z" fill="currentColor"/><path d="M5.5 18.5h14.3" stroke="#000" stroke-width="1.2" opacity=".35"/>',
};

/** Silhueta simples do mago (até existir arte): capuz, manto e cajado. */
const MAGE_SVG =
  '<svg viewBox="0 0 120 200" width="120" height="200" aria-hidden="true">' +
  '<defs><linearGradient id="rs-g-mage" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5168"/><stop offset="1" stop-color="#191c27"/></linearGradient></defs>' +
  '<ellipse cx="60" cy="192" rx="46" ry="7" fill="#000" opacity=".55"/>' +
  '<path d="M60 14 82 58 78 70 98 186H22L42 70 38 58z" fill="url(#rs-g-mage)" stroke="#0a0b10" stroke-width="3" stroke-linejoin="round"/>' +
  '<path d="M60 14 72 52H48z" fill="#2b3040"/>' +
  '<ellipse cx="60" cy="58" rx="13" ry="9" fill="#06070f"/>' +
  '<circle cx="55" cy="58" r="2" fill="var(--rs-cyan)"/><circle cx="65" cy="58" r="2" fill="var(--rs-cyan)"/>' +
  '<path d="M60 96v84" stroke="#0a0b10" stroke-width="2" opacity=".6"/>' +
  '<path d="M104 30 92 186" stroke="#6a4a2a" stroke-width="5" stroke-linecap="round"/>' +
  '<circle cx="105" cy="24" r="8" fill="var(--rs-violet)" stroke="#0a0b10" stroke-width="2.5"/>' +
  '</svg>';

const pct = (v: number): number => Math.round(v * 100);

function def(game: GameData, itemId: string): ItemDef | undefined {
  return Object.prototype.hasOwnProperty.call(game.items.items, itemId) ? game.items.items[itemId] : undefined;
}

export function rarityName(rarity: ItemRarity): string {
  return t(`items.rarity.${rarity}`);
}

/** Bônus numérico do item na raridade (`itemValue`). */
export function itemBonus(it: ItemDef, rarity: ItemRarity): string {
  const v = itemValue(it, rarity);
  switch (it.stat) {
    case 'atk':
    case 'maxHp':
      return t(`items.stat.${it.stat}`, { v });
    case 'schoolDamage':
      return t(`items.stat.schoolDamage.${it.school}`, { v: pct(v) });
    default:
      return t(`items.stat.${it.stat}`, { v: pct(v) });
  }
}

/** Linhas de efeito: número, runa do Épico (e do Lendário) e o efeito do Lendário (decisão 66). */
export function itemLines(it: ItemDef, rarity: ItemRarity): string[] {
  const lines = [itemBonus(it, rarity)];
  if (rarity === 'epic' || rarity === 'legendary') lines.push(t('items.epicRune', { name: perkName(it.epicRune) }));
  if (rarity === 'legendary') lines.push(itemLegendaryDesc(it.id));
  return lines;
}

function slotGlyph(slot: ItemSlot, size = 24): HTMLElement {
  const g = icon(SLOT_GLYPHS[slot], size);
  g.classList.add('rs-item-glyph');
  return g;
}

/**
 * Ícone do item: a imagem `item_<id>` só quando existe em `AVAILABLE_ASSETS` (artIcon); por baixo, o
 * ícone do espaço tingido pela escola, que some quando a imagem carrega (T-081: só colocar os arquivos).
 */
export function itemArt(game: GameData, itemId: string, className = ''): HTMLElement {
  const it = def(game, itemId);
  const frame = artIcon(it?.iconKey ?? '', `rs-item-art rs-art rs-school-${it?.school ?? 'core'} ${className}`.trim());
  if (it) frame.prepend(slotGlyph(it.slot));
  return frame;
}

function tint(node: HTMLElement, rarity: ItemRarity, game: GameData): HTMLElement {
  node.style.setProperty('--rs-rarity', rarityColor(rarity, game));
  node.setAttribute('data-rarity', rarity);
  return node;
}

/** Chip compacto (ícone + nome na cor da raridade): aviso do HUD e lista do Fim de run. */
export function itemChip(game: GameData, ref: ItemRef): HTMLElement {
  return tint(
    el('span', { className: 'rs-item-chip', attrs: { 'data-item': ref.itemId } }, [
      itemArt(game, ref.itemId, 'rs-item-chip-art'),
      el('span', { className: 'rs-item-chip-name', text: itemName(ref.itemId, ref.rarity) }),
    ]),
    ref.rarity,
    game,
  );
}

/** Cartão grande (resultado do baú e da fusão). */
function itemCard(game: GameData, ref: ItemRef, key: string): HTMLElement {
  const it = def(game, ref.itemId);
  return tint(
    el('div', { className: 'rs-item-card', attrs: { 'data-ui': key } }, [
      itemArt(game, ref.itemId, 'rs-item-card-art'),
      el('div', { className: 'rs-item-card-tx' }, [
        el('b', { className: 'rs-item-name', text: itemName(ref.itemId, ref.rarity) }),
        el('small', { className: 'rs-item-rarity', text: rarityName(ref.rarity) }),
        ...(it ? itemLines(it, ref.rarity) : []).map((l) => el('span', { className: 'rs-item-line', text: l })),
      ]),
    ]),
    ref.rarity,
    game,
  );
}

const refKey = (r: ItemRef): string => `${r.itemId}-${r.rarity}`;

export interface EquipmentView {
  readonly root: HTMLElement;
  /** Modais (Fundir, Baú) que vão na raiz da tela do menu. */
  readonly overlays: readonly HTMLElement[];
  render(data: Readonly<PlayerData> | null, profile: PlayerProfile | null): void;
  /** Fecha os modais e volta a grade ao topo. */
  reset(): void;
}

export function createEquipment(game: GameData, onBack: () => void): EquipmentView {
  let profile: PlayerProfile | null = null;
  let data: Readonly<PlayerData> | null = null;
  let busy = false;
  const price = game.items.rules.chest.priceGold;
  const fuseCount = game.items.rules.fuseCount;

  /** Uma ação por vez (toque duplo não equipa/abre duas vezes). */
  const act = (fn: (p: PlayerProfile) => Promise<unknown>): void => {
    if (busy || !profile) return;
    busy = true;
    void fn(profile).finally(() => {
      busy = false;
    });
  };

  const goldValue = el('span', { attrs: { 'data-ui': 'items-gold' } });
  const gold = el('div', { className: 'rs-gold-pill', attrs: { 'aria-label': t('gold.label') } }, [
    icon(ICONS.coin, 30, 'ui_icon_coin'),
    goldValue,
  ]);

  // ---------- Boneco: 6 espaços em volta do mago (3 de cada lado, na ordem de ITEM_SLOTS) ----------
  const slotBtns = {} as Record<ItemSlot, HTMLButtonElement>;
  const slotCol = (slots: readonly ItemSlot[], side: string) =>
    el(
      'div',
      { className: `rs-eq-col rs-eq-col-${side}` },
      slots.map((slot) => {
        const btn = el('button', {
          className: 'rs-btn rs-eq-slot',
          attrs: { type: 'button', 'data-ui': `items-slot-${slot}`, 'data-sfx': 'ui_back' },
          onClick: () => {
            if (data?.items.equipped[slot]) act((p) => p.unequipItem(slot));
          },
        });
        slotBtns[slot] = btn;
        return el('div', { className: 'rs-eq-slotwrap' }, [
          btn,
          el('span', { className: 'rs-eq-slot-name', text: t(`items.slot.${slot}`), attrs: { 'aria-hidden': 'true' } }),
        ]);
      }),
    );
  const mage = el('div', { className: 'rs-eq-mage', attrs: { 'aria-hidden': 'true' } });
  mage.innerHTML = MAGE_SVG; // markup fixo deste módulo
  const doll = el('div', { className: 'rs-eq-doll', attrs: { 'data-ui': 'items-doll' } }, [
    el('div', { className: 'rs-eq-glow', attrs: { 'aria-hidden': 'true' } }),
    mage,
    slotCol(ITEM_SLOTS.slice(0, 3), 'l'),
    slotCol(ITEM_SLOTS.slice(3), 'r'),
  ]);

  const bonus = el('div', { className: 'rs-eq-bonus', attrs: { 'data-ui': 'items-bonus', 'aria-live': 'polite' } });
  const grid = el('div', { className: 'rs-menu-body rs-eq-grid', attrs: { 'data-ui': 'items-grid' } });

  const fuseBtn = plate('cyan', t('items.fuse'), () => openFuse(), { size: 'mini', className: 'rs-eq-fuse', attrs: { 'data-ui': 'items-fuse' } });
  const chestBtn = plate('gold', t('items.chest', { price }), () => buyChest(), {
    size: 'mini',
    className: 'rs-eq-chest',
    icon: icon(ICONS.chest, 26),
    attrs: { 'data-ui': 'items-chest', 'aria-label': t('items.chestLabel', { price }) },
  });
  chestBtn.querySelector('.rs-plate-lbl')?.appendChild(icon(ICONS.coin, 18, 'ui_icon_coin'));

  const root = el('div', { className: 'rs-panel rs-panel-items', attrs: { 'data-ui': 'tab-items' } }, [
    el('div', { className: 'rs-menu-top' }, [
      iconButton(ICONS.back, t('items.back'), onBack, { attrs: { 'data-ui': 'items-back', 'data-sfx': 'ui_back' }, piece: 'ui_icon_back', square: true }),
      el('div', { className: 'rs-spacer' }),
      gold,
    ]),
    el('div', { className: 'rs-talents-head rs-eq-head' }, [
      ribbon(t('items.title'), 'rs-ribbon-big').node,
      el('div', { className: 'rs-caption', text: t('items.subtitle') }),
    ]),
    doll,
    bonus,
    grid,
    el('div', { className: 'rs-eq-actions' }, [fuseBtn, chestBtn]),
  ]);

  // ---------- Modal Fundir: lista o que dá para fundir com o resultado antes de confirmar ----------
  const fuseList = el('div', { className: 'rs-fuse-list', attrs: { 'data-ui': 'fuse-list' } });
  const fuseModal = el(
    'section',
    { className: 'rs-modal rs-modal-center', attrs: { 'data-ui': 'modal-fuse', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('items.fuseTitle') } },
    [
      el('div', { className: 'rs-modal-body rs-modal-panel rs-fuse-body' }, [
        ribbon(t('items.fuseTitle'), 'rs-ribbon-big rs-modal-ribbon').node,
        el('p', { className: 'rs-modal-sub', text: t('items.fuseBody', { n: fuseCount }) }),
        fuseList,
        plate('iron', t('items.close'), () => show(fuseModal, false), { attrs: { 'data-ui': 'fuse-close', 'data-sfx': 'ui_back' } }),
      ]),
    ],
  );
  show(fuseModal, false);

  // ---------- Modal do baú: item ganho na cor da raridade ----------
  const chestResult = el('div', { className: 'rs-chest-result' });
  const chestModal = el(
    'section',
    { className: 'rs-modal rs-modal-center', attrs: { 'data-ui': 'modal-chest', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('items.chestTitle') } },
    [
      el('div', { className: 'rs-modal-body rs-modal-panel' }, [
        ribbon(t('items.chestTitle'), 'rs-ribbon-big rs-modal-ribbon').node,
        chestResult,
        plate('gold', t('items.close'), () => show(chestModal, false), { attrs: { 'data-ui': 'chest-close', 'data-sfx': 'ui_back' } }),
      ]),
    ],
  );
  show(chestModal, false);

  function fusable(): ItemStack[] {
    if (!data || !profile) return [];
    const p = profile;
    return data.items.inventory.filter((s) => p.canFuseItem(s.itemId, s.rarity));
  }

  function openFuse(): void {
    const list = fusable();
    if (list.length === 0) return;
    fuseList.replaceChildren(
      ...list.map((s) => {
        const to = nextRarity(s.rarity) as ItemRarity;
        const key = refKey(s);
        return el('div', { className: 'rs-fuse-row', attrs: { 'data-ui': `fuse-row-${key}` } }, [
          tint(
            el('span', { className: 'rs-fuse-from' }, [
              itemArt(game, s.itemId, 'rs-fuse-art'),
              el('i', { className: 'rs-eq-count', text: t('items.stack', { count: fuseCount }) }),
            ]),
            s.rarity,
            game,
          ),
          el('span', { className: 'rs-fuse-arrow', attrs: { 'aria-hidden': 'true' } }),
          itemCard(game, { itemId: s.itemId, rarity: to }, `fuse-result-${key}`),
          plate(
            'gold',
            t('items.fuse'),
            () =>
              act(async (p) => {
                if (await p.fuseItem(s.itemId, s.rarity)) {
                  show(fuseModal, false);
                  showChest([{ itemId: s.itemId, rarity: to }], t('items.fuseTitle'));
                }
              }),
            {
              size: 'mini',
              className: 'rs-fuse-go',
              attrs: {
                'data-ui': `fuse-confirm-${key}`,
                'aria-label': t('items.fuseLabel', { count: fuseCount, from: rarityName(s.rarity), to: rarityName(to) }),
              },
            },
          ),
        ]);
      }),
    );
    show(fuseModal, true);
  }

  const chestRibbon = chestModal.querySelector('.rs-ribbon-text');
  function showChest(drops: readonly ItemRef[], title = t('items.chestTitle')): void {
    if (chestRibbon) chestRibbon.textContent = title;
    chestResult.replaceChildren(...drops.map((d, i) => itemCard(game, d, `chest-item-${i}`)));
    show(chestModal, true);
  }

  function buyChest(): void {
    act(async (p) => {
      const drops = await p.openChest();
      if (drops && drops.length > 0) showChest(drops);
    });
  }

  function renderSlot(slot: ItemSlot, ref: ItemRef | null): void {
    const btn = slotBtns[slot];
    btn.classList.toggle('is-empty', !ref);
    btn.disabled = !ref;
    if (!ref) {
      btn.style.removeProperty('--rs-rarity');
      btn.removeAttribute('data-rarity');
      btn.replaceChildren(slotGlyph(slot, 30));
      btn.setAttribute('aria-label', t('items.slotEmpty', { slot: t(`items.slot.${slot}`) }));
      return;
    }
    tint(btn, ref.rarity, game);
    btn.replaceChildren(itemArt(game, ref.itemId, 'rs-eq-slot-art'));
    btn.setAttribute(
      'aria-label',
      t('items.slotLabel', { slot: t(`items.slot.${slot}`), name: itemName(ref.itemId, ref.rarity), rarity: rarityName(ref.rarity) }),
    );
  }

  function cell(s: ItemStack): HTMLElement | null {
    const it = def(game, s.itemId);
    if (!it) return null;
    const lines = itemLines(it, s.rarity);
    return tint(
      el(
        'button',
        {
          className: 'rs-btn rs-eq-cell',
          attrs: {
            type: 'button',
            'data-ui': `items-cell-${refKey(s)}`,
            'aria-label': t('items.itemLabel', {
              name: itemName(s.itemId, s.rarity),
              rarity: rarityName(s.rarity),
              bonus: lines.join('. '),
              count: s.count,
            }),
          },
          onClick: () => act((p) => p.equipItem(s.itemId, s.rarity)),
        },
        [
          el('span', { className: 'rs-eq-cell-top' }, [
            itemArt(game, s.itemId, 'rs-eq-cell-art'),
            s.count > 1 ? el('i', { className: 'rs-eq-count', text: t('items.stack', { count: s.count }) }) : null,
          ]),
          el('b', { className: 'rs-item-name', text: itemName(s.itemId, s.rarity) }),
          ...lines.map((l, i) => el('span', { className: `rs-item-line${i === 2 ? ' rs-item-legend' : ''}`, text: l })),
        ],
      ),
      s.rarity,
      game,
    );
  }

  function renderBonus(d: Readonly<PlayerData>): void {
    const chips: HTMLElement[] = [];
    const legends: HTMLElement[] = [];
    for (const slot of ITEM_SLOTS) {
      const ref = d.items.equipped[slot];
      const it = ref && def(game, ref.itemId);
      if (!ref || !it) continue;
      const [num, rune, legend] = itemLines(it, ref.rarity);
      for (const l of [num, rune]) if (l) chips.push(tint(el('span', { className: 'rs-eq-bonus-chip', text: l }), ref.rarity, game));
      if (legend) legends.push(tint(el('span', { className: 'rs-eq-bonus-legend', text: legend }), ref.rarity, game));
    }
    bonus.replaceChildren(
      el('small', { text: t('items.bonusTitle') }),
      chips.length ? el('div', { className: 'rs-eq-bonus-row' }, chips) : el('span', { className: 'rs-eq-bonus-none', text: t('items.bonusNone') }),
      ...legends,
    );
  }

  function render(d: Readonly<PlayerData> | null, p: PlayerProfile | null): void {
    data = d;
    profile = p;
    if (!d || !p) {
      goldValue.textContent = t('common.empty');
      fuseBtn.disabled = true;
      chestBtn.disabled = true;
      return;
    }
    goldValue.textContent = String(d.gold);
    for (const slot of ITEM_SLOTS) renderSlot(slot, d.items.equipped[slot]);
    const cells = d.items.inventory.map(cell).filter((c): c is HTMLElement => c !== null);
    grid.replaceChildren(...(cells.length ? cells : [el('p', { className: 'rs-eq-empty', text: t('items.empty'), attrs: { 'data-ui': 'items-empty' } })]));
    grid.classList.toggle('is-empty', cells.length === 0);
    renderBonus(d);
    fuseBtn.disabled = fusable().length === 0;
    chestBtn.disabled = d.gold < price;
  }

  function reset(): void {
    show(fuseModal, false);
    show(chestModal, false);
    grid.scrollTop = 0;
  }

  return { root, overlays: [fuseModal, chestModal], render, reset };
}
