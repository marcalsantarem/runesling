// Gera docs/arte-prompts.md a partir de scripts/assets-manifest.json (AG08, BRF-023).
// Uso: node scripts/prompts-md.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const m = JSON.parse(readFileSync(join(root, 'scripts/assets-manifest.json'), 'utf8'));
const anchors = m.items.filter((i) => i.variations);
const batch = m.items.filter((i) => !i.variations);
const bgOf = (i) => i.bgColor ?? m.presets[i.preset].bgColor ?? 'nenhum';
const L = [];
L.push('# RuneSling — prompts de arte (Gemini)', '');
L.push('> Gerado por `node scripts/prompts-md.mjs` a partir de `scripts/assets-manifest.json`. Não edite à mão.', '');
L.push('Como usar: cole o bloco de código inteiro no Gemini, gere, baixe em PNG e devolva com o nome indicado. Guia de estilo: `docs/arte.md`.', '');
L.push(`Total: ${anchors.length} âncoras (${anchors.reduce((n, i) => n + i.variations.length, 0)} variações) + ${batch.length} itens do lote = ${m.items.length} chaves.`, '');
L.push('## 1. Âncoras (gerar primeiro, sem imagem anexa)', '');
L.push('Gere as 4 variações de cada âncora, escolha uma e salve a escolhida no caminho de âncora indicado. A escolhida também serve como o próprio asset (devolva com o nome do arquivo).', '');
for (const i of anchors) {
  L.push(`### \`${i.key}\``, '', `- Arquivo a devolver: \`${i.file}\``, `- Âncora escolhida vira: \`${i.anchorFor}\``, `- Fundo: ${bgOf(i)}`, '');
  i.variations.forEach((v, n) => L.push(`**Variação ${String.fromCharCode(65 + n)}**`, '', '```text', v, '```', ''));
}
L.push('## 2. Lote (anexar a âncora indicada como imagem de referência)', '');
for (const i of batch) {
  const a = m.presets[i.preset].anchor;
  L.push(`### \`${i.key}\``, '', `- Arquivo a devolver: \`${i.file}\``, `- Anexar no Gemini: ${a ? '`' + a + '`' : 'nenhuma imagem'}`, `- Fundo: ${bgOf(i)} · tamanho final ${m.presets[i.preset].size} px`, '', '```text', i.geminiPrompt, '```', '');
}
writeFileSync(join(root, 'docs/arte-prompts.md'), L.join('\n'));
console.log(`docs/arte-prompts.md: ${m.items.length} chaves`);
