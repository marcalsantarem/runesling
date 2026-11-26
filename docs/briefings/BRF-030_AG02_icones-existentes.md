# BRF-030 — AG02 — T-031 UI só pede ícones que existem
**Leia:** `src/core/assetManifest.ts` (só `AVAILABLE_ASSETS`), seu `src/ui/dom.ts` (`iconPath`/`artIcon`). **Regra:** respostas curtas; sem commit/push/branches.
**Fazer:** a UI só cria `<img>` para `icons/<iconKey>.webp` quando o caminho está em `AVAILABLE_ASSETS`; senão, direto a bolinha de fallback (sem requisição, sem 404). Testes em `tests/ui/`.
**Permitido:** `src/ui/`, `tests/ui/`. **Proibido:** o resto (o AG07 mexe em `src/core/` e `src/main.ts` em paralelo; não edite `assetManifest.ts`).
**Pronto quando:** typecheck e suíte verdes. **Entrega:** até 3 linhas.
