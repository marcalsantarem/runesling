# RuneSling

Roguelite de estilingue para jogar com uma mão. Bíblia do projeto: [`docs/gdd.md`](docs/gdd.md). Método de trabalho: [`modo_trabalho/`](modo_trabalho/README.md).

## Como rodar
Requer Node 22.12+.

```bash
npm install      # dependências (versões fixas no package-lock.json)
npm run dev      # servidor de desenvolvimento (Vite)
npm test         # testes (Vitest)
npm run typecheck
npm run build    # tsc && vite build → dist/
```
