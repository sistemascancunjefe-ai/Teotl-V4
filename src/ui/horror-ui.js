/**
 * TEOTL V4 — Horror UI Engine
 * Psychological horror effects: glitch, text corruption, distortion, paranoia.
 */

/** Glitch character set for text corruption. */
const GLITCH_CHARS = '█▓▒░╫╪╬╩╦╣║═╔╗╚╝▄▀■□▪▫◄►▲▼±×÷∞∑∫∂≈≠';

/** Atmospheric horror phrases for the experience screen. */
const ATMOSPHERE_LINES = [
  'El vacío te observa.',
  'No estás solo.',
  'Algo se mueve en la oscuridad.',
  'El ruido aumenta.',
  'No puedes escapar.',
  'Recuerda por qué viniste.',
  'El sistema te conoce.',
  'Tu presencia ha sido detectada.',
  'La entidad se aproxima.',
  'El tiempo no existe aquí.',
  'Todo lo que ves es una trampa.',
  'Respira. Si puedes.',
];

const NIGHTMARE_LINES = [
  'NO HAY SALIDA.',
  'TE VEO.',
  'TEOTL TE CONSUME.',
  '▓▓▓▓▓▓▓▓▓',
  'ERROR: REALIDAD CORRUPTA',
  'SISTEMA: MODO ABISMO ACTIVO',
  'TU MENTE ES NUESTRA.',
  '░░░CORRUPCIÓN TOTAL░░░',
];

export class HorrorUI {
  /**
   * @param {object} [options]
   * @param {boolean} [options.flickerEnabled=true]
   * @param {boolean} [options.corruptTextEnabled=true]
   * @param {number}  [options.glitchIntensity=5]
   */
  constructor(options = {}) {
    this._options = {
      flickerEnabled:    options.flickerEnabled    ?? true,
      corruptTextEnabled: options.corruptTextEnabled ?? true,
      glitchIntensity:   options.glitchIntensity   ?? 5,
    };
    this._nightmareMode  = false;
    this._timers         = [];
    this._atmoTimer      = null;
    this._glitchTimer    = null;
    this._atmoEl         = null;
    this._glitchOverlay  = null;
    this._screenEl       = null;
  }

  /**
   * Mount UI effects to DOM elements.
   * @param {object} elements
   * @param {HTMLElement} elements.atmosphereText
   * @param {HTMLElement} elements.glitchOverlay
   * @param {HTMLElement} elements.screen
   */
  mount(elements) {
    this._atmoEl        = elements.atmosphereText  ?? null;
    this._glitchOverlay = elements.glitchOverlay   ?? null;
    this._screenEl      = elements.screen          ?? null;
    return this;
  }

  /** Start all active UI effects. */
  start() {
    this._scheduleAtmosphereText();
    this._scheduleGlitch();
    return this;
  }

  /** Stop all UI effects. */
  stop() {
    for (const t of this._timers) clearTimeout(t);
    this._timers = [];
    if (this._atmoTimer)   { clearTimeout(this._atmoTimer);   this._atmoTimer = null; }
    if (this._glitchTimer) { clearTimeout(this._glitchTimer); this._glitchTimer = null; }
    return this;
  }

  /**
   * Update options at runtime.
   * @param {object} opts
   */
  setOptions(opts) {
    Object.assign(this._options, opts);
  }

  /** Escalate effects for nightmare mode. */
  setNightmareMode(active) {
    this._nightmareMode = active;
    if (this._screenEl) {
      document.body.classList.toggle('nightmare-active', active);
    }
  }

  /**
   * Corrupt a string by randomly replacing characters.
   * @param {string} text
   * @param {number} ratio  0 – 1
   * @returns {string}
   */
  static corruptText(text, ratio = 0.15) {
    return text.split('').map(ch => {
      if (ch === ' ') return ch;
      return Math.random() < ratio
        ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        : ch;
    }).join('');
  }

  /**
   * Apply a brief screen-flash glitch effect.
   * @param {number} [count=1]
   */
  flashGlitch(count = 1) {
    if (!this._glitchOverlay) return;
    let i = 0;
    const flash = () => {
      if (i >= count * 2) {
        this._glitchOverlay.classList.remove('active');
        return;
      }
      this._glitchOverlay.classList.toggle('active');
      i++;
      const t = setTimeout(flash, 40 + Math.random() * 80);
      this._timers.push(t);
    };
    flash();
  }

  // ---- private ----

  _scheduleAtmosphereText() {
    if (!this._atmoEl) return;
    const delay = this._nightmareMode
      ? 1500 + Math.random() * 2000
      : 4000  + Math.random() * 6000;

    this._atmoTimer = setTimeout(() => {
      this._updateAtmosphereText();
      this._scheduleAtmosphereText();
    }, delay);
  }

  _updateAtmosphereText() {
    if (!this._atmoEl) return;
    const lines = this._nightmareMode ? NIGHTMARE_LINES : ATMOSPHERE_LINES;
    const text  = lines[Math.floor(Math.random() * lines.length)];

    if (this._options.corruptTextEnabled && this._nightmareMode) {
      this._atmoEl.textContent = HorrorUI.corruptText(text, 0.1);
    } else {
      this._atmoEl.textContent = text;
    }
  }

  _scheduleGlitch() {
    const { glitchIntensity } = this._options;
    const minDelay = this._nightmareMode ? 800  : 3000;
    const maxDelay = this._nightmareMode ? 4000 : 15000;
    const factor   = 1 + (10 - glitchIntensity) * 0.5;
    const delay    = (minDelay + Math.random() * (maxDelay - minDelay)) * factor;

    this._glitchTimer = setTimeout(() => {
      const flashCount = this._nightmareMode
        ? 2 + Math.floor(Math.random() * 4)
        : 1 + Math.floor(Math.random() * 2);
      this.flashGlitch(flashCount);
      this._scheduleGlitch();
    }, delay);
  }
}
