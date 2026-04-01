/**
 * TEOTL V4 — Main Application Bootstrap (TypeScript)
 *
 * Orchestrates the atmospheric engine, audio engine, nightmare engine, horror UI, and WASM integration.
 */

import { AtmosphericEngine } from './engine/atmospheric';
import { AudioEngine } from './engine/audio';
import { NightmareEngine, NIGHTMARE_LEVEL_NAMES } from './engine/nightmare';
import { WasmBridge } from './engine/wasm-bridge';
import { HorrorUI } from './ui/horror-ui';
import { WorldEngine, Location } from './engine/world';

/** Main application class */
class TeotlApp {
  private atmospheric: AtmosphericEngine | null = null;
  private audio: AudioEngine | null = null;
  private nightmare: NightmareEngine | null = null;
  private horrorUI: HorrorUI | null = null;
  private wasm: WasmBridge | null = null;
  private world: WorldEngine | null = null;
  private currentScreen: 'title' | 'main' | 'settings' = 'title';
  private screens: NodeListOf<Element> | null = null;

  // Debug overlay
  private debugOverlay: HTMLDivElement | null = null;
  private debugFields: Record<string, HTMLElement> = {};
  private lastFrameTime = 0;
  private fps = 0;
  private dt = 0;

  async init(): Promise<this> {
    // 1. Load WASM engine
    this.wasm = new WasmBridge();
    await this.wasm.init();

    // 2. Initialize engines
    const canvas = document.getElementById('atmospheric-canvas') as HTMLCanvasElement;
    if (!canvas) throw new Error('Canvas element not found');

    this.atmospheric = new AtmosphericEngine(canvas);
    this.atmospheric.init().start();

    this.audio = new AudioEngine();
    this.nightmare = new NightmareEngine({ escalationInterval: 30000 });
    this.horrorUI = new HorrorUI();

    // Load World Engine
    this.world = new WorldEngine();
    await this.world.init();

    // 3. Mount horror UI
    const atmosphereText = document.getElementById('atmosphere-text');
    const glitchOverlay = document.getElementById('glitch-overlay');
    const screenMain = document.getElementById('screen-main');

    if (screenMain) {
      this.horrorUI.mount(screenMain as HTMLElement);
    }

    // Cache screens
    this.screens = document.querySelectorAll('.screen');

    // 4. Set up nightmare level change handlers
    this.nightmare.on('levelchange', (data) => {
      this.applyNightmareLevel(data.level, data.name);
    });

    this.nightmare.on('deactivate', () => {
      this.applyNightmareLevel(0, 'DORMANT');
    });

    // 4b. Apply initial nightmare state so HUD/CSS/engines start consistent
    if (this.nightmare) {
      const initialLevel = this.nightmare.level ?? 0;
      const initialName = NIGHTMARE_LEVEL_NAMES[initialLevel] ?? 'DORMANT';
      this.applyNightmareLevel(initialLevel, initialName);
    }
    // 5. Wire up event listeners
    document.addEventListener('click', (e) => this.handleClick(e));

    // 6. Initialize settings
    this.initSettings();

    // 7. Create debug overlay (development only)
    if (import.meta.env.DEV) {
      this.createDebugOverlay();
    }

    // 8. Start game loop
    this.startGameLoop();

    // 9. Expose for debugging
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__teotl__ = {
        atmospheric: this.atmospheric,
        audio: this.audio,
        nightmare: this.nightmare,
        horrorUI: this.horrorUI,
        wasm: this.wasm,
        world: this.world,
      };
    }

    return this;
  }

  private showScreen(name: 'title' | 'main' | 'settings'): void {
    const screens = this.screens || document.querySelectorAll('.screen');
    screens.forEach(el => {
      el.classList.toggle('screen--active', el.getAttribute('data-screen') === name);
    });
    this.currentScreen = name;

    if (name === 'main') {
      this.horrorUI?.start();
      this.renderCurrentLocation();
    } else {
      this.horrorUI?.stop();
    }
  }

  private renderCurrentLocation(): void {
    if (!this.world) return;

    const loc = this.world.getCurrentLocation();
    if (!loc) return;

    const titleEl = document.getElementById('level-title');
    const descEl = document.getElementById('level-desc');
    const navEl = document.getElementById('level-nav');

    if (titleEl) {
        titleEl.textContent = loc.name;
        titleEl.setAttribute('data-text', loc.name); // For glitch effect
    }
    if (descEl) descEl.textContent = loc.description;

    if (navEl) {
        navEl.textContent = ''; // Clear previous navigation buttons

        for (const connId of loc.connections) {
            const connLoc = this.world.getLocation(connId);
            if (connLoc) {
                const btn = document.createElement('button');
                btn.className = 'nav-btn';
                btn.textContent = `AVANZAR A: ${connLoc.name}`;
                btn.setAttribute('data-nav', connId);
                btn.addEventListener('click', () => this.handleNavigation(connId));
                navEl.appendChild(btn);
            }
        }
    }
  }

  private handleNavigation(locationId: string): void {
      if (!this.world) return;

      const success = this.world.moveTo(locationId);
      if (success) {
          // Play a sound and flash glitch on transition
          if (this.audio?.isInitialized()) {
              this.audio.playStinger('click');
          }
          if (this.horrorUI) {
              this.horrorUI.flashGlitch(2);
          }
          this.renderCurrentLocation();
      }
  }

  private handleClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    const btn = target.closest('[data-action]') as HTMLElement;
    if (!btn) return;

    const action = btn.dataset.action;

    // Initialize audio on first interaction
    if (!this.audio?.isInitialized()) {
      this.audio?.init();
    }
    this.audio?.playStinger('click');

    switch (action) {
      case 'start':
        this.showScreen('main');
        break;

      case 'nightmare':
        this.nightmare?.activate();
        this.showScreen('main');
        break;

      case 'settings':
        this.showScreen('settings');
        break;

      case 'back-title':
        this.nightmare?.deactivate();
        this.showScreen('title');
        break;

      case 'toggle-nightmare': {
        const active = this.nightmare?.toggle();
        btn.setAttribute('aria-pressed', String(active));
        break;
      }

      case 'toggle-audio': {
        const enabled = this.audio?.toggle();
        btn.setAttribute('aria-pressed', String(enabled));
        break;
      }

      case 'save-settings':
        this.saveSettings();
        this.showScreen('title');
        break;
    }
  }

  private applyNightmareLevel(level: number, name: string): void {
    // CSS vars
    const vars = this.nightmare?.getCSSVars() ?? {};
    for (const [key, val] of Object.entries(vars)) {
      document.documentElement.style.setProperty(key, val);
    }

    // Atmospheric engine
    const atmOpts = this.nightmare?.getAtmosphericOptions();
    if (atmOpts) {
      this.atmospheric?.setOptions(atmOpts);
    }

    // Audio
    this.audio?.setNightmareMode(level > 0);

    // Horror UI
    this.horrorUI?.setNightmareMode(level > 0);

    // Update HUD
    const hudMode = document.getElementById('hud-mode');
    const hudLevel = document.getElementById('hud-level');
    if (hudMode) hudMode.textContent = level > 0 ? 'PESADILLA' : 'NORMAL';
    if (hudLevel) hudLevel.textContent = NIGHTMARE_LEVEL_NAMES[level] ?? String(level);

    // Flash glitch on level escalation
    if (level > 0) {
      this.horrorUI?.flashGlitch(level);
      this.audio?.playStinger('heartbeat');
    }

    // Sync with WASM engine
    if (this.wasm?.isReady()) {
      this.wasm.setNightmareLevel(level);
    }
  }

  private initSettings(): void {
    const rangeBindings = [
      { inputId: 'setting-particles', valId: 'setting-particles-val', onChange: (v: number) => this.atmospheric?.setOptions({ particleCount: v }) },
      { inputId: 'setting-fog-speed', valId: 'setting-fog-speed-val', onChange: (v: number) => this.atmospheric?.setOptions({ fogSpeed: v }) },
      { inputId: 'setting-atm-opacity', valId: 'setting-atm-opacity-val', onChange: (v: number) => this.atmospheric?.setOptions({ opacity: v / 100 }) },
      { inputId: 'setting-glitch', valId: 'setting-glitch-val', onChange: (v: number) => this.horrorUI?.setOptions({ glitchIntensity: v }) },
      { inputId: 'setting-master-vol', valId: 'setting-master-vol-val', onChange: (v: number) => this.audio?.setVolume(v / 100) },
    ];

    for (const { inputId, valId, onChange } of rangeBindings) {
      const input = document.getElementById(inputId) as HTMLInputElement;
      const val = document.getElementById(valId);
      if (!input) continue;
      input.addEventListener('input', () => {
        const num = Number(input.value);
        if (val) val.textContent = input.value;
        onChange(num);
      });
    }

    const flickerInput = document.getElementById('setting-flicker') as HTMLInputElement;
    const corruptTextInput = document.getElementById('setting-corrupt-text') as HTMLInputElement;
    const horrorSfxInput = document.getElementById('setting-horror-sfx') as HTMLInputElement;

    if (flickerInput) {
      flickerInput.addEventListener('change', () => {
        this.horrorUI?.setOptions({ flickerEnabled: flickerInput.checked });
      });
    }
    if (corruptTextInput) {
      corruptTextInput.addEventListener('change', () => {
        this.horrorUI?.setOptions({ corruptTextEnabled: corruptTextInput.checked });
      });
    }
    if (horrorSfxInput) {
      horrorSfxInput.addEventListener('change', () => {
        if (horrorSfxInput.checked) {
          this.audio?.enable();
        } else {
          this.audio?.disable();
        }
      });
    }
  }

  private saveSettings(): void {
    // Settings are applied live; no additional persistence needed for MVP
  }

  private createDebugOverlay(): void {
    this.debugOverlay = document.createElement('div');
    this.debugOverlay.id = 'debug-overlay';
    this.debugOverlay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #0f0;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border: 1px solid #0f0;
      z-index: 10000;
      min-width: 200px;
    `;

    const title = document.createElement('div');
    const titleStrong = document.createElement('strong');
    titleStrong.textContent = 'TEOTL V4 DEBUG';
    title.appendChild(titleStrong);
    this.debugOverlay.appendChild(title);

    const fields = [
      { key: 'fps', label: 'FPS: ' },
      { key: 'dt', label: 'dt: ' },
      { key: 'tension', label: 'Tension: ' },
      { key: 'nightmare', label: 'Nightmare: ' },
      { key: 'wasmLevel', label: 'WASM Level: ' },
      { key: 'wasmTime', label: 'WASM Time: ' },
      { key: 'screen', label: 'Screen: ' },
    ];

    for (const { key, label } of fields) {
      const container = document.createElement('div');
      container.textContent = label;
      const span = document.createElement('span');
      this.debugFields[key] = span;
      container.appendChild(span);
      this.debugOverlay.appendChild(container);
    }

    document.body.appendChild(this.debugOverlay);
  }

  private updateDebugOverlay(): void {
    if (!this.debugOverlay) return;

    const intensity = this.wasm?.getIntensity() ?? 0;
    const tension = intensity.toFixed(2);
    const wasmLevel = this.wasm?.getNightmareLevel() ?? 0;
    const wasmTime = this.wasm?.getTotalTime() ?? 0;

    if (this.debugFields.fps) this.debugFields.fps.textContent = String(this.fps);
    if (this.debugFields.dt) this.debugFields.dt.textContent = `${this.dt.toFixed(3)}s`;
    if (this.debugFields.tension) this.debugFields.tension.textContent = tension;
    if (this.debugFields.nightmare) this.debugFields.nightmare.textContent = `${this.nightmare?.levelName ?? 'N/A'} (${this.nightmare?.level ?? 0})`;
    if (this.debugFields.wasmLevel) this.debugFields.wasmLevel.textContent = String(wasmLevel);
    if (this.debugFields.wasmTime) this.debugFields.wasmTime.textContent = `${wasmTime.toFixed(1)}s`;
    if (this.debugFields.screen) this.debugFields.screen.textContent = this.currentScreen;
  }

  private startGameLoop(): void {
    let frameCount = 0;
    let fpsTime = performance.now();

    const loop = (timestamp: number) => {
      // Calculate delta time
      const dt = this.lastFrameTime === 0 ? 0 : (timestamp - this.lastFrameTime) / 1000;
      this.lastFrameTime = timestamp;
      this.dt = dt;

      // Update FPS counter
      frameCount++;
      if (timestamp - fpsTime >= 1000) {
        this.fps = frameCount;
        frameCount = 0;
        fpsTime = timestamp;
      }

      // Update WASM engine
      if (this.wasm?.isReady()) {
        this.wasm.tick(timestamp);

        // Process audio events from WASM
        const audioEvents = this.wasm.getAudioEvents();
        for (const event of audioEvents) {
          // Normalize/parse event params so we can safely access fields like `name`.
          let params: { name?: string; volume?: number } | null = null;
          const rawParams = (event as any).params;

          if (typeof rawParams === 'string') {
            try {
              params = JSON.parse(rawParams);
            } catch {
              params = null;
            }
          } else if (rawParams && typeof rawParams === 'object') {
            params = rawParams as { name?: string; volume?: number };
          }

          // Process audio event
          if (event.event_type === 'stinger' && this.audio && params?.name) {
            this.audio.playStinger(params.name as 'click' | 'heartbeat');
          }
        }

        // TODO: Process render commands from WASM
      }

      // Update debug overlay
      this.updateDebugOverlay();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

// Bootstrap on DOM ready
async function bootstrap(): Promise<void> {
  try {
    const app = new TeotlApp();
    await app.init();
    console.log('[Teotl] Application initialized successfully');
  } catch (error) {
    console.error('[Teotl] Failed to initialize application:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bootstrap().catch(console.error);
});
