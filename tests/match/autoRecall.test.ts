import { describe, expect, it } from 'vitest';
import { loadGameData } from '../../src/data/types';
import { Match } from '../../src/match/Match';
import { Rng } from '../../src/match/rng';
import { addEnemy } from '../../src/match/RunState';

const data = loadGameData();

/** Partida na onda 1 com inimigos controlados; orbe único reto para cima (x=180). */
function setup(place: (m: Match) => void): Match {
  const m = new Match(data, 'chapter_1', new Rng(7));
  m.state.enemies.length = 0;
  m.state.orbs = 1;
  place(m);
  return m;
}

function add(m: Match, typeId: string, x: number, y: number, hp: number) {
  const en = addEnemy(m.state, data, typeId, x, y);
  en.hp = hp;
  en.maxHp = hp;
  return en;
}

/** Avança até sair do voo; devolve quantos frames levou e se o orbe ainda se movia no último frame. */
function flyUntilEnd(m: Match, maxFrames = 600) {
  let frames = 0;
  let movingBefore = false;
  while (m.state.phase === 'flight' && frames < maxFrames) {
    movingBefore = !m.engine.isSettled();
    m.step(2);
    frames++;
  }
  return { frames, movingBefore };
}

describe('Recolher automático (decisão 28)', () => {
  it('matar o último inimigo encerra o turno na hora, com orbes ainda em movimento', () => {
    const m = setup((mm) => add(mm, 'goblin', 180, 400, 1));
    m.launch(-Math.PI / 2, 12);
    const { frames, movingBefore } = flyUntilEnd(m);
    expect(m.state.phase).not.toBe('flight');
    expect(frames).toBeLessThan(30);
    expect(movingBefore).toBe(true);
    expect(m.engine.activeCount).toBe(0);
    expect(m.state.kills).toBe(1);
    expect(m.state.turn).toBe(1);
    expect(m.state.wave).toBe(2);
  });

  it('explosão em cadeia (Bomba) matando o último inimigo também encerra o turno', () => {
    const m = setup((mm) => {
      add(mm, 'bomb', 180, 400, 1);
      add(mm, 'goblin', 240, 380, 1); // fora da trajetória, dentro do raio da explosão
    });
    m.launch(-Math.PI / 2, 12);
    const { frames } = flyUntilEnd(m);
    expect(m.state.phase).not.toBe('flight');
    expect(frames).toBeLessThan(30);
    expect(m.state.kills).toBe(2);
  });

  it('com inimigo vivo restante (chefe longe da trajetória) o voo continua', () => {
    const m = setup((mm) => {
      add(mm, 'goblin', 180, 400, 1);
      add(mm, 'miniboss_iron', 40, 60, 9999);
    });
    m.launch(-Math.PI / 2, 12);
    for (let f = 0; f < 30; f++) m.step(2);
    expect(m.state.kills).toBe(1);
    expect(m.state.phase).toBe('flight');
  });

  it('a divisão do Espectro cria inimigos vivos: o voo continua', () => {
    const m = setup((mm) => add(mm, 'splitter', 180, 400, 1));
    m.launch(-Math.PI / 2, 12);
    let f = 0;
    while (m.state.kills === 0 && f < 30) {
      m.step(2);
      f++;
    }
    expect(m.state.kills).toBe(1);
    expect(m.state.enemies.length).toBeGreaterThan(0);
    expect(m.state.phase).toBe('flight');
  });

  it('hasLiveEnemies ignora inimigos com hp ≤ 0 ou marcados como mortos', () => {
    const m = setup((mm) => add(mm, 'goblin', 100, 100, 5));
    expect(m.hasLiveEnemies()).toBe(true);
    m.state.enemies[0]!.dead = true;
    expect(m.hasLiveEnemies()).toBe(false);
  });
});
