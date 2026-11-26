# BRF-035 — AG07 — T-042 Peso do build
**Leia:** `docs/briefings/_contrato-m4-assets.md` (item "Ícone do app", atualizado), `scripts/pwa-icons.mjs`, a parte do `app_icon` em `scripts/build-assets.mjs`, `vite.config.ts` (precache). **Regra:** respostas curtas; sem commit/push/branches.
**Problema:** `dist/` em 3,8 MB (limite 4 MB do GDD): `assets/app/app_icon.png` (1,1 MB) vai para o build sem uso, e `icons/` soma 740 KB.
**Fazer:** (1) `build-assets.mjs` grava o ícone do app em `art-source/app/app_icon.png` (fora de `public/`); mova o arquivo atual para lá e remova `public/assets/app/`. (2) `pwa-icons.mjs` lê de `art-source/app/` e gera ícones do PWA otimizados (PNG com paleta/compressão máxima; alvo: pasta `icons/` bem abaixo de 300 KB) e o favicon. (3) O fundo do maskable usa a cor do canto da arte (evita o quadrado tênue com o `#0D1020`). (4) Garanta que nada de `art-source/` entra no build nem no precache. (5) Medir `dist/`.
**Permitido:** `scripts/pwa-icons.mjs`, `scripts/build-assets.mjs` (só o trecho do `app_icon`), `art-source/app/`, `public/assets/app/` (remover), `public/icons/`, `public/favicon.ico`, `vite.config.ts`, `tests/assets/`, `tests/core/`. **Proibido:** o resto.
**Pronto quando:** typecheck, suíte e build verdes; `dist/` medido e bem abaixo de 3 MB.
**Entrega:** até 4 linhas: tamanhos antes/depois, o que não foi verificado.
