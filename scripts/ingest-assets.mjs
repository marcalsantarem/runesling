#!/usr/bin/env node
// Ingestão (decisão 29): npm run assets:ingest -- <pasta|arquivos...>
// Chave = nome do arquivo (<key>.png|jpg|webp) -> art-source/raw/<categoria>/<key>.png
import { ingest, resolvePaths, runCli } from './lib/assets.mjs';

runCli(async (opts) => {
  if (!opts._.length) throw new Error('uso: npm run assets:ingest -- <pasta|arquivos...>');
  await ingest(opts._, resolvePaths(opts));
});
