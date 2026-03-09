/**
 * WasmBridge — TypeScript WASM Integration
 *
 * Loads and exposes the `teotl_wasm` WebAssembly module compiled by wasm-pack.
 * The generated JS bindings are imported and methods are proxied to the rest
 * of the TypeScript host.
 */

import init, { TeotlWasm } from '../wasm/teotl_wasm';

export interface AudioEvent {
  event_type: string;
  params: string;
}

export interface RenderCommand {
  cmd_type: string;
  params: string;
}

export interface InputEvent {
  type: string;
  data?: unknown;
}

export class WasmBridge {
  private wasm: TeotlWasm | null = null;
  private lastTime = 0;

  async init(): Promise<void> {
    try {
      // Initialize the WASM module
      await init();

      // Create the engine instance
      this.wasm = new TeotlWasm();

      console.info('[WasmBridge] WASM engine initialized successfully');
    } catch (error) {
      console.error('[WasmBridge] Failed to initialize WASM:', error);
      throw error;
    }
  }

  isReady(): boolean {
    return this.wasm !== null;
  }

  /**
   * Update engine (call from requestAnimationFrame)
   */
  tick(timestamp: number): void {
    if (!this.isReady() || !this.wasm) return;

    // Calculate delta time in seconds
    if (this.lastTime === 0) {
      this.lastTime = timestamp;
      return;
    }

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.25); // Max 250ms
    this.lastTime = timestamp;

    // Update engine
    this.wasm.tick(dt);
  }

  /**
   * Handle input event
   */
  handleInput(inputEvent: InputEvent): void {
    if (!this.isReady() || !this.wasm) return;

    try {
      const json = JSON.stringify(inputEvent);
      this.wasm.handle_input(json);
    } catch (error) {
      console.error('[WasmBridge] Failed to handle input:', error);
    }
  }

  /**
   * Get audio events for this frame
   */
  getAudioEvents(): AudioEvent[] {
    if (!this.isReady() || !this.wasm) return [];

    try {
      const json = this.wasm.get_audio_events();
      return JSON.parse(json);
    } catch (error) {
      console.error('[WasmBridge] Failed to get audio events:', error);
      return [];
    }
  }

  /**
   * Get render commands for this frame
   */
  getRenderCommands(): RenderCommand[] {
    if (!this.isReady() || !this.wasm) return [];

    try {
      const json = this.wasm.get_render_commands();
      return JSON.parse(json);
    } catch (error) {
      console.error('[WasmBridge] Failed to get render commands:', error);
      return [];
    }
  }

  /**
   * Get current nightmare intensity (0.0 - 1.0)
   */
  getIntensity(): number {
    if (!this.isReady() || !this.wasm) return 0.0;
    return this.wasm.get_intensity();
  }

  /**
   * Set nightmare level (0-4)
   */
  setNightmareLevel(level: number): void {
    if (!this.isReady() || !this.wasm) return;
    this.wasm.set_nightmare_level(level);
  }

  /**
   * Get current nightmare level (0-4)
   */
  getNightmareLevel(): number {
    if (!this.isReady() || !this.wasm) return 0;
    return this.wasm.get_nightmare_level();
  }

  /**
   * Get total tick count
   */
  getTickCount(): bigint {
    if (!this.isReady() || !this.wasm) return 0n;
    return this.wasm.get_tick_count();
  }

  /**
   * Get total time elapsed
   */
  getTotalTime(): number {
    if (!this.isReady() || !this.wasm) return 0.0;
    return this.wasm.get_total_time();
  }
}
