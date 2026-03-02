/**
 * TEOTL V4 — Web Entrypoint (TypeScript)
 *
 * This module bootstraps the TypeScript web host.
 * WASM crates are loaded via the WasmBridge once compiled with wasm-pack.
 *
 * TODO: replace placeholder imports with real implementations as crates are built.
 */

import { AtmosphericEngine } from './engine/atmospheric';
import { AudioEngine }       from './engine/audio';
import { NightmareEngine }   from './engine/nightmare';
import { WasmBridge }        from './engine/wasm-bridge';
import { HorrorUI }          from './ui/horror-ui';

async function bootstrap(): Promise<void> {
  // 1. Load WASM (stubbed until wasm-pack builds are ready)
  const wasm = new WasmBridge();
  await wasm.init();

  // 2. Boot engines
  const canvas       = document.getElementById('atmospheric-canvas') as HTMLCanvasElement;
  const atmospheric  = new AtmosphericEngine(canvas);
  const audio        = new AudioEngine();
  const nightmare    = new NightmareEngine();
  const horrorUI     = new HorrorUI();

  atmospheric.init().start();

  const app = document.getElementById('app');
  if (app) {
    horrorUI.mount(app);
  }

  // Expose for debugging in dev
  if (import.meta.env.DEV) {
    (window as unknown as Record<string, unknown>).__teotl__ = { atmospheric, audio, nightmare, horrorUI, wasm };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bootstrap().catch(console.error);
});
