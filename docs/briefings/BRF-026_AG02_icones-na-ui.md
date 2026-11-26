# BRF-026 — AG02 — T-028 Ícones na UI
**Leia:** `docs/briefings/_contrato-m4-assets.md`, `docs/decisoes.md` 32; seus `src/ui/` e `src/styles/`. **Regra:** respostas curtas; sem commit/push/branches.
**Contrato:** ícones avulsos em `public/assets/icons/<iconKey>.webp` (128×128), `iconKey` vindo de `perks.json`/`talents.json`. Os arquivos ainda não existem: o ícone tem fallback para a bolinha colorida atual (sem quebrar layout nem gerar erro no console quando o arquivo falta).
**Fazer:** (1) Ícone nas cartas do Draft, na lista de Talentos e na faixa de runas (empilhando repetidas com um contador). (2) Fallback por `onerror`. (3) Testes em `tests/ui/` (caminho do ícone por chave, fallback).
**Permitido:** `src/ui/`, `src/styles/`, `tests/ui/`. **Proibido:** o resto.
**Pronto quando:** typecheck, suíte e build verdes; captura com ícones provisórios seus no scratchpad (servidos só no teste) e sem ícones.
**Entrega:** até 4 linhas.
