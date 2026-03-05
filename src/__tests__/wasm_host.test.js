import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WasmEngineHost } from '../engine/wasm_host.js';

const {
  mockInit,
  tickMock,
  handleInputMock,
  setNightmareMock,
  audioEvents,
  renderCommands,
} = vi.hoisted(() => ({
  mockInit: vi.fn(async () => {}),
  tickMock: vi.fn(),
  handleInputMock: vi.fn(),
  setNightmareMock: vi.fn(),
  audioEvents: [{ event_type: 'mood', params: '{"tension":0.5}' }],
  renderCommands: [{ cmd_type: 'clear', params: '{"color":[0,0,0,1]}' }],
}));

class MockTeotlWasm {
  constructor() {
    this.tick = tickMock;
    this.handle_input = handleInputMock;
    this.set_nightmare_level = setNightmareMock;
  }

  get_audio_events() {
    return JSON.stringify(audioEvents);
  }

  get_render_commands() {
    return JSON.stringify(renderCommands);
  }

  get_intensity() {
    return 0.5;
  }

  get_nightmare_level() {
    return 2;
  }

  get_nightmare_name() {
    return 'DREAD';
  }

  get_tick_count() {
    return 3n;
  }

  get_total_time() {
    return 0.5;
  }
}

vi.mock('../../pkg/teotl_wasm.js', () => ({
  default: mockInit,
  TeotlWasm: vi.fn(() => new MockTeotlWasm()),
}));

describe('WasmEngineHost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initialises and forwards tick and input to WASM', async () => {
    const host = new WasmEngineHost();
    await host.init();

    expect(mockInit).toHaveBeenCalled();
    expect(host.isReady()).toBe(true);

    host.tick(1000);
    expect(tickMock).not.toHaveBeenCalled();

    host.tick(1016.666);
    expect(tickMock).toHaveBeenCalledTimes(1);
    expect(tickMock.mock.calls[0][0]).toBeGreaterThan(0);

    const payload = { KeyDown: { key: 'Space' } };
    host.handleInput(payload);
    expect(handleInputMock).toHaveBeenCalledWith(JSON.stringify(payload));
  });

  it('exposes audio, render, and state data from WASM', async () => {
    const host = new WasmEngineHost();
    await host.init();

    expect(host.getAudioEvents()).toEqual(audioEvents);
    expect(host.getRenderCommands()).toEqual(renderCommands);
    expect(host.getIntensity()).toBeCloseTo(0.5);

    host.setNightmareLevel(3);
    expect(setNightmareMock).toHaveBeenCalledWith(3);
    expect(host.getNightmareLevel()).toBe(2);
    expect(host.getNightmareName()).toBe('DREAD');
    expect(host.getTickCount()).toBe(3n);
    expect(host.getTotalTime()).toBeCloseTo(0.5);
  });
});
