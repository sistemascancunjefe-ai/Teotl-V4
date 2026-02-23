/**
 * TEOTL V4 — Nightmare Mode Engine
 * Controls nightmare intensity levels and applies escalating horror effects.
 */

/** Intensity levels mapped to descriptive states. */
export const NightmareLevel = Object.freeze({
  DORMANT:   0,
  AWAKENING: 1,
  DREAD:     2,
  TERROR:    3,
  ABYSS:     4,
});

export const NIGHTMARE_LEVEL_NAMES = ['DORMANT', 'AWAKENING', 'DREAD', 'TERROR', 'ABYSS'];

export class NightmareEngine {
  /**
   * @param {object} [options]
   * @param {number} [options.escalationInterval=20000] ms between auto-escalations
   */
  constructor(options = {}) {
    this._level              = NightmareLevel.DORMANT;
    this._active             = false;
    this._escalationInterval = options.escalationInterval ?? 20000;
    this._escalationTimer    = null;
    this._listeners          = {};
  }

  /** Current nightmare level (0–4). */
  get level() { return this._level; }

  /** Whether nightmare mode is active. */
  get isActive() { return this._active; }

  /** Human-readable level name. */
  get levelName() { return NIGHTMARE_LEVEL_NAMES[this._level]; }

  /**
   * Activate nightmare mode.
   * Begins at AWAKENING and auto-escalates over time.
   */
  activate() {
    if (this._active) return;
    this._active = true;
    this._setLevel(NightmareLevel.AWAKENING);
    this._scheduleEscalation();
    this._emit('activate', { level: this._level });
    return this;
  }

  /** Deactivate nightmare mode and reset to DORMANT. */
  deactivate() {
    this._active = false;
    this._clearEscalation();
    this._setLevel(NightmareLevel.DORMANT);
    this._emit('deactivate', {});
    return this;
  }

  /** Toggle nightmare mode. Returns new active state. */
  toggle() {
    this._active ? this.deactivate() : this.activate();
    return this._active;
  }

  /**
   * Manually set level (clamps to valid range).
   * @param {number} level
   */
  setLevel(level) {
    const clamped = Math.max(NightmareLevel.DORMANT, Math.min(NightmareLevel.ABYSS, level));
    this._setLevel(clamped);
    return this;
  }

  /**
   * Register an event listener.
   * @param {'activate'|'deactivate'|'levelchange'} event
   * @param {function} fn
   */
  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
    return this;
  }

  /**
   * Remove an event listener.
   * @param {string} event
   * @param {function} fn
   */
  off(event, fn) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(f => f !== fn);
    return this;
  }

  /** Clean up timers. */
  destroy() {
    this._clearEscalation();
    this._listeners = {};
  }

  /**
   * CSS variable values to apply for the current intensity.
   * @returns {Record<string, string>}
   */
  getCSSVars() {
    const t = this._level / NightmareLevel.ABYSS; // 0 – 1
    return {
      '--nightmare-intensity': String(t),
      '--glitch-intensity':    String(1 + t * 4),
    };
  }

  /**
   * Atmospheric engine options for the current level.
   * @returns {object}
   */
  getAtmosphericOptions() {
    const configs = [
      { particleCount: 150, fogSpeed: 3,  opacity: 0.7 },
      { particleCount: 200, fogSpeed: 5,  opacity: 0.8 },
      { particleCount: 280, fogSpeed: 6,  opacity: 0.85 },
      { particleCount: 380, fogSpeed: 8,  opacity: 0.9 },
      { particleCount: 500, fogSpeed: 10, opacity: 1.0 },
    ];
    return configs[this._level];
  }

  // ---- private ----

  _setLevel(level) {
    const previous = this._level;
    this._level = level;
    if (previous !== level) {
      this._emit('levelchange', { level, previous, name: this.levelName });
    }
  }

  _scheduleEscalation() {
    this._clearEscalation();
    if (this._level < NightmareLevel.ABYSS) {
      this._escalationTimer = setTimeout(() => {
        if (!this._active) return;
        this._setLevel(Math.min(this._level + 1, NightmareLevel.ABYSS));
        this._scheduleEscalation();
      }, this._escalationInterval);
    }
  }

  _clearEscalation() {
    if (this._escalationTimer !== null) {
      clearTimeout(this._escalationTimer);
      this._escalationTimer = null;
    }
  }

  _emit(event, data) {
    const handlers = this._listeners[event];
    if (!handlers) return;
    for (const fn of handlers) {
      try { fn(data); } catch (err) { console.error(`[NightmareEngine] handler error for "${event}":`, err); }
    }
  }
}
