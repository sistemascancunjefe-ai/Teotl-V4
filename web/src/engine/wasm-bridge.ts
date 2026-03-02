/**
 * WasmBridge — TypeScript placeholder
 *
 * Loads and exposes the `teotl_wasm` WebAssembly module compiled by wasm-pack.
 * Once the Rust crates are built, the generated JS bindings are imported here
 * and methods are proxied to the rest of the TypeScript host.
 *
 * Build the WASM crate first:
 *   cd crates/teotl_wasm && wasm-pack build --target web --out-dir ../../web/src/wasm
 *
 * TODO: replace stub with real wasm-pack generated bindings import.
 */

export interface TeotlWasmExports {
  // Placeholder: add real exports from teotl_wasm here
  version(): string;
}

export class WasmBridge {
  private exports: TeotlWasmExports | null = null;

  async init(): Promise<void> {
    // TODO: dynamically import the wasm-pack generated module, e.g.:
    //   const wasm = await import('../wasm/teotl_wasm');
    //   await wasm.default();
    //   this.exports = wasm;
    console.info('[WasmBridge] WASM not yet compiled — running in stub mode.');
  }

  isReady(): boolean {
    return this.exports !== null;
  }

  getExports(): TeotlWasmExports | null {
    return this.exports;
  }
}
