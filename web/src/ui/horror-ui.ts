/**
 * HorrorUI — TypeScript implementation
 *
 * Manages the psychological-horror UI layer: glitch effects, corrupted text,
 * flickering elements, and atmosphere text injection.
 */

const GLITCH_CHARS = '█▓▒░╫╪╬╩╦╣║═╔╗╚╝▄▀■□▪▫◄►▲▼±×÷∞∑∫∂≈≠';

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

export interface HorrorUIOptions {
  glitchIntensity?:    number;
  flickerEnabled?:     boolean;
  corruptTextEnabled?: boolean;
}

export class HorrorUI {
  private container: HTMLElement | null = null;
  private atmosphereEl: HTMLElement | null = null;
  private glitchOverlay: HTMLElement | null = null;

  private running = false;
  private nightmareMode = false;
  private options: Required<HorrorUIOptions>;
  private glitchInterval: ReturnType<typeof setInterval> | null = null;

  private atmoTimer: ReturnType<typeof setTimeout> | null = null;
  private glitchTimer: ReturnType<typeof setTimeout> | null = null;
  private activeTimers: Set<ReturnType<typeof setTimeout>> = new Set();

  constructor(options: HorrorUIOptions = {}) {
    this.options = {
      glitchIntensity:    options.glitchIntensity    ?? 5,
      flickerEnabled:     options.flickerEnabled     ?? true,
      corruptTextEnabled: options.corruptTextEnabled ?? true,
    };
  }

  mount(container: HTMLElement): void {
    this.container = container;

    // 1. Atmosphere text element
    this.atmosphereEl = document.createElement('div');
    this.atmosphereEl.className = 'atmosphere-text';
    this.container.appendChild(this.atmosphereEl);

    // 2. Glitch overlay (already exists in index.html, but let's be sure)
    this.glitchOverlay = document.getElementById('glitch-overlay');
    if (!this.glitchOverlay) {
      this.glitchOverlay = document.createElement('div');
      this.glitchOverlay.id = 'glitch-overlay';
      this.glitchOverlay.className = 'glitch-overlay';
      this.glitchOverlay.setAttribute('aria-hidden', 'true');
      document.body.appendChild(this.glitchOverlay);
    }
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.scheduleAtmosphereText();
    this.scheduleGlitch();
  }

  stop(): void {
    this.running = false;
    this.clearTimers();

    if (this.glitchOverlay) {
      this.glitchOverlay.classList.remove('active');
    }
    document.body.classList.remove('nightmare-active');
  }

  setNightmareMode(active: boolean): void {
    this.nightmareMode = active;
    document.body.classList.toggle('nightmare-active', active);
    // You could also affect data-nightmare-level here if needed,
    // but the original JS just toggled a class.
  }

  setOptions(patch: HorrorUIOptions): void {
    Object.assign(this.options, patch);
  }

  /**
   * Apply a brief screen-flash glitch effect.
   */
  flashGlitch(count = 1): void {
    if (!this.glitchOverlay) return;

    let i = 0;
    const flash = () => {
      if (!this.running || !this.glitchOverlay) return;

      if (i >= count * 2) {
        this.glitchOverlay.classList.remove('active');
        return;
      }

      this.glitchOverlay.classList.toggle('active');
      i++;

      const delay = 40 + HorrorUI._secureRandom() * 80;
      const t = setTimeout(() => {
        this.activeTimers.delete(t);
        flash();
      }, delay);
      this.activeTimers.add(t);
    };

    flash();
  }

  // ---- private ----

  private scheduleAtmosphereText(): void {
    if (!this.running) return;

    const delay = this.nightmareMode
      ? 1500 + HorrorUI._secureRandom() * 2000
      : 4000 + HorrorUI._secureRandom() * 6000;

    this.atmoTimer = setTimeout(() => {
      this.updateAtmosphereText();
      this.scheduleAtmosphereText();
    }, delay);
  }

  private updateAtmosphereText(): void {
    if (!this.atmosphereEl) return;

    const lines = this.nightmareMode ? NIGHTMARE_LINES : ATMOSPHERE_LINES;
    const text = lines[Math.floor(HorrorUI._secureRandom() * lines.length)];

    if (this.options.corruptTextEnabled && this.nightmareMode) {
      this.atmosphereEl.textContent = HorrorUI.corruptText(text, 0.15);
    } else {
      this.atmosphereEl.textContent = text;
    }
  }

  private scheduleGlitch(): void {
    if (!this.running) return;

    const { glitchIntensity } = this.options;
    const minDelay = this.nightmareMode ? 800  : 3000;
    const maxDelay = this.nightmareMode ? 4000 : 15000;

    // Higher intensity = lower factor = more frequent glitches
    const factor = 1 + (10 - glitchIntensity) * 0.5;
    const delay = (minDelay + HorrorUI._secureRandom() * (maxDelay - minDelay)) * factor;

    this.glitchTimer = setTimeout(() => {
      const flashCount = this.nightmareMode
        ? 2 + Math.floor(HorrorUI._secureRandom() * 4)
        : 1 + Math.floor(HorrorUI._secureRandom() * 2);

      this.flashGlitch(flashCount);
      this.scheduleGlitch();
    }, delay);
  }

  private clearTimers(): void {
    if (this.atmoTimer) {
      clearTimeout(this.atmoTimer);
      this.atmoTimer = null;
    }
    if (this.glitchTimer) {
      clearTimeout(this.glitchTimer);
      this.glitchTimer = null;
    }
    this.activeTimers.forEach(t => clearTimeout(t));
    this.activeTimers.clear();
  }

  /**
   * Cryptographically secure random replacement for Math.random().
   * Returns a float between 0 (inclusive) and 1 (exclusive).
   */
  private static _secureRandom(): number {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  }

  /**
   * Corrupt a string by randomly replacing characters.
   */
  static corruptText(text: string, ratio = 0.15): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === ' ' || HorrorUI._secureRandom() >= ratio) {
        result += ch;
      } else {
        result += GLITCH_CHARS[Math.floor(HorrorUI._secureRandom() * GLITCH_CHARS.length)];
      }
    }
    return result;
  }
}
