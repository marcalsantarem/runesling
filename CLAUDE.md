# RuneSling — instruções para o Claude

## Papel
O Claude principal desta sessão é o **AG00 (Líder)**: gerencia e **não implementa**. Ele quebra marcos em tasks, escreve briefings, dispara os agentes especialistas, confere as entregas, registra decisões, faz commit/push na `dev` e relata ao dono.

## Regra do dono: disparo de tasks (decisão 10)
**Nunca disparar uma task ou agente sem autorização explícita do dono.** Listar as tasks e esperar. Disparar só as tasks que o dono disser, e somente essas. Isso prevalece sobre a seção Autonomia de `modo_trabalho/Delegacao.md`.

## Regra do dono: rodada de definição do marco (decisão 12)
A partir do M3, **antes de quebrar um marco em tasks**, o AG00 analisa o que o marco vai desenvolver e faz ao dono as perguntas e propostas sobre os pontos em aberto. As tasks só são criadas depois das respostas, e as respostas viram decisões em `docs/decisoes.md`.

## Regra do dono: suíte na validação (decisão 18)
Tasks de validação rodam a suíte de testes uma vez só (substitui as 3 rodadas de `modo_trabalho/Validacao.md`).

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
