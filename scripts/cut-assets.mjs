#!/usr/bin/env node
// Recorte de fundo (decisão 30): art-source/raw -> art-source/cut, incremental por hash. --force refaz tudo.
import { cutAll, resolvePaths, runCli } from './lib/assets.mjs';

runCli(async (opts) => {
  await cutAll(resolvePaths(opts), { force: opts.force === true });
});
