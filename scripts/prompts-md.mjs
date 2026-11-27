// Gera docs/arte-prompts.md a partir de scripts/assets-manifest.json (AG08, BRF-023; seção 3 UI: BRF-033, estilo validado: BRF-044; seção 4 itens: BRF-071).
// Uso: node scripts/prompts-md.mjs
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const m = JSON.parse(readFileSync(join(root, 'scripts/assets-manifest.json'), 'utf8'));
const isUi = (i) => m.presets[i.preset]?.kind === 'ui';
const isItem = (i) => m.presets[i.preset]?.kind === 'icon';
const anchors = m.items.filter((i) => i.variations && !isItem(i));
const gear = m.items.filter((i) => isItem(i) && !i.deprecated);
const ui = m.items.filter((i) => isUi(i) && !i.deprecated);
const dropped = m.items.filter((i) => isUi(i) && i.deprecated);
const batch = m.items.filter((i) => !i.variations && !isUi(i) && !isItem(i));
const bgOf = (i) => i.bgColor ?? m.presets[i.preset].bgColor ?? 'nenhum';
const has = (f) => f && existsSync(join(root, f));
const status = (i) =>
  i.anchorFor && has(i.anchorFor) ? '**escolhida e entregue** (âncora salva)' : has(i.file) ? '**entregue**' : 'pendente';
const L = [];
L.push('# RuneSling — prompts de arte (Gemini)', '');
L.push('> Gerado por `node scripts/prompts-md.mjs` a partir de `scripts/assets-manifest.json`. Não edite à mão.', '');
L.push('Como usar: cole o bloco de código inteiro no Gemini, gere, baixe em PNG e devolva com o nome indicado. Guia de estilo: `docs/arte.md`.', '');
L.push(`Total: ${anchors.length} âncoras (${anchors.reduce((n, i) => n + i.variations.length, 0)} variações) + ${batch.length} itens do lote + ${ui.length} peças de UI + ${gear.length} ícones de itens = ${m.items.length - dropped.length} chaves (mais ${dropped.length} marcada(s) "não usar").`, '');
L.push('## 1. Âncoras (gerar primeiro, sem imagem anexa)', '');
L.push('Gere as 4 variações de cada âncora, escolha uma e salve a escolhida no caminho de âncora indicado. A escolhida também serve como o próprio asset (devolva com o nome do arquivo).', '');
for (const i of anchors) {
  L.push(`### \`${i.key}\``, '', `- Arquivo a devolver: \`${i.file}\``, `- Âncora escolhida vira: \`${i.anchorFor}\``, `- Fundo: ${bgOf(i)}`, `- Situação: ${status(i)}`, '');
  i.variations.forEach((v, n) => L.push(`**Variação ${String.fromCharCode(65 + n)}**`, '', '```text', v, '```', ''));
}
L.push('## 2. Lote (anexar a âncora indicada como imagem de referência)', '');
for (const i of batch) {
  const a = m.presets[i.preset].anchor;
  L.push(`### \`${i.key}\``, '', `- Arquivo a devolver: \`${i.file}\``, `- Anexar no Gemini: ${a ? '`' + a + '`' : 'nenhuma imagem'}`, `- Fundo: ${bgOf(i)} · tamanho final ${m.presets[i.preset].size} px`, `- Situação: ${status(i)}`, '', '```text', i.geminiPrompt, '```', '');
}
L.push('## 3. Peças de UI (estilo validado, decisões 44 e 45)', '');
L.push(`Guia: \`docs/ui-guia.md\`. Peça isolada, reta, frontal, sem texto (texto, runas do botão e ícones por cima são HTML). O 9-slice é \`[topo, direita, baixo, esquerda]\` em px no tamanho final; "não" = peça inteira. Ordem: gere a âncora de UI (3.1) primeiro, salve a escolhida em \`${m.anchors.ui}\` e anexe-a em todas as outras peças.`, '');
const GROUPS = {
  anchor: '3.1 Âncora de UI (gerar primeiro)',
  base: '3.2 Botões, painéis, fitas e HUD',
  map: '3.3 Mapa e Fim de run',
  runes: '3.4 Cartas e encaixes de runa',
  icons: '3.5 Ícones',
};
for (const [g, title] of Object.entries(GROUPS)) {
  const list = ui.filter((i) => (i.group ?? 'base') === g);
  if (!list.length) continue;
  L.push(`### ${title}`, '');
  if (g === 'anchor') L.push('Gere 4 vezes, escolha uma, salve a escolhida no caminho de âncora indicado e devolva também com o nome do arquivo.', '');
  for (const i of list) {
    const p = m.presets[i.preset];
    const sz = i.size ?? [p.size, p.size];
    const ns = i.nineSlice !== undefined ? i.nineSlice : p.nineSlice;
    const a = i.anchor ?? p.anchor;
    L.push(`#### \`${i.key}\``, '', `- Uso: ${i.usage ?? '—'}`, `- Arquivo a devolver: \`${i.file}\``);
    if (i.anchorFor) L.push(`- Âncora escolhida vira: \`${i.anchorFor}\``);
    L.push(`- Anexar no Gemini: ${a ? '`' + a + '`' : 'nenhuma imagem'}`, `- Fundo: ${bgOf(i)} · tamanho final ${sz[0]}×${sz[1]} px · 9-slice: ${ns ? ns.join(', ') : 'não'}`, `- Situação: ${status(i)}`, '', '```text', i.geminiPrompt, '```', '');
  }
}
if (dropped.length) {
  L.push('### 3.6 Não usar', '', 'Peças que o estilo validado tornou desnecessárias: não gere. Ficam no manifesto só como registro, fora do pipeline.', '');
  for (const i of dropped) L.push(`- \`${i.key}\`: ${i.usage ?? 'não usar'}`);
  L.push('');
}
if (gear.length) {
  L.push('## 4. Ícones de itens (M8, decisões 64, 68 e 70)', '');
  L.push(`Um ícone por item (\`item_<id>\`), o objeto sozinho na cor e no material da escola. O mesmo ícone serve para as 5 raridades: a raridade é a borda em CSS (decisão 70), então o desenho não tem moldura nem cor de raridade. Ordem: gere as 4 variações da âncora de item (4.1, com a âncora de ícone anexa), salve a escolhida em \`${m.anchors.item}\` e anexe-a nos outros 17 (4.2), na ordem da lista. Depois: \`npm run assets:ingest -- <pasta>\` e \`npm run assets:all\` gravam \`public/assets/icons/item_<id>.webp\` (128×128).`, '');
  const line = (i) => {
    const p = m.presets[i.preset];
    const a = i.anchor ?? p.anchor;
    L.push(`#### \`${i.key}\``, '', `- Uso: ${i.usage ?? '—'}`, `- Arquivo a devolver: \`${i.file}\``);
    if (i.anchorFor) L.push(`- Âncora escolhida vira: \`${i.anchorFor}\``);
    L.push(`- Anexar no Gemini: ${a ? '`' + a + '`' : 'nenhuma imagem'}`, `- Fundo: ${bgOf(i)} · tamanho final ${p.size}×${p.size} px${i.removeEnclosedBg ? ' · miolo vazado' : ''}`, `- Situação: ${status(i)}`, '');
  };
  L.push('### 4.1 Âncora de item (gerar primeiro)', '');
  for (const i of gear.filter((i) => i.variations)) {
    line(i);
    i.variations.forEach((v, n) => L.push(`**Variação ${String.fromCharCode(65 + n)}**`, '', '```text', v, '```', ''));
  }
  L.push('### 4.2 Lote dos itens', '');
  for (const i of gear.filter((i) => !i.variations)) {
    line(i);
    L.push('```text', i.geminiPrompt, '```', '');
  }
  L.push('### 4.3 Moldura de raridade', '', 'Não precisa de imagem: a célula do item já tem aro em CSS (`box-shadow` com `--rs-rarity`, cores da decisão 70) sobre o fundo escuro. Uma peça de ferro tingida por CSS exigiria máscara ou filtro e brigaria com esse aro; nenhum prompt aqui.', '');
}
writeFileSync(join(root, 'docs/arte-prompts.md'), L.join('\n'));
console.log(`docs/arte-prompts.md: ${m.items.length - dropped.length} chaves (+${dropped.length} não usar)`);
