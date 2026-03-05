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
});
