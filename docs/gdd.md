# Game Design Document (GDD) — RuneSling

**Versão do Documento:** 1.0 (Pós-Vertical Slice)  
**Título do Projeto:** *RuneSling* *(Título alternativo: Arcana Ricochet)*  
**Gênero:** Roguelite de Estilingue / Ação Tática de Ricochete  
**Plataformas-Alvo:** Web-First (Navegadores Mobile e Desktop, portais como Poki/CrazyGames) $\to$ Mobile Nativo (iOS e Android via Capacitor.js)  
**Orientação de Tela:** Retrato (Portrait $9:16$ / $9:18.2$), jogável integralmente com uma mão  
**Modelo de Negócio:** Free-to-Play com anúncios recompensados opcionais e cosméticos / progressão justa  

---

## 1. Visão Geral do Projeto (High Concept)

### 1.1 Elevator Pitch
*RuneSling* é um roguelite tático de estilingue para jogar com uma mão, ambientado em masmorras de fantasia sombria iluminadas por runas neon. O jogador puxa, mira prevendo tabelas nas paredes e dispara rajadas de Orbes Arcanos contra hordas de monstros em medalhões, desviando de escudos frontais, ativando pinos de pinball, clonando projéteis em anéis mágicos e montando sinergias elementais explosivas em sessões rápidas de 4 a 6 minutos.

### 1.2 Pilares de Design
1. **Ergonomia Absoluta com 1 Mão:** Toda a partida — mirar, disparar, acelerar o voo, recolher orbes e escolher cartas — ocorre na zona natural do polegar, sem dependência de latência zero.
2. **Decisão Tática em Cada Tacada:** Diferente de *brick-breakers* passivos, o posicionamento de obstáculos (bumpers, pilares, anéis) e inimigos com mecânicas (escudo frontal, atiradores, curandeiros) exige leitura de ângulo e tabelas inteligentes.
3. **Suco (*Game Feel*) de Alto Impacto:** Combos crescentes com aumento dinâmico de tom (*pitch*), *hit-flash*, *squash & stretch*, faíscas aditivas em WebGL e tremidas de câmera proporcionais ao dano.
4. **Produção Enxuta e 100% *Data-Driven*:** Inimigos em formato de medalhões circulares dispensam animações quadro a quadro caras, e todo novo conteúdo (fases, monstros, perks, biomas) é adicionado via arquivos JSON e pipeline automatizado de assets.

### 1.3 Referências de Mercado
* **Mecânica e Loop de Run:** *PunBall*, *Peglin* e *Archero*.
* **Estética e Contraste:** *Darkest Dungeon* (iluminação dramática e molduras metálicas) combinado com clareza visual de jogos modernos de loja mobile.

---

## 2. Core Gameplay Loop & Controles

### 2.1 Fluxo do Turno
1. **Fase de Mira:** O jogador toca e arrasta em **qualquer ponto da arena** (não precisa tocar exatamente no lançador, evitando que o dedo tampe a visão). Uma linha pontilhada projeta a trajetória com $1$ quique de parede (ou $2$ quiques com o perk *Visão Arcana*).
2. **Disparo:** Ao soltar o dedo, os orbes são lançados em leque simétrico a partir da base $(x_0, y_0)$.
3. **Voo e Ricochete:** Os orbes colidem com paredes, bumpers, pilares, anéis multiplicadores e inimigos, disparando efeitos elementais, críticos e combos em tempo real.
4. **Controles Auxiliares em Voo:**
   * **Velocidade $2\times$:** Duplica os passos de física por frame para acelerar turnos longos.
   * **Botão Recolher:** Permite abortar o voo imediatamente caso reste apenas um orbe perdido quicando sem impacto relevante.
5. **Resolução de Fim de Turno:**
   * Aplica dano de queimadura (*Ignite*) nos inimigos afetados.
   * Clérigos curam aliados feridos no raio de alcance.
   * Chefes verificam recarga de invocação de reforços.
   * Todos os inimigos avançam verticalmente em direção à Linha da Barreira.
   * Atiradores com contador zerado disparam contra a base do jogador.
   * Inimigos que cruzam a barreira causam dano direto e desaparecem (chefes causam dano e recuam para continuarem na luta).
6. **Progressão da Onda:** Se a onda atual for um marco de *Draft*, abre-se a seleção de 1 entre 3 Runas (Perks). Caso contrário, a próxima onda surge no topo da arena.

### 2.2 Ergonomia e Travas de Segurança no Toque
* **Ângulo Mínimo de Disparo:** O ângulo de lançamento $\theta$ é limitado para apontar sempre para cima, respeitando o intervalo:
  $$-\pi + 0.14 \le \theta \le -0.14 \text{ rad}$$
  Isso impede que o jogador desperdice um turno atirando acidentalmente contra o chão.
* **Cancelamento de Mira:** Se a distância puxada for menor que $14\text{ px}$ lógicos, o disparo é cancelado silenciosamente.
* **Potência Controlada:** A velocidade inicial $v_0$ escala suavemente com o puxão $d$:
  $$v_0 = 9.5 + \min\left(1,\; \frac{d}{120}\right) \cdot 3.8$$

### 2.3 Física Customizada e Regras Anti-Tédio
Para evitar a imprecisão de motores pesados (Box2D/Matter.js) em múltiplos ricochetes rápidos, o jogo usa um motor vetorial próprio com **Sub-stepping**:
* **Sub-stepping ($N = 4$ sub-passos por frame):** Em velocidade $1\times$, cada frame divide o movimento em $4$ iterações (em $2\times$, são $2$ ciclos de $4$ sub-passos). Isso impede o efeito de *tunneling* (orbes rápidos atravessando inimigos ou escudos).
* **Reflexão Vetorial Elástica:** Dada a velocidade $\vec{v}$ e a normal unitária de colisão $\vec{n}$, a nova velocidade é calculada apenas quando $\vec{v} \cdot \vec{n} < 0$:
  $$\vec{v}' = \vec{v} - 2(\vec{v} \cdot \vec{n})\vec{n}$$
* **Amortecimento Progressivo (Anti-Voo Infinito):** Durante os primeiros $340$ ticks de voo, o fator de amortecimento por frame é $\gamma = 0.9935$. Após $340$ ticks, passa para $\gamma = 0.962$ para encerrar o turno de forma suave. Por sub-passo, aplica-se $\gamma_{\text{sub}} = \gamma^{1/N}$.
* **Prevenção de Loop Horizontal:** Se $|v_y| < 0.25$ e $|v_x| > 1.5$, injeta-se um micro-desvio vertical de $\pm 0.04$ por sub-passo para quebrar quiques presos entre paredes laterais.
* **Limite de Entidades Simultâneas:** Teto rígido de $28$ orbes ativos simultâneos (incluindo clones temporários) para garantir $60\text{ FPS}$ estáveis em dispositivos móveis de entrada.

---

## 3. Estrutura de Capítulos, Inimigos e Elementos de Arena

### 3.1 Estrutura de Capítulo
* **Duração Alvo:** $4$ a $6$ minutos por expedição.
* **Cadência:** $15$ ondas por capítulo.
  * **Onda 7:** Mini-Chefe (*Guardião de Ferro*) + recompensa de Relíquia/Draft garantida.
  * **Onda 15:** Chefe Final (*Senhor Obsidiana*). A vitória exige eliminar o chefe e todos os inimigos restantes na arena.
* **Ondas de Draft:** Ondas $2, 4, 6, 7, 9, 11, 13$ (total de $7$ escolhas de build por run).

### 3.2 Curva de Escalonamento de HP
Para o inimigo do tipo $k$ na onda $w$, o HP base é calculado pela fórmula:
$$\text{HP}_{\text{base}}(w) = 4 + 2.8w + 0.55w^{1.32}$$
$$\text{HP}(k, w) = \max\left(2,\; \operatorname{round}\left(\text{HP}_{\text{base}}(w) \cdot M_k\right)\right)$$
onde $M_k$ é o multiplicador específico do tipo de inimigo.

### 3.3 Catálogo de Inimigos — Capítulo 1 (Cripta Obsidiana)

| ID | Nome | Raio (px) | Mult. HP ($M_k$) | Ouro | Mecânica & Comportamento Tático |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `goblin` | Goblin | $17$ | $1.00$ | $2$ | Inimigo padrão de pressão numérica. Avança $36\text{ px}$/turno. |
| `shield` | Cavaleiro | $19$ | $1.25$ | $3$ | **Escudo Frontal:** Bloqueia qualquer impacto cuja normal tenha $n_y > 0.30$ (vindo de baixo). Obriga o jogador a usar tabela nas paredes/teto para acertar pelas costas ou laterais. |
| `shooter` | Cultista | $18$ | $0.95$ | $3$ | **Atirador:** Possui contador de $2$ turnos. Ao zerar, dispara raio causando $1$ de dano direto na base. |
| `bomb` | Golem de Magma | $18$ | $0.85$ | $3$ | **Explosivo:** Ao morrer, detona em raio de $92\text{ px}$ causando $2.5 \times \text{ATK}$ a todos os inimigos ao redor (gera reação em cadeia). |
| `splitter` | Espectro | $19$ | $1.05$ | $3$ | **Divisor:** Ao ser abatido, gera $2$ `mini` (*Fagulhas*) deslocadas horizontalmente em $\pm 20\text{ px}$. |
| `mini` | Fagulha | $12$ | $0.45$ | $1$ | Versão menor gerada pelo Espectro. Baixa vida, alta prioridade para evitar invasão. |
| `healer` | Clérigo Sombrio | $18$ | $1.00$ | $4$ | **Curandeiro:** No fim do turno, cura $22\%$ do HP máximo de $1$ aliado ferido num raio de $130\text{ px}$. |
| `miniboss` | Guardião de Ferro | $31$ | $5.20$ | $18$ | **Mini-Chefe (Onda 7):** Possui Escudo Frontal, avança $22\text{ px}$/turno e invoca $1$ Goblin a cada $2$ turnos. Causa $4$ de dano se tocar a barreira e recua $72\text{ px}$. |
| `boss` | Senhor Obsidiana | $36$ | $9.50$ | $40$ | **Chefe Final (Onda 15):** Dispara ataques de $2$ de dano a cada $2$ turnos e invoca reforços continuamente. Exige priorização entre limpar minions e focar DPS. |

### 3.4 Elementos Interativos da Arena
* **Bumpers Rúnicos (Pinball):** Círculos fixos que aceleram o orbe em $15\%$ no impacto (teto de velocidade $15.5$), alteram a trajetória e ativam sinergias elétricas.
* **Pilar de Obsidiana:** Bloco retangular com colisão *Circle vs. AABB* posicionado no terço superior/central, criando corredores táticos para aprisionar orbes acima da linha dos inimigos.
* **Anel Multiplicador ($2\times$):** Portal circular giratório. A primeira vez que cada orbe original atravessa o anel, gera $1$ clone temporário ($70\%$ de dano) com leve desvio angular de $\pm 0.22\text{ rad}$.
* **Expansões Planejadas (Capítulos 2 e 3):**
  * *Portais Gêmeos:* Teletransportam o orbe da parte inferior diretamente para o teto da arena (atrás de escudos).
  * *Paredes Destrutíveis:* Blocos de gelo/pedra com HP próprio que protegem atiradores.
  * *Zonas de Fogo:* Faixas no chão que incendeiam qualquer orbe que passe por elas.

---

## 4. Sistema Roguelite: Perks & Tríade de Sinergias

As runas obtidas durante o Draft pertencem a $3$ sinergias elementais principais mais uma categoria de utilidade base (*Arcana*).

### 4.1 Sinergia Elétrica (Ciano — Controle de Grupo e Reação em Cadeia)
| ID | Nome | Gatilho | Efeito |
| :--- | :--- | :--- | :--- |
| `chain_lightning` | Raio em Cadeia | `onEnemyHit` | $45\%$ de chance de disparar raio em outro inimigo (raio $155\text{ px}$) causando $75\%\text{ ATK}$. |
| `bumper_shock` | Sobrecarga Rúnica | `onBumperHit` | Quicar num Bumper emite onda elétrica de $92\text{ px}$ causando $85\%\text{ ATK}$ e aplicando *Choque*. |
| `static_crit` | Voltagem Crítica | `onDamageCalc` | Inimigos sob efeito de *Choque* sofrem $+35\%$ de dano pelo restante do turno. |
| `storm_orb` | Orbe Tempestuoso | `onAcquire` | Concede $+1$ orbe permanente na run e aumenta em $+15\%$ a chance do Raio em Cadeia. |

### 4.2 Sinergia Ígnea (Laranja/Magma — Dano em Área e Queimadura)
| ID | Nome | Gatilho | Efeito |
| :--- | :--- | :--- | :--- |
| `fire_splash` | Impacto Flamejante | `onEnemyHit` | Todo impacto causa $45\%\text{ ATK}$ em área ($60\text{ px}$, ou $76\text{ px}$ com *Núcleo de Magma*). |
| `ignite` | Chama Persistente | `onTurnEnd` | Inimigos atingidos por orbes queimam ao final do turno, sofrendo $100\%\text{ ATK}$. |
| `supernova` | Detonação Ígnea | `onKill` | Qualquer inimigo abatido explode ($74\text{ px}$) causando $1.5 \times \text{ATK}$ em área. |
| `molten_core` | Núcleo de Magma | `onAcquire` | Concede $+3\text{ ATK}$ base e aumenta em $+25\%$ o raio de todas as explosões ígneas. |

### 4.3 Sinergia Espectral (Violeta — Física Avançada e Multiplicação)
| ID | Nome | Gatilho | Efeito |
| :--- | :--- | :--- | :--- |
| `ghost_ball` | Orbe Fantasma | `onLaunch` | O 1º orbe lançado atravessa inimigos sem escudo (com cooldown interno de $14$ frames por inimigo para evitar multi-hit instantâneo). |
| `ricochet_crit` | Tabela Letal | `onDamageCalc` | Orbes que já quicaram em paredes, bumpers ou pilares causam $2\times$ de dano. |
| `wall_clone` | Eco do Teto | `onCeilingHit` | O 1º quique de cada orbe principal no teto gera $1$ clone espectral temporário. |
| `arcane_sight` | Visão Arcana | `onAcquire` | Estende a previsão de mira para $2$ quiques e adiciona $+20\%$ de chance Crítica. |

### 4.4 Runas de Núcleo (Repetíveis)
* **Orbe Adicional (`extra_orb`):** $+1$ orbe em todos os lançamentos.
* **Fúria Rúnica (`power_surge`):** $+2\text{ ATK}$ permanente na run.
* **Selo Restaurador (`bastion_heal`):** Recupera $+5\text{ HP}$ da barreira e aumenta o HP máximo em $+2$.

### 4.5 Fórmula de Cálculo de Dano Final
O dano final aplicado a um inimigo segue a ordem determinística:
$$\text{Dano} = \max\left(1,\; \operatorname{round}\left(\text{ATK} \cdot M_{\text{tabela}} \cdot M_{\text{temp}} \cdot M_{\text{crit}} \cdot M_{\text{choque}}\right)\right)$$
onde:
* $M_{\text{tabela}} = 2.0$ se possuir *Tabela Letal* e o orbe já tiver quicado (senão $1.0$).
* $M_{\text{temp}} = 0.7$ para orbes clonados temporariamente (senão $1.0$).
* $M_{\text{crit}} = 1.75$ em acerto crítico (senão $1.0$).
* $M_{\text{choque}} = 1.35$ se o alvo estiver eletrocutado com *Voltagem Crítica* (senão $1.0$).

---

## 5. Meta-Progressão, Economia e Retenção

### 5.1 Talentos Permanentes (MVP v0.1 / v1.0)
Todo ouro coletado durante a expedição é multiplicado pelo bônus de Cobiça e somado ao banco permanente do jogador. Vitória no capítulo concede bônus de $+60$ ouro.

O custo de cada nível $L$ (começando em $L=0$) segue progressão linear controlada:
$$\text{Custo}(L) = C_{\text{base}} + L \cdot \Delta C$$

| Talento | Efeito por Nível | Nível Máx. | $C_{\text{base}}$ | Passo ($\Delta C$) |
| :--- | :--- | :---: | :---: | :---: |
| **Forja Arcana** | $+1\text{ ATK}$ inicial | $10$ | $25$ | $20$ |
| **Barreira Rúnica** | $+2\text{ HP}$ Máximo da base | $10$ | $20$ | $18$ |
| **Maestria de Orbes** | $+1$ Orbe inicial | $3$ | $75$ | $90$ |
| **Olho do Ricochete** | $+5\%$ Chance Crítica | $8$ | $30$ | $24$ |
| **Cobiça da Cripta** | $+15\%$ Ouro por run | $6$ | $35$ | $28$ |

### 5.2 Sistema de Equipamentos e Fusão (Fase 2 — Retenção Dia 7+)
* **6 Slots de Equipamento:** Cajado (ATK), Orbe (Efeito Elemental inicial), Anel (Crítico/Tabela), Amuleto (HP/Escudo da Base), Capa (Redução de Dano de Atiradores), Botas (Bônus de Ouro/Draft).
* **Escala de Raridades:** Comum (Cinza `#8B95B5`) $\to$ Raro (Ciano `#00CEC9`) $\to$ Épico (Violeta `#9C6BFF`) $\to$ Lendário (Ouro `#FECA57`).
* **Fusão 3-para-1:** Combinar $3$ itens idênticos da mesma raridade promove o item para a raridade seguinte, destravando um traço passivo exclusivo (ex.: Cajado Épico começa a run com *Tabela Letal* ativa).

### 5.3 Expansão de Biomas (Capítulos Futuros)
1. **Capítulo I — Cripta Obsidiana:** Paleta azul-marinho e ouro; introduz Escudos, Magma, Bumpers e Anel $2\times$.
2. **Capítulo II — Forja Abissal:** Paleta carvão e magma; introduz Zonas de Fogo, Golems Blindados e Chefe Titã de Lava.
3. **Capítulo III — Santuário Espectral:** Paleta índigo e violeta; introduz Portais Gêmeos de Teleporte, Inimigos Invisíveis por 1 turno e Chefe Lich.

### 5.4 Retenção e Monetização Não-Intrusiva
* **Desafio Diário:** Arena fixa com semente determinística (*seeded RNG*) igual para todos os jogadores por $24\text{h}$, com placar de maior pontuação / menor número de turnos.
* **Anúncios Recompensados (100% opcionais, nunca intersticiais forçados no meio da partida):**
  * *Segunda Chance:* Reviver $1\times$ por expedição com $50\%$ do HP da base.
  * *Roletar Runas:* Sortear $3$ novos perks no Draft ($1\times$ por Draft).
  * *Saque em Dobro:* Dobrar o ouro obtido ao final de uma expedição.
* **Cosméticos / IAPs:** Pacotes de rastros de orbes (Chama Azul, Galáxia, Relâmpago Dourado), skins de lançador e opção "Remover Anúncios" (mantendo os bônus de forma instantânea).

---

## 6. Direção de Arte, UI/UX e Áudio

### 6.1 Identidade Visual — *Obsidian Arcane*
Estética de fantasia sombria estilizada com pintura 2D rica em texturas de pedra e metal forjado, contrastada por runas luminosas em alto brilho.

* **Regra de Contraste 60 / 30 / 10:**
  * **60% Fundo:** Pedra obsidiana escura e dessaturada (`#0D1020` $\to$ `#06070F`) com baixa poluição visual para não cansar a vista no celular.
  * **30% Estrutura & HUD:** Ferro forjado, molduras metálicas escuras e painéis translúcidos (`#14182B`, borda `#2E385C`).
  * **10% Ação & Leitura:** Efeitos de alto contraste com *additive blending* no WebGL.
* **Paleta Oficial (Cor = Mecânica):**
  * **Ouro (`#FECA57` / `#B87B14`):** Títulos, chefes, anel $2\times$, críticos, moedas.
  * **Ciano Rúnico (`#00CEC9` / `#0984E3`):** Orbes, mira, escudos frontais, sinergia Elétrica.
  * **Magma (`#FF9F43` / `#992D0C`):** Inimigos explosivos, queimadura, sinergia Ígnea.
  * **Violeta Arcano (`#9C6BFF` / `#3E1F73`):** Atiradores, divisores, sinergia Espectral.
  * **Carmesim (`#FF5E57` / `#8F1D2C`):** HP da barreira, linha de perigo, dano recebido.
  * **Esmeralda (`#1DD1A1`):** Cura e Clérigos.
* **Tipografia:**
  * **Cinzel (700/900):** Títulos, números de ondas, banners de chefe e nomes de capítulos.
  * **Plus Jakarta Sans (600/700/800):** Valores de HP/ATK, descrições de cartas e botões (alta legibilidade em telas de $5.5"$ a $6.7"$).

### 6.2 Separação de Camadas de Renderização
* **Camada WebGL (Phaser 3):** Chão *tileable*, tochas dinâmicas, medalhões de inimigos, obstáculos, linha de mira, orbes, rastros, partículas e efeitos de luz (*bloom*/aditivo).
* **Camada HTML/CSS Overlay:** HUD superior (HP, Onda, Ouro), barra inferior (ATK, Orbes, Velocidade, Recolher), modais de Draft, Menu Principal e Tela de Talentos/Inventário. Garante nitidez perfeita em telas Retina/HiDPI e iteração de UI extremamente rápida.

### 6.3 Design de Áudio e *Game Feel*
* **Formato de Áudio:** Exportação dupla em `.m4a` (AAC para compatibilidade nativa com iOS Safari) e `.ogg` (desktop/Android), peso alvo de $10$ a $25\text{ KB}$ por efeito sonoro.
* **Variação Dinâmica de Pitch:** Cada impacto de orbe aplica jitter aleatório de $\pm 8\%$ e escala o pitch conforme o combo do turno $c$:
  $$p(c) = \min\left(1.45,\; 1.0 + 0.03c\right)$$
  Isso cria uma escalada musical recompensadora durante combos longos.
* **Feedback Visual Procedural (Zero Animação Quadro a Quadro):**
  * *Hit-flash:* Tint branco sólido por $50\text{ ms}$ ao sofrer dano.
  * *Squash & Stretch:* Escala instantânea para $1.18\times$ retornando suavemente para $1.0\times$ com interpolação exponencial.
  * *Screen Shake:* Deslocamento de câmera proporcional ao evento (dano normal: $0\text{ px}$; explosão: $7\text{ px}$; invasão de barreira: $12\text{ px}$).

---

## 7. Arquitetura Técnica e Stack Definida

### 7.1 Stack Oficial (Veredito de Produção)
* **Linguagem:** TypeScript (tipagem estrita para física, estados e schemas JSON).
* **Bundler & Dev Server:** Vite (build final $< 4\text{ MB}$, abertura em $< 1.5\text{ s}$ em 4G).
* **Motor Gráfico / Cenas:** Phaser 3 (WebGL com fallback automático para Canvas; **sem** usar Arcade/Matter Physics).
* **Física:** Motor próprio determinístico em TypeScript puro (desacoplado do Phaser para permitir testes unitários automatizados).
* **Interface (UI):** HTML5 + CSS/Tailwind sobreposto ao canvas, comunicado via `EventBus` tipado.
* **Empacotamento Mobile:** Capacitor.js (empacota o build web em app iOS/Android nativo com acesso a AdMob, In-App Purchases e Haptics/Vibração).
* **Persistência:**
  * *Offline/Local:* `localForage` (sobre `IndexedDB` — imune a limpeza casual de `localStorage`).
  * *Nuvem & Anti-Cheat (Fase 4):* Supabase (PostgreSQL + Auth anônima/Social + Edge Functions para validação de recompensas e placar do Desafio Diário).

### 7.2 Estrutura de Pastas do Repositório
```text
runesling/
├── art-source/                 # Imagens brutas geradas por IA (NÃO vai para o build final)
│   ├── anchors/                # Imagens-âncora de referência de estilo (Style Reference)
│   ├── raw/                    # Saída direta da API de geração (fundo chapado)
│   │   ├── enemies/
│   │   ├── bosses/
│   │   ├── obstacles/
│   │   ├── icons/
│   │   └── tiles/
│   └── cut/                    # Imagens intermediárias pós-remoção de fundo (cache local)
├── scripts/
│   ├── assets-manifest.json    # Lista declarativa de todos os assets + prompts + specs
│   ├── generate-assets.mjs     # CLI que chama a API de IA para gerar assets faltantes
│   ├── remove-bg.py            # Worker Python local (rembg) em lote
│   └── build-assets.mjs        # Padronização (sharp) + empacotamento em Texture Atlases
├── public/
│   └── assets/                 # Saída final ultraleve servida pelo Vite/Capacitor
│       ├── atlases/            # enemies.webp + .json | icons.webp + .json
│       ├── tiles/              # floor_crypt.webp
│       └── audio/              # sfx/*.m4a, sfx/*.ogg
├── src/
│   ├── main.ts                 # Bootstrap do Phaser 3 + UI
│   ├── core/
│   │   ├── EventBus.ts         # Comunicação desacoplada Phaser <-> UI HTML
│   │   ├── PhysicsEngine.ts    # Motor de sub-stepping puro (círculo, AABB, escudo)
│   │   ├── CombatResolver.ts   # Cálculo de dano, perks, sinergias e cadeia de mortes
│   │   └── SaveManager.ts      # localForage + sincronização futura Supabase
│   ├── data/                   # Arquivos JSON que definem 100% do conteúdo do jogo
│   │   ├── enemies.json
│   │   ├── perks.json
│   │   ├── arenas.json
│   │   ├── chapters.json
│   │   └── talents.json
│   ├── scenes/
│   │   ├── BootScene.ts        # Preload dos atlases e áudio
│   │   └── BattleScene.ts      # Render WebGL, partículas, shaders e input de mira
│   └── ui/
│       ├── MenuUI.ts
│       ├── HudUI.ts
│       ├── DraftModalUI.ts
│       └── TalentsUI.ts
├── capacitor.config.ts
├── vite.config.ts
└── package.json
```

### 7.3 Schemas JSON (*Data-Driven Design*)

#### `src/data/enemies.json`
```json
{
  "shield": {
    "id": "shield",
    "name": "Cavaleiro",
    "spriteKey": "enemy_shield",
    "radius": 19,
    "hpMult": 1.25,
    "gold": 3,
    "advancePx": 36,
    "barrierDmg": 2,
    "behaviors": ["front_shield"],
    "shieldArc": { "minNormalY": 0.30 }
  },
  "boss_obsidian": {
    "id": "boss_obsidian",
    "name": "Senhor Obsidiana",
    "spriteKey": "boss_obsidian",
    "radius": 36,
    "hpMult": 9.5,
    "gold": 40,
    "advancePx": 22,
    "barrierDmg": 4,
    "isBoss": true,
    "behaviors": ["shooter", "summoner"],
    "shoot": { "cooldown": 2, "damage": 2 },
    "summon": { "cooldown": 2, "spawnId": "goblin", "maxArenaCount": 10 }
  }
}
```

#### `src/data/perks.json`
```json
{
  "chain_lightning": {
    "id": "chain_lightning",
    "name": "Raio em Cadeia",
    "synergy": "lightning",
    "rarity": "rare",
    "iconKey": "icon_chain_lightning",
    "repeatable": false,
    "trigger": "onEnemyHit",
    "params": {
      "chance": 0.45,
      "damageRatio": 0.75,
      "rangePx": 155,
      "applyStatus": "shocked"
    }
  }
}
```

#### `src/data/chapters.json`
```json
{
  "chapter_1": {
    "id": "chapter_1",
    "name": "Cripta Obsidiana",
    "theme": {
      "floorTile": "floor_crypt",
      "torchColor": "#ff8c32",
      "ambientDustColor": "#00cec9"
    },
    "arenaId": "arena_crypt_standard",
    "totalWaves": 15,
    "draftWaves": [2, 4, 6, 7, 9, 11, 13],
    "fixedSpawns": {
      "7": ["miniboss_iron"],
      "15": ["boss_obsidian"]
    },
    "poolByWave": [
      { "fromWave": 1, "weights": { "goblin": 100 } },
      { "fromWave": 2, "weights": { "goblin": 65, "shield": 35 } },
      { "fromWave": 4, "weights": { "goblin": 35, "shield": 22, "bomb": 20, "shooter": 23 } },
      { "fromWave": 6, "weights": { "goblin": 20, "shield": 20, "bomb": 16, "shooter": 16, "splitter": 14, "healer": 14 } }
    ]
  }
}
```

---

## 8. Pipeline Totalmente Automatizado de Geração de Assets por IA

O objetivo desta esteira é eliminar trabalho manual no Photoshop, garantir **100% de consistência estética** entre dezenas de inimigos e ícones, e reduzir o tempo para incluir um novo ativo no jogo para **menos de 3 minutos**.

### 8.1 Regra de Divisão de Responsabilidade
* **IA Gera:** Medalhões de inimigos e chefes, obstáculos (bumpers/pilares), ícones de perks/equipamentos e texturas *tileable* de chão.
* **WebGL / Código Gera:** Orbes, rastros, raios elétricos, escudos frontais holográficos, auras de fogo/chefe, explosões, flash de impacto e animações de flutuação/esmagamento. **Nunca** peça *outer glow* (brilho externo) nos prompts da IA — brilho externo contamina o canal alfa e destrói o recorte.

### 8.2 Arquitetura da Esteira (`npm run assets:all`)
```text
[assets-manifest.json]
        │
        ▼  (1) npm run assets:gen   -> scripts/generate-assets.mjs
[API de Imagem + Asset Âncora (Style Reference)]
        │  Salva apenas arquivos faltantes ou com flag --force
        ▼
[art-source/raw/**/*.png]
        │
        ▼  (2) npm run assets:cut   -> scripts/remove-bg.py (rembg / U2Net / BiRefNet)
[art-source/cut/**/*.png]           (Fundo transparente limpo em lote)
        │
        ▼  (3) npm run assets:pack  -> scripts/build-assets.mjs (sharp + free-tex-packer-core)
  • Trim automático de transparência excedente
  • Centralização geométrica exata no canvas alvo
  • Máscara circular perfeita para medalhões comuns (circularMask: true)
  • Redimensionamento padronizado (256x256, 384x384, 128x128, 512x512)
  • Empacotamento em Texture Atlas formato Phaser 3 + compressão WebP (q=84)
        │
        ▼
[public/assets/atlases/enemies.webp + enemies.json]
[public/assets/atlases/icons.webp   + icons.json]
[public/assets/tiles/floor_crypt.webp]
```

### 8.3 Etapa 1 — Controle de Consistência e Manifesto (`scripts/assets-manifest.json`)
Para evitar que o jogo pareça uma colagem de estilos diferentes:
1. **Asset Âncora Obrigatório:** Antes de gerar o lote completo, gera-se e aprova-se manualmente **1 único medalhão** (o *Cavaleiro*) e **1 único ícone** (*Raio em Cadeia*). Eles são salvos em `art-source/anchors/medallion_anchor.png` e `art-source/anchors/icon_anchor.png`.
2. **Sufixos Globais e Style Reference:** O manifesto define sufixos fixos de estilo e vincula cada categoria à sua imagem âncora. O script envia a âncora como *style reference* / *image-to-image* em todas as chamadas de API.
3. **Cache por Hash de Prompt:** O script salva o hash SHA-256 do prompt + versão da âncora em `art-source/.cache.json`. Se um asset já existe e seu prompt não mudou, o script pula a geração (custo zero de API ao rodar novamente).

Exemplo de `scripts/assets-manifest.json`:
```json
{
  "presets": {
    "enemy_medallion": {
      "anchor": "art-source/anchors/medallion_anchor.png",
      "atlas": "enemies",
      "size": 256,
      "circularMask": true,
      "removeBg": true,
      "suffix": "dark fantasy 2D game asset, stylized hand-painted illustration, clean bold silhouette, rich forged metal and stone textures, dramatic top-down lighting, no outer glow, isolated on pure flat white background, centered, no text, no numbers, no UI"
    },
    "boss_medallion": {
      "anchor": "art-source/anchors/medallion_anchor.png",
      "atlas": "enemies",
      "size": 384,
      "circularMask": false,
      "removeBg": true,
      "suffix": "ornate boss circular medallion token, dark fantasy 2D game asset, stylized hand-painted illustration, thick carved gold and obsidian rim, dramatic top-down lighting, no outer glow, isolated on pure flat white background, centered, no text, no numbers, no UI"
    },
    "skill_icon": {
      "anchor": "art-source/anchors/icon_anchor.png",
      "atlas": "icons",
      "size": 128,
      "circularMask": false,
      "removeBg": true,
      "suffix": "RPG skill icon, stylized hand-painted dark fantasy 2D game icon, high contrast, crisp readable silhouette, no frame, no outer glow, isolated on pure flat white background, centered, no text"
    },
    "floor_tile": {
      "anchor": null,
      "atlas": null,
      "outputDir": "public/assets/tiles",
      "size": 512,
      "circularMask": false,
      "removeBg": false,
      "suffix": "top-down seamless tileable 2D dungeon floor texture, low contrast dark tones, flat lighting, no characters, no UI"
    }
  },
  "items": [
    {
      "key": "enemy_goblin",
      "preset": "enemy_medallion",
      "prompt": "Circular bronze monster medallion token, angry armored goblin warrior bust inside a round forged iron rim, dark obsidian inner background, glowing amber eyes"
    },
    {
      "key": "enemy_shield",
      "preset": "enemy_medallion",
      "prompt": "Circular steel monster medallion token, heavy dark knight helmet bust inside a thick silver iron rim, glowing cyan visor slit, battle-worn metal plate"
    },
    {
      "key": "boss_obsidian",
      "preset": "boss_medallion",
      "prompt": "Horned obsidian demon lord bust inside a thick carved gold and crimson circular rim, curved golden horns protruding slightly from the top rim, fiery eyes"
    },
    {
      "key": "icon_chain_lightning",
      "preset": "skill_icon",
      "prompt": "Crackling cyan arcane lightning orb surrounded by dark iron runic rings"
    },
    {
      "key": "floor_crypt",
      "preset": "floor_tile",
      "prompt": "Dark obsidian dungeon stone floor tiles with subtle carved ancient runes, deep navy and charcoal palette #0D1020"
    }
  ]
}
```

### 8.4 Etapa 2 — Geração Automatizada (`scripts/generate-assets.mjs`)
* **Provedor Pluggable:** Suporte modular a APIs de geração (ex.: **Gemini Imagen / Gemini Image Generation**, **Flux Pro / Flux Kontext** via fal.ai/Replicate, ou **OpenAI `gpt-image-1`**), configurável via variável `.env` (`IMAGE_PROVIDER=gemini|flux|openai`).
* **Fundo Chroma Dinâmico:** Se o objeto contiver gelo, neve ou branco dominante, o manifesto aceita `"bgColor": "magenta"` (trocando o fundo do prompt para `#FF00FF` para recorte sem perda nas bordas claras).
* **Geração em Grade para Ícones (Opcional):** Para reduzir custo de API em lotes grandes de equipamentos/perks, o script suporta modo `grid: "2x2"` (gera $4$ ícones numa única chamada com iluminação idêntica e fatia automaticamente em $4$ arquivos com `sharp`).
* **Controle de Qualidade (Human-in-the-Loop Rápido):** Ao final da execução, o script gera um arquivo `art-source/preview.html` local listando os novos assets sobre o fundo escuro `#0D1020` real da arena. Se algum sprite não agradar, basta rodar `npm run assets:gen -- --only=enemy_goblin --force`.

### 8.5 Etapa 3 — Remoção de Fundo Local (`scripts/remove-bg.py`)
* Utiliza `rembg` (modelo `birefnet-general` ou `isnet-general-use`, gratuito e 100% local, sem custo por imagem).
* Percorre `art-source/raw/` de forma incremental e salva em `art-source/cut/` apenas arquivos novos ou alterados.
* Aplica *alpha matting* suave para remover qualquer halo branco residual nas bordas escuras dos medalhões.

### 8.6 Etapa 4 — Padronização e Atlas (`scripts/build-assets.mjs`)
Script Node.js utilizando **`sharp`** e **`free-tex-packer-core`**:
1. **Trim e Centralização:** Executa `.trim()` para remover bordas transparentes irregulares e recoloca o sprite exatamente no centro geométrico do quadro com *padding* uniforme ($4\%$ de margem interna). Isso assegura que o centro visual coincida exatamente com o $(x, y)$ da hitbox circular na física.
2. **Máscara Circular Automática (`circularMask: true`):** Para todos os medalhões de inimigos comuns, aplica-se um recorte SVG circular (`dest-in`) no `sharp`, garantindo contorno matematicamente circular e $0\%$ de serrilhado. Chefes com chifres saindo da moldura usam `circularMask: false`.
3. **Resoluções de Produção (Otimizadas para Retina $2\times$):**
   * Medalhões comuns: $256 \times 256\text{ px}$
   * Chefes e Mini-chefes: $384 \times 384\text{ px}$
   * Obstáculos (Bumpers/Pilares): $192 \times 192\text{ px}$
   * Ícones de Perks/Equipamentos: $128 \times 128\text{ px}$
   * Textura *tileable* de chão: $512 \times 512\text{ px}$
4. **Texture Atlas (Phaser 3 JSON Hash):** Agrupa todos os sprites de mesma categoria em uma única folha (`enemies.webp` + `enemies.json`, `icons.webp` + `icons.json`) com `extrude: 2` (evita sangramento de pixels em WebGL) e compressão **WebP qualidade $84$**.
   * **Impacto de Performance:** Reduz ~25 requisições HTTP individuais para apenas $2$ arquivos de atlas pesando juntos menos de $450\text{ KB}$.

### 8.7 Comandos NPM da Esteira
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "assets:gen": "node scripts/generate-assets.mjs",
    "assets:cut": "python3 scripts/remove-bg.py",
    "assets:pack": "node scripts/build-assets.mjs",
    "assets:all": "npm run assets:gen && npm run assets:cut && npm run assets:pack",
    "mobile:sync": "npm run build && npx cap sync"
  }
}
```

### 8.8 Fluxo de Expansão de Conteúdo (Exemplo: Novo Inimigo em 3 Minutos)
1. Adicionar entrada do prompt no `scripts/assets-manifest.json` (ex.: `enemy_vampire`).
2. Rodar `npm run assets:all` $\to$ imagem gerada com a âncora, recortada, mascarada em círculo e empacotada em `enemies.webp`.
3. Adicionar stats e comportamentos em `src/data/enemies.json` e incluir o peso dele em `src/data/chapters.json`.
4. Abrir `npm run dev` $\to$ inimigo já aparece jogável na arena sem alterar uma linha do motor.

### 8.9 Lista Inicial de Assets do Capítulo 1 ($23$ Imagens Totais)
* **Cenário ($2$):** `floor_crypt` (chão tileable), `wall_trim_crypt` (moldura lateral com suportes de tocha).
* **Inimigos & Chefes ($9$):** `enemy_goblin`, `enemy_shield`, `enemy_shooter`, `enemy_bomb`, `enemy_splitter`, `enemy_mini`, `enemy_healer`, `miniboss_iron`, `boss_obsidian`.
* **Obstáculos ($2$):** `obstacle_bumper_rune`, `obstacle_pillar_obsidian`.
* **Ícones de Perks & Talentos ($10$ a $15$):** `icon_chain_lightning`, `icon_bumper_shock`, `icon_fire_splash`, `icon_ignite`, `icon_supernova`, `icon_ghost_ball`, `icon_ricochet_crit`, `icon_wall_clone`, `icon_extra_orb`, `icon_power_surge`, `icon_bastion_heal`, `icon_gold_greed`.

---

## 9. Roadmap de Produção e KPIs de Validação

### 9.1 Marcos de Desenvolvimento (Milestones)

| Fase | Escopo Principal | Critério de Conclusão |
| :--- | :--- | :--- |
| **Fase 0 — Prototipação** *(Concluída)* | Validação da mecânica de estilingue, escolha do tema *Obsidian Arcane* e Vertical Slice HTML v0.1 jogável. | Loop central divertido e validado com uma mão no celular. |
| **Fase 1 — Fundação & Pipeline IA** *(Semanas 1–2)* | Setup Vite + TypeScript + Phaser 3; portar `PhysicsEngine` puro com testes unitários; implementar scripts `generate-assets.mjs`, `remove-bg.py` e `build-assets.mjs`. | Capítulo 1 rodando a $60\text{ FPS}$ em WebGL com sprites gerados pela esteira em atlas WebP. |
| **Fase 2 — MVP Web (Soft Launch)** *(Semanas 3–4)* | Polimento de *game feel* (partículas aditivas, áudio `.m4a`/`.ogg` com pitch dinâmico, haptics), `localForage`, balanceamento fino das 15 ondas e publicação web (Itch.io / Netlify / portais web). | Build final $< 4\text{ MB}$, carregamento $< 2\text{ s}$ em 4G e testes com jogadores reais. |
| **Fase 3 — Retenção & Conteúdo** *(Semanas 5–7)* | Sistema de Equipamentos (6 slots + raridades + fusão 3-para-1), Capítulos 2 e 3 (Forja Abissal e Santuário Espectral), Portais Gêmeos e Desafio Diário. | Meta-progressão sustentando múltiplas sessões diárias. |
| **Fase 4 — Mobile Nativo & Escala** *(Semanas 8–10)* | Empacotamento Capacitor.js (iOS/Android), integração AdMob (anúncios recompensados opcionais), IAPs cosméticos e Supabase (Cloud Save + Ranking Diário). | Submissão aprovada na Google Play e App Store. |

### 9.2 KPIs Alvo de Qualidade e Retenção
* **Performance Técnica:** $60\text{ FPS}$ estáveis com $28$ orbes e partículas ativas em dispositivos intermediários; tempo de *First Interactive* $< 2.0\text{ s}$ na web mobile.
* **Engajamento (Soft Launch):**
  * Taxa de conclusão da 1ª partida (até morte ou vitória): $> 70\%$.
  * Duração média da sessão: $5$ a $9$ minutos.
  * Retenção Dia 1 (D1): $\ge 35\%$ | Retenção Dia 7 (D7): $\ge 12\%$.
* **Balanceamento do Capítulo 1:** Jogador novo sem talentos deve alcançar em média as ondas $6$–$8$ na primeira tentativa e conquistar a onda $15$ após $3$ a $5$ runs investindo em Talentos Permanentes.