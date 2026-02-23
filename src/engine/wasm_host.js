/**
 * TEOTL V4 — WASM Engine Host
 * Loads and interfaces with the Rust WASM engine
 */

import init, { TeotlWasm } from '../../pkg/teotl_wasm.js';

export class WasmEngineHost {
  constructor() {
    this._wasm = null;
    this._initialized = false;
    this._lastTime = 0;
  }

  /**
   * Initialize the WASM module
   */
  async init() {
    try {
      // Initialize wasm-bindgen
      await init();

      // Create engine instance
      this._wasm = new TeotlWasm();
      this._wasm.init();

      this._initialized = true;
      console.log('[WasmEngineHost] Engine initialized successfully');
      return this;
    } catch (error) {
      console.error('[WasmEngineHost] Failed to initialize WASM:', error);
      throw error;
    }
  }

  /**
   * Check if engine is ready
   */
  isReady() {
    return this._initialized && this._wasm !== null;
  }

  /**
   * Update engine (call from requestAnimationFrame)
   * @param {number} timestamp - High-resolution timestamp from RAF
   */
  tick(timestamp) {
    if (!this.isReady()) return;

    // Calculate delta time in seconds
    if (this._lastTime === 0) {
      this._lastTime = timestamp;
      return;
    }

    const dt = Math.min((timestamp - this._lastTime) / 1000, 0.25); // Max 250ms
    this._lastTime = timestamp;

    // Update engine
    this._wasm.tick(dt);
  }

  /**
   * Handle input event
   * @param {object} inputEvent - Input event object
   */
  handleInput(inputEvent) {
    if (!this.isReady()) return;

    try {
      const json = JSON.stringify(inputEvent);
      this._wasm.handle_input(json);
    } catch (error) {
      console.error('[WasmEngineHost] Failed to handle input:', error);
    }
  }

  /**
   * Get audio events for this frame
   * @returns {Array} Audio events
   */
  getAudioEvents() {
    if (!this.isReady()) return [];

    try {
      const json = this._wasm.get_audio_events();
      return JSON.parse(json);
    } catch (error) {
      console.error('[WasmEngineHost] Failed to get audio events:', error);
      return [];
    }
  }

  /**
   * Get render commands for this frame
   * @returns {Array} Render commands
   */
  getRenderCommands() {
    if (!this.isReady()) return [];

    try {
      const json = this._wasm.get_render_commands();
      return JSON.parse(json);
    } catch (error) {
      console.error('[WasmEngineHost] Failed to get render commands:', error);
      return [];
    }
  }

  /**
   * Get current nightmare intensity (0.0 - 1.0)
   */
  getIntensity() {
    if (!this.isReady()) return 0.0;
    return this._wasm.get_intensity();
  }

  /**
   * Set nightmare level (0-4)
   */
  setNightmareLevel(level) {
    if (!this.isReady()) return;
    this._wasm.set_nightmare_level(level);
  }

  /**
   * Get current nightmare level (0-4)
   */
  getNightmareLevel() {
    if (!this.isReady()) return 0;
    return this._wasm.get_nightmare_level();
  }

  /**
   * Get nightmare level name
   */
  getNightmareName() {
    if (!this.isReady()) return 'DORMANT';
    return this._wasm.get_nightmare_name();
  }

  /**
   * Get total ticks
   *
   * @returns {bigint} Total number of ticks since the engine started.
   */
  getTickCount() {
    if (!this.isReady()) return 0n;
    return this._wasm.get_tick_count();
  }

  /**
   * Get total time elapsed
   */
  getTotalTime() {
    if (!this.isReady()) return 0.0;
    return this._wasm.get_total_time();
  }
}
