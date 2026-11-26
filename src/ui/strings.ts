/**
 * Textos da UI (decisão 22): pt-BR agora, pronto para inglês no M6.
 * Nenhum outro arquivo da UI tem texto solto: tudo passa por `t()` ou pelos acessores de conteúdo abaixo.
 */
import { loadGameData, type PerkId, type Synergy } from '../data/types';

const ptBR = {
  'app.title': 'RUNESLING',
  'app.subtitle': 'Capítulo {n} • {name}',

  'menu.tab.play': 'EXPEDIÇÃO',
  'menu.tab.talents': 'TALENTOS',
  'menu.play': 'JOGAR',
  'menu.badge.waves': '{total} ONDAS',
  'menu.badge.cleared': 'CONQUISTADO',
  'menu.stat.bestWave': 'MELHOR ONDA',
  'menu.stat.bestWaveValue': '{wave} / {total}',
  'menu.stat.atk': 'ATK',
  'menu.stat.hp': 'HP',
  'menu.stat.orbs': 'ORBES',
  'menu.stat.crit': 'CRIT',
  'menu.startStats': 'Atributos iniciais',
  'menu.boss': 'Chefe: {name}',
  'menu.tabBadgeLabel': '{count} talentos disponíveis para comprar',

  'settings.label': 'Configurações',
  'settings.title': 'CONFIGURAÇÕES',
  'settings.close': 'FECHAR',

  'talents.title': 'TALENTOS',
  'talents.subtitle': 'Melhorias mantidas entre todas as partidas',
  'talents.level': 'Nv. {level}/{max}',
  'talents.cost': '{cost} G',
  'talents.max': 'MÁX',
  'talents.buyLabel': 'Comprar {name} por {cost} de ouro',

  'hud.hp': '{hp}/{max}',
  'hud.wave': 'ONDA {wave}/{total}',
  'hud.waveLabel': 'ONDA',
  'hud.waveTotal': '/{total}',
  'hud.atk': 'ATK',
  'hud.orbs': 'ORBES',
  'hud.crit': 'CRIT',
  'hud.critValue': '{pct}%',
  'hud.speed.1': '1×',
  'hud.speed.2': '1,5×',
  'hud.speedLabel': 'Alternar velocidade (atual {speed})',
  'hud.recall': 'RECOLHER',
  'hud.pause': 'Pausar',
  'hud.runesEmpty': 'Arraste na arena para mirar e solte para lançar',
  'hud.runeCount': '{name} ×{count}',
  'hud.runeStack': '×{count}',
  'hud.goldLabel': 'Ouro da run',
  'hud.hpLabel': 'HP da barreira',

  'run.bannerWave': 'ONDA {wave}/{total}',
  'run.bannerBoss': 'CHEFE FINAL: {name}',
  'run.bannerMiniBoss': 'MINI-CHEFE: {name}',

  'fx.ring': '×2!',
  'fx.blocked': 'ESCUDO',

  'draft.title': 'ESCOLHA UMA RUNA',
  'draft.subtitle': 'Combine sinergias Elétrica, Ígnea ou Espectral.',
  'draft.newSynergy': 'Nova sinergia',
  'draft.nthSynergy': '{n}ª da sinergia',

  'synergy.lightning': 'Elétrica',
  'synergy.fire': 'Ígnea',
  'synergy.spectral': 'Espectral',
  'synergy.core': 'Núcleo',

  'end.victory': 'CRIPTA CONQUISTADA',
  'end.defeat': 'BARREIRA ROMPIDA',
  'end.victorySub': 'O capítulo foi vencido. O ouro foi para o banco.',
  'end.defeatSub': 'Fortaleça seus talentos e tente de novo.',
  'end.wave': 'ONDA ALCANÇADA',
  'end.waveValue': '{wave}/{total}',
  'end.gold': 'OURO GANHO',
  'end.goldValue': '+{gold}',
  'end.menu': 'MENU',
  'end.again': 'JOGAR DE NOVO',

  'pause.title': 'PAUSA',
  'pause.resume': 'CONTINUAR',
  'pause.quit': 'SAIR DA RUN',
  'pause.soundOn': 'SOM: LIGADO',
  'pause.soundOff': 'SOM: DESLIGADO',

  'sound.label': 'Ligar ou desligar o som',
  'gold.label': 'Ouro',
  'common.empty': '–',
} as const;

export type StringKey = keyof typeof ptBR;
export type StringTable = Readonly<Record<StringKey, string>>;
export type Locale = 'pt-BR';

const tables: Record<Locale, StringTable> = { 'pt-BR': ptBR };
let current: Locale = 'pt-BR';

export function setLocale(locale: Locale): void {
  current = locale;
}

export function stringTable(locale: Locale = current): StringTable {
  return tables[locale];
}

/** Placeholders `{nome}` de um texto. */
export function placeholders(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1] ?? '');
}

/** Texto da chave com `{var}` substituídas. Variável ausente lança erro (pego nos testes). */
export function t(key: StringKey, vars: Readonly<Record<string, string | number>> = {}): string {
  const text = tables[current][key];
  return text.replace(/\{(\w+)\}/g, (_, name: string) => {
    const v = vars[name];
    if (v === undefined) throw new Error(`[strings] "${key}" sem a variável {${name}}`);
    return String(v);
  });
}

// ---------- Conteúdo de jogo (nomes e descrições vêm de src/data/*.json) ----------
// Ponto único para a localização do conteúdo no M6: hoje lê o pt-BR dos JSON.

export function synergyName(s: Synergy): string {
  return t(`synergy.${s}`);
}

export function perkName(id: PerkId): string {
  return loadGameData().perks[id].name;
}

export function perkDesc(id: PerkId): string {
  return loadGameData().perks[id].desc;
}

export function talentName(id: string): string {
  return loadGameData().talents[id]?.name ?? id;
}

export function talentDesc(id: string): string {
  return loadGameData().talents[id]?.desc ?? '';
}

export function enemyName(id: string): string {
  return loadGameData().enemies[id]?.name ?? id;
}

export function chapterName(id: string): string {
  return loadGameData().chapters[id]?.name ?? id;
}
