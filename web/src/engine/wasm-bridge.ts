/**
 * WasmBridge — Loads the `teotl_wasm` WebAssembly module.
 */

export class WasmBridge {
  private wasmModule: any = null;

  async init(): Promise<void> {
    try {
      const wasm = await import('../wasm/teotl_wasm');
      await wasm.default();
      this.wasmModule = wasm;
      console.info('[WasmBridge] WASM loaded and initialized.');

      // Initialize the engine
      const engine = new this.wasmModule.TeotlWasm();
      engine.init();
      (window as any).__teotl_engine__ = engine;
    } catch (e) {
      console.error('[WasmBridge] Failed to load WASM:', e);
    }
  }

  isReady(): boolean {
    return this.wasmModule !== null;
  }

  getExports(): any {
    return this.wasmModule;
  }
}
