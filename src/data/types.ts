/**
 * Tipos e validação dos dados de jogo (GDD §7.3). Fonte do contrato com AG01.
 * Coordenadas no mundo lógico 360×520.
 */
import enemiesJson from './enemies.json';
import perksJson from './perks.json';
import talentsJson from './talents.json';
import arenasJson from './arenas.json';
import chaptersJson from './chapters.json';
import rulesJson from './rules.json';
import itemsJson from './items.json';

// ---------- Inimigos (GDD §3.3) ----------
export type EnemyBehavior = 'front_shield' | 'shooter' | 'explodes' | 'splits' | 'heals' | 'summoner';
export const ENEMY_BEHAVIORS: readonly EnemyBehavior[] = ['front_shield', 'shooter', 'explodes', 'splits', 'heals', 'summoner'];

export interface EnemyDef {
  readonly id: string;
  readonly name: string;
  readonly spriteKey: string;
  readonly radius: number;
  readonly hpMult: number;
  readonly gold: number;
  /** Avanço por turno (px). */
  readonly advancePx: number;
  /** Dano na barreira ao tocá-la. */
  readonly barrierDmg: number;
  readonly isBoss?: boolean;
  /** Chefes não somem ao tocar a barreira: recuam isto (px). */
  readonly barrierRecoilPx?: number;
  readonly behaviors: readonly EnemyBehavior[];
  /** front_shield: bloqueia impacto com normal (inimigo→orbe) n_y > minNormalY. */
  readonly shieldArc?: { readonly minNormalY: number };
  /** shooter: a cada `cooldown` turnos causa `damage` na barreira. */
  readonly shoot?: { readonly cooldown: number; readonly damage: number };
  /** explodes: ao morrer, dano atkRatio×ATK em radiusPx (+raio do alvo). */
  readonly explode?: { readonly radiusPx: number; readonly atkRatio: number };
  /** splits: gera um `spawnId` por offset X; x preso a [edgeMarginPx, largura-edgeMarginPx]. */
  readonly split?: { readonly spawnId: string; readonly offsetsXPx: readonly number[]; readonly edgeMarginPx: number };
  /** heals: no fim do turno cura max(minHeal, round(maxHp×maxHpRatio)) de `targets` aliado(s) ferido(s). */
  readonly heal?: { readonly maxHpRatio: number; readonly rangePx: number; readonly targets: number; readonly minHeal: number };
  /** summoner: a cada `cooldown` turnos invoca `spawnId` em x±offsetXPx, y+offsetYPx, se arena < maxArenaCount. */
  readonly summon?: {
    readonly cooldown: number;
    readonly spawnId: string;
    readonly maxArenaCount: number;
    readonly offsetXPx: number;
    readonly offsetYPx: number;
  };
}

// ---------- Perks (GDD §4) ----------
export type Synergy = 'lightning' | 'fire' | 'spectral' | 'core';
export const SYNERGIES: readonly Synergy[] = ['lightning', 'fire', 'spectral', 'core'];
export type PerkTrigger =
  | 'onEnemyHit'
  | 'onBumperHit'
  | 'onDamageCalc'
  | 'onAcquire'
  | 'onTurnEnd'
  | 'onKill'
  | 'onLaunch'
  | 'onCeilingHit';
export const PERK_TRIGGERS: readonly PerkTrigger[] = [
  'onEnemyHit', 'onBumperHit', 'onDamageCalc', 'onAcquire', 'onTurnEnd', 'onKill', 'onLaunch', 'onCeilingHit',
];
export type StatusId = 'shocked' | 'burning';

/** Parâmetros por perk (tipados por id). */
export interface PerkParamsById {
  chain_lightning: { chance: number; damageRatio: number; rangePx: number; applyStatus: StatusId };
  bumper_shock: { radiusPx: number; damageRatio: number; applyStatus: StatusId };
  static_crit: { damageMult: number; requiresStatus: StatusId };
  storm_orb: { orbBonus: number; chainChanceBonus: number };
  fire_splash: { damageRatio: number; radiusPx: number; radiusPxWithMoltenCore: number };
  ignite: { damageRatio: number; applyStatus: StatusId };
  supernova: { radiusPx: number; damageRatio: number };
  molten_core: { atkBonus: number; fireRadiusMult: number };
  ghost_ball: { orbIndex: number; hitCooldownFrames: number };
  ricochet_crit: { damageMult: number };
  wall_clone: { clonesPerOrb: number; cloneRadius: number; cloneVxMult: number; cloneOffsetYPx: number };
  arcane_sight: { previewBounces: number; critChanceBonus: number };
  extra_orb: { orbBonus: number };
  power_surge: { atkBonus: number };
  bastion_heal: { healHp: number; maxHpBonus: number };
}
export type PerkId = keyof PerkParamsById;
export const PERK_IDS: readonly PerkId[] = [
  'chain_lightning', 'bumper_shock', 'static_crit', 'storm_orb',
  'fire_splash', 'ignite', 'supernova', 'molten_core',
  'ghost_ball', 'ricochet_crit', 'wall_clone', 'arcane_sight',
  'extra_orb', 'power_surge', 'bastion_heal',
];

export interface PerkDef<K extends PerkId = PerkId> {
  readonly id: K;
  readonly name: string;
  readonly desc: string;
  readonly synergy: Synergy;
  readonly rarity?: 'common' | 'rare' | 'epic';
  readonly iconKey: string;
  readonly repeatable: boolean;
  readonly trigger: PerkTrigger;
  readonly params: Readonly<PerkParamsById[K]>;
}
export type PerkTable = { readonly [K in PerkId]: PerkDef<K> };

// ---------- Talentos (GDD §5.1) ----------
export type TalentStat = 'atk' | 'maxHp' | 'orbs' | 'critChance' | 'goldMult';
export interface TalentDef {
  readonly id: string;
  readonly name: string;
  readonly desc: string;
  readonly iconKey: string;
  readonly maxLevel: number;
  readonly baseCost: number;
  readonly costStep: number;
  readonly effect: { readonly stat: TalentStat; readonly perLevel: number };
}

// ---------- Itens (GDD §5.2; decisões 62–69) ----------
export type ItemSlot = 'staff' | 'orb' | 'ring' | 'amulet' | 'cloak' | 'boots';
export const ITEM_SLOTS: readonly ItemSlot[] = ['staff', 'orb', 'ring', 'amulet', 'cloak', 'boots'];
export type ItemSchool = Exclude<Synergy, 'core'>;
export const ITEM_SCHOOLS: readonly ItemSchool[] = ['lightning', 'fire', 'spectral'];
/** Decisão 62. Épico e Lendário só por fusão (decisão 65). */
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export const ITEM_RARITIES: readonly ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
/** Raridades com número próprio; Épico e Lendário usam o número do Raro (decisão 66). */
export type ItemValueRarity = 'common' | 'uncommon' | 'rare';
export type DropSource = 'miniboss' | 'boss' | 'chest';
/**
 * Stat do espaço. atk/maxHp/critChance/goldMult somam como os talentos.
 * schoolDamage: +fração no dano dos efeitos das runas da escola do item.
 * shotBlockChance: chance de anular um tiro de atirador na barreira.
 */
export type ItemStat = 'atk' | 'maxHp' | 'critChance' | 'goldMult' | 'schoolDamage' | 'shotBlockChance';
export const ITEM_STATS: readonly ItemStat[] = ['atk', 'maxHp', 'critChance', 'goldMult', 'schoolDamage', 'shotBlockChance'];

export interface ItemLegendaryDef {
  /** Efeito único; a lógica é do AG01 (T-077 lista os ids). */
  readonly effectId: string;
  readonly trigger: PerkTrigger;
  readonly desc: string;
  readonly params: { readonly [k: string]: number | string };
}
export interface ItemDef {
  readonly id: string;
  readonly name: string;
  readonly slot: ItemSlot;
  readonly school: ItemSchool;
  readonly iconKey: string;
  readonly stat: ItemStat;
  readonly values: { readonly [R in ItemValueRarity]: number };
  /** Runa da escola ativa desde o início da run (Épico e Lendário). */
  readonly epicRune: PerkId;
  /** Efeito do Lendário (soma ao número e à runa do Épico). */
  readonly legendary: ItemLegendaryDef;
}
export interface ItemRulesDef {
  readonly slots: readonly ItemSlot[];
  readonly rarities: readonly { readonly id: ItemRarity; readonly color: string }[];
  readonly fuseCount: number;
  /** Chance de cada raridade por fonte (soma 1). Decisão 65. */
  readonly dropOdds: { readonly [S in DropSource]: { readonly [R in ItemValueRarity]: number } };
  /** Chefe: base itens + extra com extraChance (decisão 63: 1–2). */
  readonly bossDrops: { readonly base: number; readonly extra: number; readonly extraChance: number };
  readonly chest: { readonly priceGold: number };
}
export interface ItemsData {
  readonly rules: ItemRulesDef;
  readonly items: { readonly [id: string]: ItemDef };
}

// ---------- Arena ----------
export interface Point { readonly x: number; readonly y: number }
export interface Circle { readonly x: number; readonly y: number; readonly r: number }
/** AABB com (x, y) no canto superior esquerdo. */
export interface Rect { readonly x: number; readonly y: number; readonly w: number; readonly h: number }
export interface ArenaDef {
  readonly id: string;
  readonly launch: Point;
  readonly barrierY: number;
  readonly bumpers: readonly Circle[];
  readonly pillars: readonly Rect[];
  readonly rings: readonly Circle[];
}

// ---------- Capítulo (GDD §3.1, §7.3) ----------
export interface ChapterDef {
  readonly id: string;
  readonly name: string;
  readonly theme: { readonly floorTile: string; readonly torchColor: string; readonly ambientDustColor: string };
  readonly arenaId: string;
  readonly totalWaves: number;
  readonly draftWaves: readonly number[];
  readonly draftChoices: number;
  readonly perkPool: readonly string[];
  /** Chave = número da onda (string). */
  readonly fixedSpawns: { readonly [wave: string]: readonly string[] };
  readonly poolByWave: readonly { readonly fromWave: number; readonly weights: { readonly [enemyId: string]: number } }[];
  /** Inimigos do pool por onda: base + min(maxExtra, floor(w / wavesPerExtra)), salvo override. */
  readonly waveSize: {
    readonly base: number;
    readonly wavesPerExtra: number;
    readonly maxExtra: number;
    readonly overrides: { readonly [wave: string]: number };
  };
  readonly spawnLayout: {
    readonly minX: number;
    readonly maxX: number;
    readonly minGapPx: number;
    readonly normalY: readonly [number, number];
    readonly fixedWaveY: readonly [number, number];
    readonly fixedSpawnPos: { readonly [enemyId: string]: Point };
  };
}

// ---------- Regras globais da run ----------
export interface RulesDef {
  readonly world: { readonly width: number; readonly height: number };
  /** GDD §3.2: HP_base(w) = base + linear·w + powCoef·w^powExp; HP = max(minHp, round(HP_base·M_k)). */
  readonly hpFormula: { readonly base: number; readonly linear: number; readonly powCoef: number; readonly powExp: number; readonly minHp: number };
  /** GDD §4.5. */
  readonly damage: { readonly minDamage: number; readonly ricochetMult: number; readonly tempCloneMult: number; readonly critMult: number; readonly shockMult: number };
  /** GDD §2.2. */
  readonly launch: {
    readonly minAngleRad: number;
    readonly cancelPullPx: number;
    readonly v0Base: number;
    readonly v0Bonus: number;
    readonly pullForMaxPx: number;
    readonly multishotSpreadRad: number;
  };
  /** GDD §2.3 e §3.4. */
  readonly physics: {
    readonly subSteps: number;
    readonly dampingEarly: number;
    readonly dampingLate: number;
    readonly dampingSwitchTicks: number;
    readonly antiLoop: { readonly maxAbsVy: number; readonly minAbsVx: number; readonly nudge: number };
    readonly orbRadius: number;
    readonly wallRestitution: number;
    readonly ceilingRestitution: number;
    readonly floorRestitution: number;
    readonly stopSpeed: number;
    readonly bumper: { readonly speedMult: number; readonly minSpeed: number; readonly maxSpeed: number };
    readonly ring: { readonly clonesPerOrb: number; readonly cloneAngleRad: number; readonly cloneRadius: number };
  };
  /** Decisão 27: ciclos de física por frame para normal (`speed` 1) e rápido (`speed` 2). */
  readonly speed: { readonly multipliers: readonly [number, number] };
  readonly maxActiveOrbs: number;
  readonly victoryGoldBonus: number;
  readonly runStart: { readonly hp: number; readonly atk: number; readonly orbs: number; readonly critChance: number; readonly goldMult: number };
}

export interface GameData {
  readonly enemies: { readonly [id: string]: EnemyDef };
  readonly perks: PerkTable;
  readonly talents: { readonly [id: string]: TalentDef };
  readonly arenas: { readonly [id: string]: ArenaDef };
  readonly chapters: { readonly [id: string]: ChapterDef };
  readonly rules: RulesDef;
  readonly items: ItemsData;
}

/** Dados crus importados (tipagem aplicada aqui; checagem em runtime por validateGameData). */
export function rawGameData(): GameData {
  return {
    enemies: enemiesJson as unknown as GameData['enemies'],
    perks: perksJson as unknown as PerkTable,
    talents: talentsJson as unknown as GameData['talents'],
    arenas: arenasJson as unknown as GameData['arenas'],
    chapters: chaptersJson as unknown as GameData['chapters'],
    rules: rulesJson as unknown as RulesDef,
    items: itemsJson as unknown as ItemsData,
  };
}

let cached: GameData | null = null;

/** Carrega e valida os JSON. Lança Error com a lista de problemas se inválidos. */
export function loadGameData(): GameData {
  if (cached) return cached;
  const data = rawGameData();
  const errors = validateGameData(data);
  if (errors.length > 0) throw new Error(`Dados de jogo inválidos:\n- ${errors.join('\n- ')}`);
  cached = data;
  return data;
}

const isPosNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0;
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Confere formato e referências cruzadas. Retorna lista de erros (vazia = válido). */
export function validateGameData(data: GameData): string[] {
  const errs: string[] = [];
  const enemyIds = new Set(Object.keys(data.enemies));
  const W = data.rules.world.width;
  const H = data.rules.world.height;

  // Inimigos
  for (const [key, e] of Object.entries(data.enemies)) {
    const p = `enemies.${key}`;
    if (e.id !== key) errs.push(`${p}: id "${e.id}" difere da chave`);
    for (const f of ['radius', 'hpMult', 'gold', 'advancePx', 'barrierDmg'] as const) {
      if (!isPosNum(e[f])) errs.push(`${p}.${f} deve ser número > 0`);
    }
    if (!Array.isArray(e.behaviors)) {
      errs.push(`${p}.behaviors deve ser lista`);
      continue;
    }
    for (const b of e.behaviors) {
      if (!ENEMY_BEHAVIORS.includes(b)) errs.push(`${p}: behavior desconhecido "${b}"`);
    }
    const has = (b: EnemyBehavior) => e.behaviors.includes(b);
    if (has('front_shield') && !isNum(e.shieldArc?.minNormalY)) errs.push(`${p}: front_shield sem shieldArc.minNormalY`);
    if (has('shooter') && !(isPosNum(e.shoot?.cooldown) && isPosNum(e.shoot?.damage))) errs.push(`${p}: shooter sem shoot`);
    if (has('explodes') && !(isPosNum(e.explode?.radiusPx) && isPosNum(e.explode?.atkRatio))) errs.push(`${p}: explodes sem explode`);
    if (has('heals') && !(isPosNum(e.heal?.maxHpRatio) && isPosNum(e.heal?.rangePx))) errs.push(`${p}: heals sem heal`);
    if (has('splits')) {
      if (!e.split) errs.push(`${p}: splits sem split`);
      else if (!enemyIds.has(e.split.spawnId)) errs.push(`${p}.split.spawnId "${e.split.spawnId}" inexistente`);
    }
    if (has('summoner')) {
      if (!e.summon) errs.push(`${p}: summoner sem summon`);
      else if (!enemyIds.has(e.summon.spawnId)) errs.push(`${p}.summon.spawnId "${e.summon.spawnId}" inexistente`);
    }
    if (e.isBoss && !isPosNum(e.barrierRecoilPx)) errs.push(`${p}: chefe sem barrierRecoilPx`);
  }

  // Perks
  const perkKeys = Object.keys(data.perks);
  for (const id of PERK_IDS) if (!perkKeys.includes(id)) errs.push(`perks: falta "${id}"`);
  for (const [key, perk] of Object.entries(data.perks) as [string, PerkDef][]) {
    const p = `perks.${key}`;
    if (!(PERK_IDS as readonly string[]).includes(key)) errs.push(`${p}: id fora de PERK_IDS`);
    if (perk.id !== key) errs.push(`${p}: id "${perk.id}" difere da chave`);
    if (!SYNERGIES.includes(perk.synergy)) errs.push(`${p}: sinergia inválida "${perk.synergy}"`);
    if (!PERK_TRIGGERS.includes(perk.trigger)) errs.push(`${p}: gatilho inválido "${perk.trigger}"`);
    if (typeof perk.repeatable !== 'boolean') errs.push(`${p}.repeatable deve ser boolean`);
    if (!perk.name || !perk.desc) errs.push(`${p}: name/desc vazios`);
    for (const [k, v] of Object.entries(perk.params ?? {})) {
      if (typeof v === 'number' ? !Number.isFinite(v) : typeof v !== 'string') errs.push(`${p}.params.${k} inválido`);
    }
  }

  // Talentos
  for (const [key, t] of Object.entries(data.talents)) {
    const p = `talents.${key}`;
    if (t.id !== key) errs.push(`${p}: id "${t.id}" difere da chave`);
    if (!Number.isInteger(t.maxLevel) || t.maxLevel < 1) errs.push(`${p}.maxLevel inválido`);
    if (!isPosNum(t.baseCost) || !(isNum(t.costStep) && t.costStep >= 0)) errs.push(`${p}: custos inválidos`);
    if (!isPosNum(t.effect?.perLevel)) errs.push(`${p}.effect.perLevel inválido`);
  }

  // Arenas
  const inWorld = (x: number, y: number) => x >= 0 && x <= W && y >= 0 && y <= H;
  for (const [key, a] of Object.entries(data.arenas)) {
    const p = `arenas.${key}`;
    if (a.id !== key) errs.push(`${p}: id "${a.id}" difere da chave`);
    if (!inWorld(a.launch.x, a.launch.y)) errs.push(`${p}.launch fora do mundo`);
    if (!(a.barrierY > 0 && a.barrierY < a.launch.y)) errs.push(`${p}.barrierY deve ficar acima do launch`);
    for (const c of [...a.bumpers, ...a.rings]) if (!inWorld(c.x, c.y) || !isPosNum(c.r)) errs.push(`${p}: círculo inválido`);
    for (const r of a.pillars) {
      if (!isPosNum(r.w) || !isPosNum(r.h) || !inWorld(r.x, r.y) || !inWorld(r.x + r.w, r.y + r.h)) errs.push(`${p}: pilar inválido`);
    }
  }

  // Capítulos
  for (const [key, c] of Object.entries(data.chapters)) {
    const p = `chapters.${key}`;
    if (c.id !== key) errs.push(`${p}: id "${c.id}" difere da chave`);
    if (!data.arenas[c.arenaId]) errs.push(`${p}.arenaId "${c.arenaId}" inexistente`);
    const inRange = (w: number) => Number.isInteger(w) && w >= 1 && w <= c.totalWaves;
    for (const w of c.draftWaves) if (!inRange(w)) errs.push(`${p}.draftWaves: onda ${w} fora de 1..${c.totalWaves}`);
    for (const [w, ids] of Object.entries(c.fixedSpawns)) {
      if (!inRange(Number(w))) errs.push(`${p}.fixedSpawns: onda ${w} fora do intervalo`);
      for (const id of ids) if (!enemyIds.has(id)) errs.push(`${p}.fixedSpawns[${w}]: "${id}" inexistente`);
    }
    if (c.poolByWave.length === 0 || c.poolByWave[0]?.fromWave !== 1) errs.push(`${p}.poolByWave deve começar na onda 1`);
    let prev = 0;
    for (const entry of c.poolByWave) {
      if (entry.fromWave <= prev) errs.push(`${p}.poolByWave fora de ordem em ${entry.fromWave}`);
      prev = entry.fromWave;
      const ws = Object.entries(entry.weights);
      if (ws.length === 0) errs.push(`${p}.poolByWave[${entry.fromWave}] vazio`);
      for (const [id, wgt] of ws) {
        if (!enemyIds.has(id)) errs.push(`${p}.poolByWave[${entry.fromWave}]: "${id}" inexistente`);
        if (!isPosNum(wgt)) errs.push(`${p}.poolByWave[${entry.fromWave}].${id}: peso inválido`);
      }
    }
    for (const id of c.perkPool) if (!(id in data.perks)) errs.push(`${p}.perkPool: "${id}" inexistente`);
    for (const id of Object.keys(c.spawnLayout.fixedSpawnPos)) {
      if (!enemyIds.has(id)) errs.push(`${p}.spawnLayout.fixedSpawnPos: "${id}" inexistente`);
    }
    for (const w of Object.keys(c.waveSize.overrides)) if (!inRange(Number(w))) errs.push(`${p}.waveSize.overrides: onda ${w} inválida`);
  }

  // Itens
  errs.push(...validateItems(data));

  return errs;
}

const isHex = (v: unknown): boolean => typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v);

/** Confere o catálogo de itens: 6 espaços × 3 escolas, números crescentes, runa da escola, efeitos únicos. */
export function validateItems(data: GameData): string[] {
  const errs: string[] = [];
  const { rules, items } = data.items ?? ({} as ItemsData);
  if (!rules || !items) return ['items: faltam rules/items'];
  if (rules.slots.join() !== ITEM_SLOTS.join()) errs.push('items.rules.slots difere de ITEM_SLOTS');
  if (rules.rarities.map((r) => r.id).join() !== ITEM_RARITIES.join()) errs.push('items.rules.rarities fora de ordem');
  for (const r of rules.rarities) if (!isHex(r.color)) errs.push(`items.rules.rarities.${r.id}: cor inválida`);
  if (!Number.isInteger(rules.fuseCount) || rules.fuseCount < 2) errs.push('items.rules.fuseCount inválido');
  for (const src of ['miniboss', 'boss', 'chest'] as const) {
    const o = rules.dropOdds?.[src];
    if (!o) { errs.push(`items.rules.dropOdds.${src} ausente`); continue; }
    const vs = [o.common, o.uncommon, o.rare];
    if (vs.some((v) => !isNum(v) || v < 0)) errs.push(`items.rules.dropOdds.${src}: chance inválida`);
    else if (Math.abs(vs.reduce((a, b) => a + b, 0) - 1) > 1e-9) errs.push(`items.rules.dropOdds.${src}: soma ≠ 1`);
    else if (!(o.common > o.uncommon && o.uncommon > o.rare)) errs.push(`items.rules.dropOdds.${src}: deve ser Comum > Incomum > Raro`);
  }
  const b = rules.bossDrops;
  if (!(Number.isInteger(b?.base) && b.base >= 1 && Number.isInteger(b.extra) && b.extra >= 0 && isNum(b.extraChance) && b.extraChance >= 0 && b.extraChance <= 1)) {
    errs.push('items.rules.bossDrops inválido');
  }
  if (!Number.isInteger(rules.chest?.priceGold) || rules.chest.priceGold <= 0) errs.push('items.rules.chest.priceGold inválido');

  const effectIds = new Set<string>();
  for (const slot of ITEM_SLOTS) for (const school of ITEM_SCHOOLS) {
    if (!items[`${slot}_${school}`]) errs.push(`items: falta "${slot}_${school}"`);
  }
  for (const [key, it] of Object.entries(items)) {
    const p = `items.${key}`;
    if (it.id !== key) errs.push(`${p}: id "${it.id}" difere da chave`);
    if (!ITEM_SLOTS.includes(it.slot) || !ITEM_SCHOOLS.includes(it.school)) errs.push(`${p}: espaço/escola inválidos`);
    else if (key !== `${it.slot}_${it.school}`) errs.push(`${p}: id deve ser <espaço>_<escola>`);
    if (!it.name || !it.iconKey) errs.push(`${p}: name/iconKey vazios`);
    if (!ITEM_STATS.includes(it.stat)) errs.push(`${p}: stat inválido "${it.stat}"`);
    const v = it.values;
    if (!(isPosNum(v?.common) && isPosNum(v.uncommon) && isPosNum(v.rare) && v.common < v.uncommon && v.uncommon < v.rare)) {
      errs.push(`${p}.values devem ser > 0 e crescentes`);
    }
    const rune = data.perks[it.epicRune];
    if (!rune) errs.push(`${p}.epicRune "${it.epicRune}" inexistente`);
    else if (rune.synergy !== it.school) errs.push(`${p}.epicRune "${it.epicRune}" não é da escola ${it.school}`);
    const lg = it.legendary;
    if (!lg?.effectId || !lg.desc) errs.push(`${p}.legendary: effectId/desc vazios`);
    else if (effectIds.has(lg.effectId)) errs.push(`${p}.legendary.effectId "${lg.effectId}" repetido`);
    else effectIds.add(lg.effectId);
    if (!PERK_TRIGGERS.includes(lg?.trigger)) errs.push(`${p}.legendary: gatilho inválido "${lg?.trigger}"`);
    for (const [k, pv] of Object.entries(lg?.params ?? {})) {
      if (typeof pv === 'number' ? !Number.isFinite(pv) : typeof pv !== 'string') errs.push(`${p}.legendary.params.${k} inválido`);
    }
  }
  return errs;
}
