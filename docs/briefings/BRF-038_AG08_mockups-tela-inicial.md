# BRF-038 — AG08 — T-052 Mockups da tela inicial
**Leia:** `docs/decisoes.md` 38; `docs/ui-guia.md`; `docs/mockups/ui-direcoes.html` (seção A); a tela atual no `vite preview` (capture para referência). Use as artes reais do repositório (`art-source/raw/`, `public/assets/`: chefe, inimigos, ícones, chão, moldura, `art-source/app/app_icon.png` com o estilingue). **Regra:** respostas curtas; sem commit/push/branches.
**Problema (dono):** a tela inicial atual parece "app genérico de IA": painéis e cartões empilhados como dashboard, stats em blocos, fundo estático, layout de template. O alvo é parecer **jogo mobile** na direção A (fantasia ornamentada), com a tela como um **lugar** e não um formulário.
**Fazer:** `docs/mockups/tela-inicial.html` autocontido (fontes podem vir do Google Fonts só no mockup) com **6 telas 390×844**: 3 conceitos × 2 variações, cada uma com rótulo claro e uma linha explicando a ideia:
- **1. Cripta viva:** a tela é a entrada da cripta (porta/portal ao fundo, chefe nas sombras, tochas, brasas e névoa animadas em CSS), estilingue/orbe em primeiro plano, JOGAR integrado à cena; stats fora da tela principal (ou discretos). Variação 1a e 1b com composições diferentes.
- **2. Mapa de expedição:** mapa pintado/estilizado com o Capítulo I liberado e II/III trancados como nós no caminho; JOGAR sai do nó atual. 2a e 2b.
- **3. Lançador em destaque:** estilingue rúnico grande como "personagem" no centro, orbe girando e runas orbitando, logo e botão enxutos ao redor. 3a e 3b.
Em todas: ouro (sem "+"), som, configurações e acesso a Talentos continuam alcançáveis com o polegar (≥ 44 px). Animações leves em CSS (respeitando `prefers-reduced-motion`). Capturas `docs/mockups/tela-inicial-1.png`, `-2.png`, `-3.png` (cada uma com as 2 variações lado a lado), em JPEG/PNG comprimido (≤ 600 KB cada).
**Permitido:** `docs/mockups/`. **Proibido:** o resto.
**Pronto quando:** HTML abre sem erro; 3 capturas conferidas a olho. **Entrega:** até 4 linhas.
