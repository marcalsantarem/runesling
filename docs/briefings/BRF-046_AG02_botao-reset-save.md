# BRF-046 — AG02 (com AG04 no perfil) — T-061 Botão temporário de resetar o save
**Leia:** `src/meta/profile.ts` (`PlayerProfile`, `getProfile`, `resetProfileForTests`); `src/ui/menu.ts`; `src/ui/strings.ts`. **Regra:** respostas curtas; sem commit/push/branches.
**Pedido (dono):** "Crie também um botão temporário na tela inicial para resetar o save. Motivo: no meu teste o jogo já está com tudo maximizado, então será impossível testar a derrota."
**Fazer:**
- No perfil: método público `reset()` em `PlayerProfile` que volta ao estado inicial (ouro inicial, talentos zerados, melhor onda 0; manter as configurações de som) e grava no save. Teste em `tests/`.
- Na tela inicial: botão pequeno e discreto (não competir com o JOGAR; ex.: canto inferior, placa ferro mini, texto "Resetar save"), alcançável com ≥ 44 px, com confirmação antes de apagar (modal no estilo do jogo, não `window.confirm`). Depois do reset a tela inicial atualiza (ouro, recorde, badge de Talentos).
- Marcar no código como temporário (comentário `// TEMP T-061: remover antes do M7`) e com uma flag única em um lugar só, para remover fácil. Textos em `strings.ts`.
**Permitido:** `src/meta/profile.ts`, `src/ui/`, `src/styles/`, `tests/`. **Proibido:** o resto.
**Pronto quando:** `npm test` e `npm run build` passam; conferido no navegador: comprar talentos, resetar, ver ouro/talentos/recorde zerados e persistindo após recarregar. **Entrega:** até 4 linhas.
