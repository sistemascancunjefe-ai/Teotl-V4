import { describe, it, expect, mock, spyOn } from 'bun:test';
import { WasmEngineHost } from '../engine/wasm_host.js';

// Mock the WASM module
mock.module('../../pkg/teotl_wasm.js', () => {
  return {
    default: async () => {},
    TeotlWasm: class {
      get_audio_events() { return '[]'; }
      get_render_commands() { return '[]'; }
      tick() {}
      handle_input() {}
      get_intensity() { return 0; }
      get_nightmare_level() { return 0; }
      get_nightmare_name() { return 'DORMANT'; }
      get_tick_count() { return 0n; }
      get_total_time() { return 0; }
      set_nightmare_level() {}
    }
  };
});

describe('WasmEngineHost Error Handling', () => {
  it('returns an empty array when getAudioEvents fails due to invalid JSON', async () => {
    // Import to get the mock reference
    const { TeotlWasm } = await import('../../pkg/teotl_wasm.js');

    const host = new WasmEngineHost();
    await host.init();

    // Override the mock instance's method
    spyOn(host._wasm, 'get_audio_events').mockImplementation(() => {
      return 'invalid-json';
    });

    const consoleSpy = spyOn(console, 'error').mockImplementation(() => {});

    const events = host.getAudioEvents();

    expect(events).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
    // Bun's spy doesn't have a great way to check partial args like jest's expect.any(SyntaxError)
    // but we can check the first arg
    expect(consoleSpy.mock.calls[0][0]).toBe('[WasmEngineHost] Failed to get audio events:');

    consoleSpy.mockRestore();
  });
});
