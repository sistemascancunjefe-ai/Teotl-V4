import { AudioEngine } from '../engine/audio.js';
import { vi } from 'vitest';
const jest = vi;

// Mock Web Audio API
class MockAudioBuffer {
  constructor(options) {
    this.length = options.length || options; // support both forms
    this.sampleRate = options.sampleRate || 44100;
    this.data = new Float32Array(this.length);
  }
  getChannelData() {
    return this.data;
  }
}

class MockAudioContext {
  constructor() {
    this.sampleRate = 44100;
    this.currentTime = 0;
    this.state = 'suspended';
    this.destination = {};
  }
  createBuffer(channels, length, sampleRate) {
    return new MockAudioBuffer({ length, sampleRate });
  }
  createGain() {
    return {
      gain: {
        value: 1,
        setTargetAtTime: jest.fn(),
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
      connect: jest.fn(),
    };
  }
  createOscillator() {
    return {
      frequency: { value: 440 },
      start: jest.fn(),
      stop: jest.fn(),
      connect: jest.fn(),
    };
  }
  createBufferSource() {
    return {
      start: jest.fn(),
      stop: jest.fn(),
      connect: jest.fn(),
      buffer: null,
      loop: false,
    };
  }
  createBiquadFilter() {
    return {
      frequency: { value: 0 },
      connect: jest.fn(),
    };
  }
  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
}

// Mock Web Crypto API
const mockCrypto = {
  getRandomValues: (array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 4294967296);
    }
    return array;
  },
};

global.window = {
  AudioContext: MockAudioContext,
  webkitAudioContext: MockAudioContext
};
Object.defineProperty(global, "crypto", { value: mockCrypto });

describe('AudioEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new AudioEngine();
    engine._nightmareLevel = 1;
  });

  afterEach(() => {
    engine.destroy();
  });

  test('should initialize correctly', () => {
    // Manually set _ctx to bypass browser-specific window check in init()
    engine._ctx = new MockAudioContext();
    engine._masterGain = engine._ctx.createGain();
    expect(engine.isInitialized()).toBe(true);
  });

  test('should generate noise layer without crashing', () => {
    engine._ctx = new MockAudioContext();
    engine._masterGain = engine._ctx.createGain();
    // This will trigger _startNoiseLayer indirectly
    engine.enable();
    expect(engine._noiseSource).not.toBeNull();
    expect(engine._noiseSource.buffer).not.toBeNull();

    // Verify that data in the buffer is within range [-0.5, 0.5)
    const data = engine._noiseSource.buffer.getChannelData(0);
    expect(data.length).toBeGreaterThan(0);
    for (let i = 0; i < data.length; i++) {
      expect(data[i]).toBeGreaterThanOrEqual(-0.5);
      expect(data[i]).toBeLessThan(0.5);
    }
  });
  
  test('should cache noise buffer', () => {
      // Force inject a mock context
      engine._ctx = new MockAudioContext();
      engine._masterGain = engine._ctx.createGain();

      engine.enable();

      const firstBuffer = engine._noiseBuffer;
      expect(firstBuffer).toBeDefined();

      // Trigger another ambient start (e.g. via nightmare mode toggle)
      engine.setNightmareMode(true);

      const secondBuffer = engine._noiseBuffer;
      expect(secondBuffer).toBe(firstBuffer);
  });

  test('should recreate noise buffer if sampleRate changes', () => {
      engine._ctx = new MockAudioContext();
      engine._masterGain = engine._ctx.createGain();

      engine.enable();

      const firstBuffer = engine._noiseBuffer;
      expect(firstBuffer).toBeDefined();

      // Simulate sampleRate change
      engine._ctx.sampleRate = 48000;
      // Directly call _startNoiseLayer
      engine._replaceNoiseLayer({ filterFreq: 1000, noiseGain: 0.5 }, engine._ctx.currentTime, 0.5);

      const secondBuffer = engine._noiseBuffer;
      expect(secondBuffer).not.toBe(firstBuffer);
      expect(secondBuffer.sampleRate).toBe(48000);
  });
});
