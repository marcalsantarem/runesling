# BRF-009 — AG01 — T-006 PhysicsEngine puro
**Leia:** `docs/agentes/AG01_Gameplay.md`; `docs/gdd.md` §2.2, §2.3 e §3.4; em `reference/vertical-slice-v0.1.html` as linhas 793–853 (mira) e 953–1097 (física). **Regra:** respostas curtas; sem commit/push/branches.
**Contrato (o AG04 cria os dados em paralelo):** a física **não lê JSON nem importa `src/data/`**. Ela recebe formas puras no mundo 360×520: paredes laterais e teto, `bumpers {x,y,r}`, `pillars {x,y,w,h}` (AABB, canto superior esquerdo), `rings {x,y,r}`, inimigos `{id,x,y,r,frontShield?:{minNormalY}}`. Parâmetros numéricos (sub-passos, amortecimentos, limites) entram por um objeto de configuração com os valores do GDD como padrão.
**Fazer:**
(1) `src/match/rng.ts`: RNG com semente (ex.: mulberry32) injetável. Toda aleatoriedade da física passa por ele.
(2) `src/core/PhysicsEngine.ts`, sem Phaser: orbes (posição, velocidade, flags `bounced`, `temp`, `ringUsed`, `ceilingHit`), `step(speedMultiplier)` com N = 4 sub-passos (2× = 2 ciclos), reflexão só com v·n < 0, colisão círculo × círculo e círculo × AABB, bumper +15% com teto de 15.5, amortecimento γ 0.9935 até 340 ticks e 0.962 depois (γ^(1/N) por sub-passo), anti-loop horizontal, teto de 28 orbes, saída pelo chão encerra o orbe.
(3) Mira: `aimAngle` com trava (−π+0.14 ≤ θ ≤ −0.14), cancelamento abaixo de 14 px, `v0 = 9.5 + min(1, d/120)·3.8`, leque simétrico, e previsão da trajetória com 1 ou 2 quiques.
(4) Escudo frontal: impacto com `n_y > minNormalY` é bloqueado (reflete, sem dano).
(5) A física não calcula dano: emite **eventos** por sub-passo (`wallHit`, `ceilingHit`, `bumperHit`, `pillarHit`, `ringPass` com pedido de clone, `enemyHit {enemyId, ballId, blocked}`, `ballLost`) para o combate (T-007) consumir.
(6) Testes em `tests/match/`: reflexão, sem *tunneling* em velocidade máxima, escudo por cima × por baixo, bumper com teto, amortecimento até parar, travas da mira, determinismo (mesma semente, mesmo resultado) e teto de 28.
**Permitido:** `src/core/PhysicsEngine.ts`, `src/match/` (rng, mira, tipos da física), `tests/match/`. **Proibido:** o resto (inclusive `src/data/`, `src/meta/`, `src/scenes/`, configs).
**Pronto quando:** typecheck e suíte verdes, testes novos contados; o laço de física não aloca objetos por frame.
**Entrega:** até 8 linhas: arquivos, API pública (assinaturas principais), nº de testes, divergências GDD × slice, o que não foi verificado.
