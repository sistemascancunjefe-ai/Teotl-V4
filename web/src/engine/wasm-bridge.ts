/**
 * WasmBridge — Loads the `teotl_wasm` WebAssembly module.
 */

export class WasmBridge {
  private wasmModule: any = null;

  async init(): Promise<void> {
    try {
      // For Vite builds, we might fail resolving if WASM is not built yet
      // so we use a dynamic import that Vite can ignore if it doesn't exist yet
      // @ts-ignore
      const wasm = await import(/* @vite-ignore */ '../wasm/teotl_wasm').catch(() => null);

      if (!wasm) {
        console.warn('[WasmBridge] WASM module not found. Run `wasm-pack build` first.');
        return;
      }

      await wasm.default();
      this.wasmModule = wasm;
      console.info('[WasmBridge] WASM loaded and initialized.');

      // Initialize the engine
      const engine = new this.wasmModule.TeotlWasm();
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
