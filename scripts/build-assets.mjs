#!/usr/bin/env node
// Padronização e atlas (GDD §8.6): art-source/cut -> public/assets + art-source/preview.html.
// --all roda a esteira inteira: ingestão (só se houver entradas), recorte e empacotamento.
import { buildAll, cutAll, ingest, resolvePaths, runCli } from './lib/assets.mjs';

runCli(async (opts) => {
  const paths = resolvePaths(opts);
  if (opts.all) {
    if (opts._.length) await ingest(opts._, paths);
    await cutAll(paths, { force: opts.force === true });
  }
  await buildAll(paths);
});
