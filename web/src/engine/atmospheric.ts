/**
 * AtmosphericEngine — TypeScript placeholder
 *
 * Core atmospheric rendering engine backed by an HTML5 Canvas.
 * Full implementation will delegate heavy particle/fog calculations
 * to the `teotl_engine` WASM crate via WasmBridge.
 *
 * TODO: wire up WASM particle/fog kernels.
 */

export interface AtmosphericOptions {
  particleCount?: number;
  fogSpeed?: number;
  opacity?: number;
}

export class AtmosphericEngine {
  private canvas: HTMLCanvasElement;
  private options: Required<AtmosphericOptions>;
  private running = false;

  constructor(canvas: HTMLCanvasElement, options: AtmosphericOptions = {}) {
    this.canvas = canvas;
    this.options = {
      particleCount: options.particleCount ?? 150,
      fogSpeed:      options.fogSpeed      ?? 3,
      opacity:       options.opacity       ?? 0.7,
    };
  }

  init(): this {
    // TODO: set up canvas context and initial state
    return this;
  }

  start(): this {
    this.running = true;
    // TODO: begin requestAnimationFrame loop
    return this;
  }

  stop(): this {
    this.running = false;
    return this;
  }

  setOptions(patch: AtmosphericOptions): void {
    Object.assign(this.options, patch);
  }

  isRunning(): boolean {
    return this.running;
  }
}
