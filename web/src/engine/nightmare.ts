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
} as const);

export const NIGHTMARE_LEVEL_NAMES = ['DORMANT', 'AWAKENING', 'DREAD', 'TERROR', 'ABYSS'] as const;

export type NightmareLevelValue = typeof NightmareLevel[keyof typeof NightmareLevel];
export type NightmareLevelName = typeof NIGHTMARE_LEVEL_NAMES[number];

export interface NightmareEventMap {
  activate: { level: number };
  deactivate: Record<string, never>;
  levelchange: { level: number; previous: number; name: NightmareLevelName };
}

export type NightmareEventName = keyof NightmareEventMap;

export interface NightmareEngineOptions {
  escalationInterval?: number;
}

export interface AtmosphericOptions {
  particleCount: number;
  fogSpeed: number;
  opacity: number;
}

export class NightmareEngine {
  private _level: NightmareLevelValue = NightmareLevel.DORMANT;
  private _active = false;
  private _escalationInterval: number;
  private _escalationTimer: ReturnType<typeof setTimeout> | null = null;
  private _listeners: Record<string, Array<(data: unknown) => void>> = {};

  /**
   * @param options.escalationInterval - ms between auto-escalations (default: 20000)
   */
  constructor(options: NightmareEngineOptions = {}) {
    this._escalationInterval = options.escalationInterval ?? 20000;
  }

  /** Current nightmare level (0–4). */
  get level(): NightmareLevelValue {
    return this._level;
  }

  /** Whether nightmare mode is active. */
  get isActive(): boolean {
    return this._active;
  }

  /** Human-readable level name. */
  get levelName(): NightmareLevelName {
    return NIGHTMARE_LEVEL_NAMES[this._level];
  }

  /**
   * Activate nightmare mode.
   * Begins at AWAKENING and auto-escalates over time.
   */
  activate(): this {
    if (this._active) return this;
    this._active = true;
    this._setLevel(NightmareLevel.AWAKENING);
    this._scheduleEscalation();
    this._emit('activate', { level: this._level });
    return this;
  }

  /** Deactivate nightmare mode and reset to DORMANT. */
  deactivate(): this {
    this._active = false;
    this._clearEscalation();
    this._setLevel(NightmareLevel.DORMANT);
    this._emit('deactivate', {});
    return this;
  }

  /** Toggle nightmare mode. Returns new active state. */
  toggle(): boolean {
    this._active ? this.deactivate() : this.activate();
    return this._active;
  }

  /**
   * Manually set level (clamps to valid range).
   */
  setLevel(level: number): this {
    if (!Number.isFinite(level)) {
      level = NightmareLevel.DORMANT;
    }
    const clamped = Math.max(NightmareLevel.DORMANT, Math.min(NightmareLevel.ABYSS, level));
    this._setLevel(clamped as NightmareLevelValue);
    return this;
  }

  /**
   * Register an event listener.
   */
  on<K extends NightmareEventName>(event: K, fn: (data: NightmareEventMap[K]) => void): this {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn as (data: unknown) => void);
    return this;
  }

  /**
   * Remove an event listener.
   */
  off<K extends NightmareEventName>(event: K, fn: (data: NightmareEventMap[K]) => void): this {
    if (!this._listeners[event]) return this;
    this._listeners[event] = this._listeners[event].filter(f => f !== fn);
    return this;
  }

  /** Clean up timers. */
  destroy(): void {
    this._clearEscalation();
    this._listeners = {};
  }

  /**
   * CSS variable values to apply for the current intensity.
   */
  getCSSVars(): Record<string, string> {
    const t = this._level / NightmareLevel.ABYSS; // 0 – 1
    return {
      '--nightmare-intensity': String(t),
      '--glitch-intensity':    String(1 + t * 4),
    };
  }

  /**
   * Atmospheric engine options for the current level.
   */
  getAtmosphericOptions(): AtmosphericOptions {
    const configs: AtmosphericOptions[] = [
      { particleCount: 150, fogSpeed: 3,  opacity: 0.7 },
      { particleCount: 200, fogSpeed: 5,  opacity: 0.8 },
      { particleCount: 280, fogSpeed: 6,  opacity: 0.85 },
      { particleCount: 380, fogSpeed: 8,  opacity: 0.9 },
      { particleCount: 500, fogSpeed: 10, opacity: 1.0 },
    ];
    return configs[this._level];
  }

  // ---- private ----

  private _setLevel(level: NightmareLevelValue): void {
    const previous = this._level;
    this._level = level;
    if (previous !== level) {
      this._emit('levelchange', { level, previous, name: this.levelName });
    }
  }

  private _scheduleEscalation(): void {
    this._clearEscalation();
    if (this._level < NightmareLevel.ABYSS) {
      this._escalationTimer = setTimeout(() => {
        if (!this._active) return;
        this._setLevel(Math.min(this._level + 1, NightmareLevel.ABYSS) as NightmareLevelValue);
        this._scheduleEscalation();
      }, this._escalationInterval);
    }
  }

  private _clearEscalation(): void {
    if (this._escalationTimer !== null) {
      clearTimeout(this._escalationTimer);
      this._escalationTimer = null;
    }
  }

  private _emit(event: string, data: unknown): void {
    const handlers = this._listeners[event];
    if (!handlers) return;
    for (const fn of handlers) {
      try {
        fn(data);
      } catch (err) {
        console.error(`[NightmareEngine] handler error for "${event}":`, err);
      }
    }
  }
}
