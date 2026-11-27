# Narrativa — Bíblia do mundo de RuneSling

> Dono: AG06 (Narrativa). Guia de lore para criar itens, inimigos, capítulos e runas (decisão 48). Não vai para o jogo agora (decisões 48 e 53).
> Fonte da verdade: dono > `docs/gdd.md` > `docs/decisoes.md` > este arquivo.
> Marcação: **[proposta]** = nome ou fato novo que ainda precisa de aprovação do dono. O resto só explica o que já existe no GDD e em `src/data/*.json`.

---

## 1. Premissa e tom

**Premissa**
- No fundo do mundo há uma escadaria de masmorras: Cripta, Forja e Santuário. Lá embaixo, algo antigo está acordando.
- Entre a escadaria e o mundo da superfície existe só uma linha de luz: a **Barreira Rúnica**, o selo que a antiga **Ordem** (nome em aberto, §11) ergueu.
- A Ordem acabou. Sobrou um mago, uma funda de runas e uma barreira rachada.
- As criaturas sobem em ondas até a Barreira. O mago lança magias (orbes) para segurá-las, onda após onda.

**Tom:** fantasia sombria, com humor seco. O mundo é perigoso e decadente. O humor vem dos monstros (burros, vaidosos ou mal pagos) e do cansaço do mago, nunca da morte em si.
- *"Os goblins não sabem o que é a Barreira. Sabem que ela brilha, e para um goblin tudo o que brilha é comida."*
- *"O Cultista estudou sete anos de magia proibida para causar 1 de dano. Ele está muito orgulhoso disso."*

**Como orienta conteúdo:** todo conteúdo novo precisa ter (1) uma ameaça real e (2) no máximo uma piada, que vem do comportamento e não de frase de efeito.

---

## 2. O mago

- **Quem é:** o último aprendiz da Ordem. Ele não é o mais forte; é o único que sobrou. Título: em aberto (§11); até lá, "o mago". O nome próprio fica em aberto para o jogador imaginar.
- **Por que luta:** a Barreira é a última coisa que a Ordem deixou. Se ela cair, as masmorras se abrem para a superfície. Ele luta por dever e por teimosia, e só um pouco por coragem.
- **A funda:** um cajado em forma de forquilha que tensiona magia. "Funda" é nome comum (de *sling*) e não depende do título recusado; nome próprio do cajado em aberto (§11). Puxar e soltar é o gesto do jogador (GDD §2).
- **Os orbes:** cada orbe é uma magia condensada, uma porção da vontade do mago, que ricocheteia até se apagar. "Quantidade de orbes" é quantas magias ele sustenta ao mesmo tempo; "ATK" é quanta força cabe em cada uma.
- **A Barreira (HP da base):** é feita de runas e se gasta quando um monstro a toca ou acerta. *Selo Restaurador* (`bastion_heal`) e *Barreira Rúnica* (talento) a reescrevem.
- **Como orienta conteúdo:** talentos e equipamentos são treino ou herança da Ordem; runas do draft são conhecimento recuperado durante a expedição.

---

## 3. Escolas de magia

Cada sinergia de runas é uma escola (decisão 50). Cada escola tem um **eixo mecânico** próprio, e essa separação é a regra mais importante para não sobrepor runas.

### 3.0 Arcana (base) — `extra_orb`, `power_surge`, `bastion_heal`
- **Origem:** a primeira lição da Ordem, magia sem elemento.
- **Filosofia:** "Mais, mais forte, mais tempo."
- **Regra de ouro:** só números puros (orbes, ATK, HP), sem gatilho de evento, sem elemento e repetível. Se a runa tem condição ou efeito visual próprio, ela não é Arcana.
- Nome conforme GDD §4 e decisão 58. Atenção: *Visão Arcana* (`arcane_sight`) é runa **Espectral**, não Arcana; o adjetivo no nome não define a escola.

### 3.1 Elétrica (ciano) — `chain_lightning`, `bumper_shock`, `static_crit`, `storm_orb`
- **Origem:** tempestades presas pela Ordem nos **Bumpers Rúnicos** da Cripta. Os bumpers são para-raios antigos que ainda zumbem.
- **Filosofia:** "Nada acerta um só." A energia sempre busca o próximo alvo.
- **Regra de ouro:** o efeito **salta** (de um alvo para outro, ou de um objeto da arena para os inimigos) ou **marca** alvos para o próximo golpe (*Choque*). Controle e reação em cadeia. Não faz área fixa (isso é Ígnea) nem mexe na trajetória (isso é Espectral).

### 3.2 Ígnea (laranja/magma) — `fire_splash`, `ignite`, `supernova`, `molten_core`
- **Origem:** o magma da **Forja Abissal**, roubado pela Ordem e domado nas runas.
- **Filosofia:** "O que cai queima o vizinho." Força bruta e consequência.
- **Regra de ouro:** dano **em área** ao redor do impacto ou da morte, ou dano **ao longo do tempo** (queimar no fim do turno). Pode dar ATK bruto. Não salta entre alvos nem mexe na trajetória.

### 3.3 Espectral (violeta) — `ghost_ball`, `ricochet_crit`, `wall_clone`, `arcane_sight`
- **Origem:** os mortos do **Santuário Espectral**. A Ordem aprendeu com os fantasmas que o caminho atravessa paredes e se repete.
- **Filosofia:** "O caminho importa mais que o alvo."
- **Regra de ouro:** mexe na **geometria do tiro**: quiques, clones, atravessar, mira e crítico de tabela. Recompensa a mira, não a sorte. Não causa área nem salta entre alvos.

### 3.4 Como nasce uma escola nova
1. Precisa de um **eixo mecânico livre** que as quatro escolas não cobrem (ex.: tempo e lentidão, terreno, sacrifício de HP).
2. Precisa de uma **origem num lugar** do mundo, de preferência o capítulo que a apresenta, e de uma **cor livre** na paleta *Obsidian Arcane* (GDD §6).
3. Começa com **4 runas**, como as outras: uma de impacto/morte, uma de turno, uma de cálculo de dano e uma de aquisição (`onAcquire`).
4. Tem filosofia de uma frase e regra de ouro com um "não faz" explícito.
- Exemplo **[proposta]**: *Escola Glacial* (tempo e lentidão), nascida das *Paredes Destrutíveis* de gelo (GDD §3.4). Ficaria para capítulos 4+ (decisão 51).
- Magias novas de uma escola existente seguem a regra de ouro dela; se não couberem, viram escola nova (decisão 50).

---

## 4. O inimigo maior e por que avançam

- **O inimigo maior:** **o Inimigo Selado** (nome em aberto, §11), algo sem forma, sob a última masmorra, que se alimenta de magia. A Ordem não o matou: selou. A Barreira é a tampa desse selo.
- **Por que as criaturas avançam:** a Barreira é a maior concentração de magia do mundo. O Inimigo Selado chama e as criaturas obedecem, por fome, fé ou medo. Cada uma avança por um motivo, e esse motivo é o gancho de lore dela (ver §6).
- **Os chefes** são os servos mais fortes do Inimigo Selado em cada andar; cada um guarda um pedaço do caminho.
- O Inimigo Selado não aparece nos capítulos 1 a 3. Ele é sentido (sussurros, cultistas, mortos inquietos). O confronto fica para capítulos 4+ (decisão 51).
- **Como orienta conteúdo:** todo inimigo novo precisa de um motivo para subir até a Barreira, ligado ao Inimigo Selado direta ou indiretamente.

---

## 5. Capítulos 1 a 3

Descida em três andares. Cada capítulo **planta** uma pista do próximo.

### Capítulo I — Cripta Obsidiana (`chapter_1`)
- **Lugar:** o túmulo da Ordem, logo abaixo da Barreira. Azul-marinho e ouro, obsidiana e runas que ainda acendem. Bumpers, Pilar de Obsidiana e Anel 2×.
- **História:** os mortos da Ordem estão enterrados aqui com suas relíquias. O Inimigo Selado mandou ocupar a cripta para chegar à Barreira pelo caminho mais curto.
- **Quem manda:** o **Senhor Obsidiana** (`boss_obsidian`), o antigo guardião-mor da Ordem, que se deixou cobrir de obsidiana em troca de não morrer. Ele não esqueceu as runas; só esqueceu de qual lado estava.
- **Mini-chefe:** o **Guardião de Ferro** (`miniboss_iron`), autômato de vigia da Ordem. Ainda segue ordens, só que do novo dono. Por isso usa escudo frontal e convoca goblins "para reforçar a guarda".
- **Pistas:** Golem de Magma (vem da Forja) e Espectro (vem do Santuário).

### Capítulo II — Forja Abissal
- **Lugar:** abaixo da cripta. Carvão e magma, rios de lava e bigornas do tamanho de casas. Zonas de Fogo (GDD §3.4 e §5.3).
- **História:** aqui o magma esfria e vira obsidiana. Foi nesta forja que o Senhor Obsidiana ganhou a armadura, e é daqui que saem os golems. A Ordem roubou daqui o fogo da Escola Ígnea.
- **Quem manda:** o **Titã de Lava**, o ferreiro do Inimigo Selado. Ele forja corpos para quem aceita servir.
- **Novidades:** Golems Blindados (GDD §5.3). Os nomes e ids ainda não existem nos dados.
- **Ligação:** o Titã forjou a casca do Senhor Obsidiana. Vencer o Titã explica de onde veio o chefe do Cap. I.

### Capítulo III — Santuário Espectral
- **Lugar:** o andar mais fundo conhecido. Índigo e violeta, onde as almas deveriam descansar. Portais Gêmeos e inimigos invisíveis por 1 turno (GDD §5.3).
- **História:** a Ordem aprendeu a Escola Espectral com estes mortos. O Inimigo Selado os acordou e agora as almas sobem em vez de descansar.
- **Quem manda:** o **Lich**, o primeiro mestre da Ordem, que fez o selo do Inimigo Selado e foi o primeiro a ceder a ele. Ele sabe onde o Inimigo Selado dorme.
- **Ligação:** os Espectros e Fagulhas da cripta são almas que fugiram daqui. O Lich é a ponte para os capítulos 4+.

### Corrente entre os chefes
Guardião de Ferro (serve ao Senhor) → Senhor Obsidiana (forjado pelo Titã) → Titã de Lava (forja para o Inimigo Selado; recebe as almas que o Lich manda) → Lich (traiu a Ordem e abriu caminho para o Inimigo Selado).

---

## 6. Inimigos do Capítulo 1 — uma linha cada

| id | Nome | Lore (por que sobe até a Barreira) |
| :--- | :--- | :--- |
| `goblin` | Goblin | Saqueador da superfície que desceu atrás das relíquias da cripta e agora sobe atrás da Barreira, porque ela brilha mais. |
| `shield` | Cavaleiro | Antigo soldado da Ordem preso à armadura; o escudo ainda aponta para baixo, onde o juramento mandava proteger, e só as costas ficam abertas. |
| `shooter` | Cultista | Devoto do Inimigo Selado que ouve sussurros e responde com raios; cada disparo é uma oração mal pronunciada. |
| `bomb` | Golem de Magma | Peça defeituosa da Forja Abissal, mandada para cima; transborda quando quebra, e por isso explode. |
| `splitter` | Espectro | Alma fugida do Santuário que não aguenta ser ferida inteira e se parte em duas. |
| `mini` | Fagulha | Metade de um Espectro: pequena, frágil e brava por ser só metade; corre para a Barreira antes que alguém note. |
| `healer` | Clérigo Sombrio | Sacerdote da cripta que trocou de deus e manteve as bênçãos; cura qualquer um, desde que esteja do lado errado. |
| `miniboss_iron` | Guardião de Ferro | Autômato de vigia da Ordem que obedece a quem tem a chave, e quem tem a chave agora é o Senhor Obsidiana. |
| `boss_obsidian` | Senhor Obsidiana | Guardião-mor da Ordem que trocou a morte por uma casca de obsidiana e manda reforços sem parar porque tem medo de ficar sozinho. |

---

## 7. Equipamentos e fusão (gancho para o M8)

- **De onde vêm:** são **relíquias** dos mortos da Ordem, espalhadas pelos capítulos. Os 6 slots (GDD §5.2) são o kit de um mago da Ordem: Cajado, Orbe, Anel, Amuleto, Capa e Botas.
- **Por que fundir 3 em 1:** cada relíquia guarda um **eco** do dono. Três ecos do mesmo item lembram juntos uma lição completa. Por isso a fusão destrava um traço passivo (ex.: o Cajado Épico "lembra" *Tabela Letal*).
- **Raridades (o quanto o item lembra):**
  - Comum (cinza): ferramenta de aprendiz, sem memória.
  - Raro (ciano): lembra uma técnica.
  - Épico (violeta): lembra uma runa (traço passivo de escola).
  - Lendário (ouro): pertenceu a um mestre da Ordem com nome próprio [proposta: nomes no M8].
- **Como orienta conteúdo:** todo traço passivo de equipamento deve citar uma escola (§3) ou a Arcana. Itens lendários devem ter um dono histórico ligado a um capítulo.

---

## 8. Glossário oficial

| Termo | Significado | id |
| :--- | :--- | :--- |
| Mago | O herói, último aprendiz da Ordem (título em aberto, §11) | — |
| Funda | O cajado-forquilha que lança os orbes (nome comum) | — |
| Orbe | Uma magia condensada lançada pela funda | — |
| Barreira Rúnica | Selo que protege a superfície; o HP da base | — |
| Runa | Magia recuperada no Draft; pertence a uma escola | `perks.json` |
| Escola de magia | Sinergia de runas: Arcana (base), Elétrica, Ígnea, Espectral | — |
| Choque | Marca elétrica que aumenta o dano recebido no turno | — |
| Queimadura | Dano ígneo no fim do turno (*Chama Persistente*) | `ignite` |
| Clone | Cópia temporária de orbe (70% do dano) | — |
| Bumper Rúnico | Para-raios antigo da Ordem que acelera o orbe | — |
| Pilar de Obsidiana | Bloco de escuridão solidificada na arena | — |
| Anel Multiplicador | Portal da Ordem que duplica um orbe | — |
| Relíquia | Equipamento herdado da Ordem; recompensa da onda 7 | — |
| Eco | A memória guardada numa relíquia; base da fusão | — |
| Expedição / run | Uma descida de 15 ondas num capítulo | — |
| A Ordem | A ordem extinta de magos que ergueu a Barreira (nome em aberto, §11) | — |
| O Inimigo Selado | O inimigo maior, selado sob as masmorras (nome em aberto, §11) | — |
| Cripta Obsidiana | Capítulo I | `chapter_1` |
| Forja Abissal | Capítulo II | — |
| Santuário Espectral | Capítulo III | — |
| Inimigos e runas | Usar os nomes e ids de §6 e de `perks.json` | — |

---

## 9. Início do jogo mais longo (decisão 54)

**Ideia:** antes da obsidiana há a superfície em ruínas por onde o mago desce: o **Bosque das Lápides** (decisão 55), o cemitério-floresta sobre a cripta. Lá vivem monstros "de RPG" que nem sabem do Inimigo Selado, mas sentem a Barreira e ficam nervosos. Cada inimigo novo é a **versão de treino** de um papel do Capítulo 1 (GDD §3.3), para o jogador aprender uma mecânica por vez.

### Inimigos novos [todos proposta]

| id sugerido | Nome | Lore (1 linha) | Papel sugerido (ensina) |
| :--- | :--- | :--- | :--- |
| `slime` | Gosma | Geleia que come musgo, moedas e às vezes botas; sobe porque a Barreira parece um doce. | Pressão básica, HP baixo, anda devagar (pré-`goblin`). |
| `slime_big` | Gosma Grande | Gosma que comeu outras gosmas e se arrependeu. | Divisor: ao morrer gera 2 `slime` (pré-`splitter`). |
| `mushroom` | Cogumelo Esporento | Fungo das lápides que estoura quando é incomodado, e ele é incomodado com facilidade. | Explosivo fraco: esporos em raio pequeno (pré-`bomb`, ensina reação em cadeia). |
| `boar` | Javali de Casca | Javali com uma crosta de pedra na testa; só sabe atacar de frente, e é melhor nisso. | Escudo frontal (pré-`shield`, ensina tabela). |
| `goblin_slinger` | Goblin Fundeiro | Goblin que viu o mago usar uma funda e copiou; mira mal, mas tenta muito. | Atirador com contador de 3 turnos e 1 de dano (pré-`shooter`). |
| `moss_sprite` | Duende do Musgo | Espírito do bosque que cura qualquer coisa que pareça uma planta, e de longe tudo parece. | Curandeiro fraco, cura menor que o `healer` (pré-`healer`). |
| `wolf` | Lobo Cinzento | Lobo faminto que segue o cheiro da magia até a Barreira. | **Corredor** (papel aprovado, decisão 57): avança mais por turno, HP baixo. |
| `miniboss_slime` | Rei Gosma | Gosma Grande que comeu uma coroa e agora se acha rei. | Mini-chefe de treino: divide-se e convoca `slime`. |

**Entrada gradual dos inimigos do Capítulo 1:** cada inimigo atual aparece **depois** do seu par de treino (ex.: `goblin` após `slime`, `shield` após `boar`, `bomb` após `mushroom`, `splitter` após `slime_big`, `shooter` após `goblin_slinger`, `healer` após `moss_sprite`). No máximo um papel novo por fase.

### Estrutura escolhida: Opção B — Capítulo 1 em fases (decisão 56)
- A Cripta ganha 3 fases (runs separadas de 4 a 6 min): **Fase 1 Bosque** (só inimigos novos), **Fase 2 Entrada da Cripta** (mistura, inimigos atuais entrando), **Fase 3 Cripta** (o capítulo atual).
- Mantém capítulo, chefes, paleta e o mesmo arco (descer até o Senhor Obsidiana). Exige "fases" no schema de `chapters.json` e na seleção de capítulo.
- **Nota:** os detalhes mudam no marco de criação de capítulos.
- *Descartada:* Opção A (Capítulo 0 próprio antes do 1).

---

## 10. Guia de expansão (checklists)

**Inimigo novo**
- [ ] Tem um papel mecânico claro (GDD §3.3) ou um papel novo aprovado pelo dono.
- [ ] Tem um motivo para subir até a Barreira, ligado ao Inimigo Selado direta ou indiretamente (§4).
- [ ] Pertence a um capítulo e combina com a paleta dele; se vier de outro andar, a lore explica (como o Golem de Magma).
- [ ] O nome é curto e pt-BR, o id é em inglês e único em `enemies.json`, e entra no glossário.
- [ ] Lore de uma linha, com no máximo uma piada vinda do comportamento.

**Capítulo novo**
- [ ] Um andar com lugar, paleta, quem manda e uma mecânica de arena nova.
- [ ] Planta pista do próximo capítulo e explica algo do anterior.
- [ ] Mini-chefe que serve ao chefe; chefe que serve ao Inimigo Selado.
- [ ] Capítulos 4+ só depois de decisão do dono (decisão 51).

**Chefe**
- [ ] Tem história própria (quem era antes, o que trocou para servir ao Inimigo Selado).
- [ ] A mecânica reflete a história (ex.: medo de ficar sozinho → invoca reforços).
- [ ] Liga-se a pelo menos um chefe de outro capítulo.

**Escola ou magia (runa)**
- [ ] Magia nova: respeita a regra de ouro e o "não faz" da escola (§3).
- [ ] Escola nova: eixo livre, origem num lugar, cor livre e 4 runas (§3.4).
- [ ] O nome da runa evoca o efeito; o id é em inglês e único em `perks.json`.

**Equipamento**
- [ ] É relíquia da Ordem e cabe num dos 6 slots (GDD §5.2).
- [ ] O traço passivo cita uma escola ou a Arcana.
- [ ] Lendário tem dono histórico ligado a um capítulo.

**Texto no jogo:** só com briefing e pelo módulo de strings (decisão 53).

---

## 11. Nomes em aberto (decisão 55)

Recusados: "Ordem da Funda", "Funda-Runas" e "A Fome Abaixo". Até o dono escolher, o texto usa "a Ordem", "o mago" e "o Inimigo Selado".

**A ordem de magos**
1. **Ordem do Selo** — sóbrio e diz o que ela fez; combina com a Barreira e com a decadência.
2. **Círculo Obsidiano** — liga a ordem à Cripta e ao *Obsidian Arcane*; soa antigo e um pouco sinistro.
3. **Guardiões da Runa** — direto e de RPG; a pompa abre espaço para o humor do único que sobrou.

**O título do herói**
1. **Nenhum título** — "o mago" basta; reforça que ele é só o que sobrou, sem glória.
2. **o Último Aprendiz** — resume a premissa e carrega o humor seco (ainda é aprendiz).
3. **o Guarda-Selo** — título de função, não de heroísmo; combina com dever e teimosia.

**O inimigo maior**
1. **O Inimigo Selado** — neutro e ameaçador por não ter nome; o mistério serve aos capítulos 1 a 3.
2. **A Boca do Fundo** — sem forma e faminta de magia; sombrio e um pouco grotesco.
3. **O Que Dorme** — sentido e não visto; casa com sussurros, cultistas e mortos inquietos.

**O cajado:** "funda" segue como nome comum (de *sling*). Nome próprio, se o dono quiser, fica para o M8 junto dos lendários.
