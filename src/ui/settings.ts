/**
 * Controles de configuração (T-049, decisão 42): som liga/desliga, volume dos efeitos e
 * "Reduzir movimento". Usados no modal de Pausa e no de Configurações do Menu.
 */
import { REDUCED_MOTION_PREFS, type PlayerSettings, type ReducedMotionPref } from '../meta/profile';
import { el, plate, pressable, setPlateLabel } from './dom';
import { t } from './strings';

export interface SettingsHandlers {
  onToggleSound(): void;
  /** Enquanto arrasta (só aplica no áudio, sem gravar). */
  onVolumeInput(volume: number): void;
  /** Ao soltar: grava e toca a prévia. */
  onVolumeCommit(volume: number): void;
  onReducedMotion(pref: ReducedMotionPref): void;
}

export interface SettingsControls {
  /** Nós na ordem: botão de som e o bloco com volume e movimento. */
  readonly nodes: readonly HTMLElement[];
  update(settings: PlayerSettings): void;
}

const pct = (v: number): number => Math.round(v * 100);

/** `prefix` dá as chaves `data-ui`: `<prefix>-sound`, `<prefix>-volume`, `<prefix>-motion-<pref>`. */
export function createSettingsControls(prefix: string, h: SettingsHandlers): SettingsControls {
  // O som do próprio botão toca depois de religar (ver toggleSound em index.ts).
  const sound = plate('iron', t('pause.soundOn'), () => h.onToggleSound(), {
    attrs: { 'data-ui': `${prefix}-sound`, 'data-sfx': 'none' },
  });

  const value = el('b', { className: 'rs-set-value', attrs: { 'data-ui': `${prefix}-volume-value` } });
  const range = el('input', {
    className: 'rs-range',
    attrs: {
      type: 'range',
      min: '0',
      max: '100',
      step: '5',
      'data-ui': `${prefix}-volume`,
      'aria-label': t('settings.volume'),
    },
  });
  const paint = (v: number): void => {
    range.style.setProperty('--rs-range-fill', `${v}%`);
    value.textContent = t('settings.volumeValue', { pct: v });
    range.setAttribute('aria-valuetext', value.textContent);
  };
  range.addEventListener('input', () => {
    const v = Number(range.value);
    paint(v);
    h.onVolumeInput(v / 100);
  });
  range.addEventListener('change', () => h.onVolumeCommit(Number(range.value) / 100));
  const volume = el('div', { className: 'rs-set-row' }, [
    el('div', { className: 'rs-set-head' }, [el('span', { className: 'rs-set-label', text: t('settings.volume') }), value]),
    el('div', { className: 'rs-range-wrap' }, [range]),
  ]);

  const segs = new Map<ReducedMotionPref, HTMLButtonElement>();
  for (const pref of REDUCED_MOTION_PREFS) {
    const b = el('button', {
      className: 'rs-btn rs-seg',
      text: t(`settings.motion.${pref}`),
      attrs: { type: 'button', 'data-ui': `${prefix}-motion-${pref}`, 'aria-pressed': 'false' },
      onClick: () => h.onReducedMotion(pref),
    });
    segs.set(pref, pressable(b));
  }
  const motion = el('div', { className: 'rs-set-row' }, [
    el('div', { className: 'rs-set-head' }, [el('span', { className: 'rs-set-label', text: t('settings.motion') })]),
    el('div', { className: 'rs-seg-group', attrs: { role: 'group', 'aria-label': t('settings.motion') } }, [...segs.values()]),
  ]);

  const block = el('div', { className: 'rs-set-block' }, [volume, motion]);

  function update(s: PlayerSettings): void {
    setPlateLabel(sound, s.muted ? t('pause.soundOff') : t('pause.soundOn'));
    sound.setAttribute('aria-pressed', String(!s.muted));
    const v = pct(s.sfxVolume);
    if (Number(range.value) !== v) range.value = String(v);
    paint(v);
    for (const [pref, b] of segs) {
      b.setAttribute('aria-pressed', String(pref === s.reducedMotion));
      b.classList.toggle('is-on', pref === s.reducedMotion);
    }
  }

  return { nodes: [sound, block], update };
}
