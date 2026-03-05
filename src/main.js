/**
 * TEOTL V4 — Main Application Bootstrap
 * Orchestrates the atmospheric engine, audio engine, nightmare engine, and horror UI.
 */

import { AtmosphericEngine }           from './engine/atmospheric.js';
import { AudioEngine }                 from './engine/audio.js';
import { NightmareEngine, NIGHTMARE_LEVEL_NAMES } from './engine/nightmare.js';
import { HorrorUI }                    from './ui/horror-ui.js';

/** Teotl V4 application. */
class TeotlApp {
  constructor() {
    this._atmospheric = null;
    this._audio       = null;
    this._nightmare   = null;
    this._horrorUI    = null;
    this._currentScreen = 'title';
  }

  /** Boot the application. */
  init() {
    // Engines
    const canvas       = document.getElementById('atmospheric-canvas');
    this._atmospheric  = new AtmosphericEngine(canvas).init().start();

    this._audio        = new AudioEngine();
    this._nightmare    = new NightmareEngine({ escalationInterval: 30000 });
    this._horrorUI     = new HorrorUI();

    // Mount horror UI
    this._horrorUI.mount({
      atmosphereText: document.getElementById('atmosphere-text'),
      glitchOverlay:  document.getElementById('glitch-overlay'),
      screen:         document.getElementById('screen-main'),
    });

    // Nightmare level changes
    this._nightmare.on('levelchange', ({ level, name }) => {
      this._applyNightmareLevel(level, name);
    });
    this._nightmare.on('deactivate', () => {
      this._applyNightmareLevel(0, 'DORMANT');
    });

    // Wire up all buttons
    document.addEventListener('click', (e) => this._handleClick(e));

    // Settings sliders
    this._initSettings();

    return this;
  }

  // ---- Screen navigation ----

  /**
   * Navigate to a named screen.
   * @param {'title'|'main'|'settings'} name
   */
  _showScreen(name) {
    document.querySelectorAll('.screen').forEach(el => {
      el.classList.toggle('screen--active', el.dataset.screen === name);
    });
    this._currentScreen = name;

    if (name === 'main') {
      this._horrorUI.start();
    } else {
      this._horrorUI.stop();
    }
  }

  // ---- Click handler ----

  _handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;

    // Trigger audio click stinger on first interaction
    if (!this._audio.isInitialized()) this._audio.init();
    this._audio.playStinger('click');

    switch (action) {
      case 'start':
        this._showScreen('main');
        break;

      case 'nightmare':
        this._nightmare.activate();
        this._showScreen('main');
        break;

      case 'settings':
        this._showScreen('settings');
        break;

      case 'back-title':
        this._nightmare.deactivate();
        this._showScreen('title');
        break;

      case 'toggle-nightmare': {
        const active = this._nightmare.toggle();
        btn.setAttribute('aria-pressed', String(active));
        break;
      }

      case 'toggle-audio': {
        const enabled = this._audio.toggle();
        btn.setAttribute('aria-pressed', String(enabled));
        break;
      }

      case 'save-settings':
        this._saveSettings();
        this._showScreen('title');
        break;
    }
  }

  // ---- Nightmare level application ----

  _applyNightmareLevel(level, name) {
    // CSS vars
    const vars = this._nightmare.getCSSVars();
    for (const [key, val] of Object.entries(vars)) {
      document.documentElement.style.setProperty(key, val);
    }

    // Atmospheric engine
    const atmOpts = this._nightmare.getAtmosphericOptions();
    this._atmospheric.setOptions(atmOpts);

    // Audio — pass full level for per-level crossfade
    this._audio.setNightmareLevel(level);

    // Horror UI
    this._horrorUI.setNightmareMode(level > 0);

    // HUD
    const hudMode  = document.getElementById('hud-mode');
    const hudLevel = document.getElementById('hud-level');
    if (hudMode)  hudMode.textContent  = level > 0 ? 'PESADILLA' : 'NORMAL';
    if (hudLevel) hudLevel.textContent = NIGHTMARE_LEVEL_NAMES[level] ?? String(level);

    // Flash glitch on level escalation
    if (level > 0) {
      this._horrorUI.flashGlitch(level);
      this._audio.playStinger('heartbeat');
    }
  }

  // ---- Settings ----

  _initSettings() {
    const rangeBindings = [
      { inputId: 'setting-particles',  valId: 'setting-particles-val',  onChange: v => this._atmospheric.setOptions({ particleCount: v }) },
      { inputId: 'setting-fog-speed',  valId: 'setting-fog-speed-val',  onChange: v => this._atmospheric.setOptions({ fogSpeed: v }) },
      { inputId: 'setting-atm-opacity', valId: 'setting-atm-opacity-val', onChange: v => this._atmospheric.setOptions({ opacity: v / 100 }) },
      { inputId: 'setting-glitch',     valId: 'setting-glitch-val',     onChange: v => this._horrorUI.setOptions({ glitchIntensity: v }) },
      { inputId: 'setting-master-vol', valId: 'setting-master-vol-val', onChange: v => this._audio.setVolume(v / 100) },
    ];

    for (const { inputId, valId, onChange } of rangeBindings) {
      const input = document.getElementById(inputId);
      const val   = document.getElementById(valId);
      if (!input) continue;
      input.addEventListener('input', () => {
        const num = Number(input.value);
        if (val) val.textContent = input.value;
        onChange(num);
      });
    }

    const flickerInput      = document.getElementById('setting-flicker');
    const corruptTextInput  = document.getElementById('setting-corrupt-text');
    const horrorSfxInput    = document.getElementById('setting-horror-sfx');

    if (flickerInput) {
      flickerInput.addEventListener('change', () => {
        this._horrorUI.setOptions({ flickerEnabled: flickerInput.checked });
      });
    }
    if (corruptTextInput) {
      corruptTextInput.addEventListener('change', () => {
        this._horrorUI.setOptions({ corruptTextEnabled: corruptTextInput.checked });
      });
    }
    if (horrorSfxInput) {
      horrorSfxInput.addEventListener('change', () => {
        horrorSfxInput.checked ? this._audio.enable() : this._audio.disable();
      });
    }
  }

  _saveSettings() {
    // Settings are applied live; no additional persistence needed for MVP
  }
}

// ---- Bootstrap ----
document.addEventListener('DOMContentLoaded', () => {
  new TeotlApp().init();
});
