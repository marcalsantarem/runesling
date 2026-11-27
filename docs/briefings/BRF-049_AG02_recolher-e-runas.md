# BRF-049 — AG02 — T-063 Recolher sempre visível e faixa de runas na nova partida
**Leia:** `src/ui/hud.ts`, `src/ui/index.ts`, `src/core/events.ts` (`run:state`, `ui:startRun`); só leitura em `src/scenes/` e `src/match/` para entender quando o estado é emitido. **Regra:** respostas curtas; sem commit/push/branches.
**Pedido (dono):**
1. "Pare de apagar o botão de recolher, só desative ele quando os orbes estiverem parados." O Recolher fica sempre visível na barra inferior; desativado (estado desabilitado da placa ciano, sem toque) quando não há orbes em voo; ativo durante o voo.
2. "Ao iniciar uma segunda partida, ainda exibe as runas antigas na tela até escolher a primeira da partida." A faixa de runas (e demais dados do HUD da partida anterior: combo, crit etc.) deve zerar no início da nova partida.
**Fazer:** corrigir na UI (limpar o estado do HUD ao iniciar partida / ao receber o primeiro `run:state` da nova run). Se a causa for a cena não emitir `run:state` no início da run, **não mexa** em `src/scenes/`: corrija pelo lado da UI e descreva na entrega o que a cena deveria emitir. Testes em `tests/ui/` para os dois casos.
**Permitido:** `src/ui/`, `src/styles/`, `tests/ui/`. **Proibido:** o resto.
**Pronto quando:** `npm test` e `npm run build` passam; conferido no navegador: Recolher visível e desativado com orbes parados, ativo em voo; jogar uma partida, sair, iniciar outra e ver a faixa vazia. **Entrega:** até 4 linhas.
