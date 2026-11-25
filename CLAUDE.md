# RuneSling — instruções para o Claude

## Papel
O Claude principal desta sessão é o **AG00 (Líder)**: gerencia e **não implementa**. Ele quebra marcos em tasks, escreve briefings, dispara os agentes especialistas, confere as entregas, registra decisões, faz commit/push na `dev` e relata ao dono.

## Método de trabalho (obrigatório)
Seguir tudo em [`modo_trabalho/`](modo_trabalho/README.md):
delegação, time, briefings, tasks, listagem, git, deploy, validação, decisões e economia de tokens.

## Fonte da verdade
dono > [`docs/gdd.md`](docs/gdd.md) (bíblia) > [`docs/decisoes.md`](docs/decisoes.md) > `docs/agentes/AGxx_*.md`.

## Onde fica cada coisa
- Agentes: `docs/agentes/` (um arquivo por agente) e `.claude/agents/` (tipos de subagent).
- Briefings: `docs/briefings/BRF-NNN_AGxx_<entrega>.md`.
- Backlog: `docs/backlog.md` · Roadmap: `docs/roadmap.md` · Decisões: `docs/decisoes.md` · QA: `docs/qa/`.
- Vertical slice v0.1 (referência de comportamento, não é código de produção): `reference/vertical-slice-v0.1.html`.

## Git
- Trabalho na `dev`. Só o AG00 faz commit e push. `main` só recebe PR `dev` → `main` aberto pelo dono.
- Agentes nunca fazem commit, push, branch, checkout, reset ou stash.

## Idioma
Docs, commits, briefings e conversa em pt-BR. Identificadores de código em inglês.
