import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadGameData, PERK_IDS, SYNERGIES } from '../../src/data/types';
import {
  perkDesc,
  perkName,
  placeholders,
  stringTable,
  synergyName,
  t,
  talentDesc,
  talentName,
  type StringKey,
} from '../../src/ui/strings';

const UI_DIR = join(__dirname, '../../src/ui');

describe('strings da UI', () => {
  it('nenhuma chave vazia', () => {
    for (const [key, text] of Object.entries(stringTable())) expect(text.trim(), key).not.toBe('');
  });

  it('t() substitui variáveis e acusa variável faltando', () => {
    expect(t('hud.wave', { wave: 3, total: 15 })).toBe('ONDA 3/15');
    expect(() => t('hud.wave', { wave: 3 })).toThrow(/total/);
  });

  it('toda chave usada em src/ui existe na tabela', () => {
    const table = stringTable();
    const files = readdirSync(UI_DIR).filter((f) => f.endsWith('.ts') && f !== 'strings.ts');
    const used = new Set<string>();
    for (const f of files) {
      const src = readFileSync(join(UI_DIR, f), 'utf8');
      for (const m of src.matchAll(/\bt\('([\w.]+)'/g)) used.add(m[1] ?? '');
    }
    expect(used.size).toBeGreaterThan(30);
    for (const key of used) expect(table, key).toHaveProperty(key);
  });

  it('textos da cena (contrato com o AG01, M3-02) e velocidade (decisão 27)', () => {
    expect(t('run.bannerWave', { wave: 4, total: 15 })).toBe('ONDA 4/15');
    expect(t('run.bannerBoss', { name: 'LICH' })).toBe('CHEFE FINAL: LICH');
    expect(t('run.bannerMiniBoss', { name: 'OGRO' })).toBe('MINI-CHEFE: OGRO');
    expect(t('fx.ring')).toBe('×2!');
    expect(t('fx.blocked')).toBe('ESCUDO');
    expect(t('hud.speed.1')).toBe('1×');
    expect(t('hud.speed.2')).toBe('1,5×');
  });

  it('M3-01: a faixa de runas não captura o toque (a mira passa por ela)', () => {
    const css = readFileSync(join(__dirname, '../../src/styles/ui.css'), 'utf8');
    const rule = /\.rs-rune-strip\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';
    expect(rule).toMatch(/pointer-events:\s*none/);
    expect(css).not.toMatch(/\.rs-(band|hud-bar|hud-top|hud-bottom|rune-strip)[^{]*\{[^}]*pointer-events:\s*auto/);
  });

  it('chaves dinâmicas de sinergia existem para todas as sinergias', () => {
    for (const s of SYNERGIES) {
      expect(stringTable()).toHaveProperty(`synergy.${s}` satisfies string);
      expect(synergyName(s)).not.toBe('');
    }
  });

  it('placeholders só usam nomes simples', () => {
    for (const key of Object.keys(stringTable()) as StringKey[]) {
      for (const p of placeholders(stringTable()[key])) expect(p, key).toMatch(/^\w+$/);
    }
  });

  it('todas as runas e talentos têm nome e descrição', () => {
    for (const id of PERK_IDS) {
      expect(perkName(id)).not.toBe('');
      expect(perkDesc(id)).not.toBe('');
    }
    const talents = Object.keys(loadGameData().talents);
    expect(talents).toHaveLength(5);
    for (const id of talents) {
      expect(talentName(id)).not.toBe('');
      expect(talentDesc(id)).not.toBe('');
    }
  });
});
