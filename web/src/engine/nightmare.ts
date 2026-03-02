/**
 * NightmareEngine — TypeScript placeholder
 *
 * Controls nightmare-mode escalation, CSS variables, and atmospheric parameters.
 * Event emission follows the existing JS engine contract so the UI layer
 * remains stable while this module evolves.
 *
 * TODO: escalation logic, timer management, WASM integration.
 */

export const NIGHTMARE_LEVELS = [0, 1, 2, 3, 4, 5] as const;
export type NightmareLevel = typeof NIGHTMARE_LEVELS[number];

export const NIGHTMARE_LEVEL_NAMES: Record<NightmareLevel, string> = {
  0: 'DORMANT',
  1: 'AWARE',
  2: 'RESTLESS',
  3: 'HAUNTED',
  4: 'POSSESSED',
  5: 'ABYSS',
};

type EventName = 'levelchange' | 'activate' | 'deactivate';
type Listener  = (...args: unknown[]) => void;

export interface NightmareEngineOptions {
  escalationInterval?: number;
}

export class NightmareEngine {
  private level: NightmareLevel = 0;
  private active = false;
  private listeners: Map<EventName, Listener[]> = new Map();

  constructor(_options: NightmareEngineOptions = {}) {
    // TODO: set up escalation timer using options.escalationInterval
  }

  activate(): void {
    this.active = true;
    this._setLevel(1);
    this._emit('activate');
  }

  deactivate(): void {
    this.active = false;
    this._setLevel(0);
    this._emit('deactivate');
  }

  toggle(): boolean {
    this.active ? this.deactivate() : this.activate();
    return this.active;
  }

  on(event: EventName, listener: Listener): void {
    const list = this.listeners.get(event) ?? [];
    list.push(listener);
    this.listeners.set(event, list);
  }

  getCSSVars(): Record<string, string> {
    // TODO: return CSS custom properties keyed to nightmare level
    return { '--nightmare-intensity': String(this.level / 5) };
  }

  getAtmosphericOptions(): Record<string, number> {
    // TODO: derive atmospheric params from current level
    return { fogSpeed: this.level + 1 };
  }

  private _setLevel(level: NightmareLevel): void {
    this.level = level;
    this._emit('levelchange', { level, name: NIGHTMARE_LEVEL_NAMES[level] });
  }

  private _emit(event: EventName, data?: unknown): void {
    (this.listeners.get(event) ?? []).forEach(fn => fn(data));
  }
}
