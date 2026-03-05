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
  private ctx: CanvasRenderingContext2D | null = null;
  private rafId: number | null = null;
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
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    return this;
  }

  private resize(): void {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width  = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  }

  start(): this {
    if (this.running) return this;
    this.running = true;
    this.rafId = requestAnimationFrame(() => this.tick());
    return this;
  }

  stop(): this {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    return this;
  }

  private tick(): void {
    if (!this.running) return;
    this.render();
    this.rafId = requestAnimationFrame(() => this.tick());
  }

  private render(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    // Basic render to verify loop: clear and draw a small pulsing indicator
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Placeholder: just a subtle feedback that the engine is active
    const time = Date.now() / 1000;
    const pulse = (Math.sin(time * 2) + 1) / 2;
    ctx.fillStyle = `rgba(150, 0, 0, ${0.1 * pulse * this.options.opacity})`;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setOptions(patch: AtmosphericOptions): void {
    Object.assign(this.options, patch);
  }

  isRunning(): boolean {
    return this.running;
  }
}
