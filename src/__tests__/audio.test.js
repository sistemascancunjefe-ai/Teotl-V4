 security-fix-audio-prng-7356217374464945795
import { AudioEngine } from '../engine/audio.js';
import { jest } from '@jest/globals';

// Mock Web Audio API
class MockAudioBuffer {
  constructor(options) {
    this.length = options.length;
    this.sampleRate = options.sampleRate;
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
};
global.crypto = mockCrypto;

describe('AudioEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new AudioEngine();
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
  
import { jest } from '@jest/globals';
import { AudioEngine } from '../engine/audio.js';

class MockAudioBuffer {
    constructor(channels, length, sampleRate) {
        this.sampleRate = sampleRate;
        this.length = length;
        this.numberOfChannels = channels;
        this.data = new Float32Array(this.length);
    }
    getChannelData(channel) {
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
        return new MockAudioBuffer(channels, length, sampleRate);
    }
    createGain() {
        return {
            gain: {
                value: 1,
                setValueAtTime: jest.fn(),
                linearRampToValueAtTime: jest.fn(),
                setTargetAtTime: jest.fn(),
                exponentialRampToValueAtTime: jest.fn()
            },
            connect: jest.fn()
        };
    }
    createOscillator() {
        return {
            frequency: { value: 440 },
            type: '',
            connect: jest.fn(),
            start: jest.fn(),
            stop: jest.fn()
        };
    }
    createBufferSource() {
        return {
            buffer: null,
            loop: false,
            connect: jest.fn(),
            start: jest.fn(),
            stop: jest.fn()
        };
    }
    createBiquadFilter() {
        return {
            type: '',
            frequency: { value: 0 },
            connect: jest.fn()
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

global.window = {
    AudioContext: MockAudioContext,
    webkitAudioContext: MockAudioContext
};

describe('AudioEngine', () => {
    let audioEngine;

    beforeEach(() => {
        audioEngine = new AudioEngine();
    });

    test('should cache noise buffer', () => {
        // Force inject a mock context
        audioEngine._ctx = new MockAudioContext();
        audioEngine._masterGain = audioEngine._ctx.createGain();

        audioEngine.enable();

        const firstBuffer = audioEngine._noiseBuffer;
        expect(firstBuffer).toBeDefined();

        // Trigger another ambient start (e.g. via nightmare mode toggle)
        audioEngine.setNightmareMode(true);

        const secondBuffer = audioEngine._noiseBuffer;
        expect(secondBuffer).toBe(firstBuffer);
    });

    test('should recreate noise buffer if sampleRate changes', () => {
        audioEngine._ctx = new MockAudioContext();
        audioEngine._masterGain = audioEngine._ctx.createGain();

        audioEngine.enable();

        const firstBuffer = audioEngine._noiseBuffer;
        expect(firstBuffer).toBeDefined();

        // Simulate sampleRate change
        audioEngine._ctx.sampleRate = 48000;
        // Directly call _startNoiseLayer
        audioEngine._startNoiseLayer();

        const secondBuffer = audioEngine._noiseBuffer;
        expect(secondBuffer).not.toBe(firstBuffer);
        expect(secondBuffer.sampleRate).toBe(48000);
    });
 main
});
