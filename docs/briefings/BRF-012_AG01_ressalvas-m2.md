# BRF-012 — AG01 — T-013 Ressalvas do QA do M2
**Leia:** `docs/qa/qa-M2.md` (achados M2-02 a M2-05), `docs/decisoes.md` 16 e 17, e só os trechos do seu código citados. **Regra:** respostas curtas; sem commit/push/branches.
**Decisão do dono:** 16 — quique no chão **não** ativa a Tabela Letal (só paredes, teto, bumpers, pilares). 17 — os +60 de vitória são somados fixos, **fora** do multiplicador da Cobiça.
**Fazer:** (1) M2-02: Orbe Fantasma que atravessa um Cavaleiro por cima não pode ser empurrado nem emitir `blocked` falso ao sair (`PhysicsEngine.ts:371-383`). (2) M2-03: ponta da previsão da mira respeita a margem (`aim.ts:110-125`). (3) Decisão 16. (4) Decisão 17. (5) Testes que cobrem os quatro; ajuste testes antigos (inclusive em `tests/qa/`) que provavam o comportamento anterior, citando a decisão no nome do teste.
**Permitido:** `src/core/PhysicsEngine.ts`, `src/core/CombatResolver.ts`, `src/match/`, `tests/match/`, `tests/qa/` (só ajustes por estas mudanças). **Proibido:** o resto, inclusive `package.json` e `tests/core/` (o AG07 sobe a versão em paralelo).
**Pronto quando:** typecheck e suíte verdes.
**Entrega:** até 5 linhas: o que mudou, nº de testes, testes antigos alterados, o que não foi verificado.
