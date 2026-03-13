import { AtmosphericEngine } from '../engine/atmospheric.js';
import { jest } from '@jest/globals';

class MockCanvas {
    constructor(width = 1920, height = 1080) {
        this.width = width;
        this.height = height;
    }
    getContext(type) {
        return new MockContext(this);
    }
}

class MockContext {
    constructor(canvas) {
        this.canvas = canvas;
        this.fillStyle = '';
        this.globalAlpha = 1;
        this.createRadialGradient = jest.fn(() => ({
            addColorStop: jest.fn()
        }));
        this.fillRect = jest.fn();
        this.drawImage = jest.fn();
        this.save = jest.fn();
        this.restore = jest.fn();
        this.clearRect = jest.fn();
        this.beginPath = jest.fn();
        this.arc = jest.fn();
        this.fill = jest.fn();
    }
}

global.window = {
    innerWidth: 1920,
    innerHeight: 1080,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
};
global.requestAnimationFrame = jest.fn();
global.cancelAnimationFrame = jest.fn();
global.document = {
    createElement: jest.fn((tag) => {
        if (tag === 'canvas') return new MockCanvas();
    })
};

describe('AtmosphericEngine', () => {
    let canvas;
    let engine;

    beforeEach(() => {
        canvas = new MockCanvas();
        engine = new AtmosphericEngine(canvas);
        jest.clearAllMocks();
    });

    test('should initialize and spawn fog layers with offscreen canvases', () => {
        engine.init();
        expect(engine._fogLayers.length).toBe(5);
        engine._fogLayers.forEach(layer => {
            expect(layer.canvas).toBeDefined();
            expect(layer.canvas.width).toBeGreaterThan(0);
        });
        // Verify pre-rendering happened
        expect(document.createElement).toHaveBeenCalledWith('canvas');
    });

    test('_renderFog should use drawImage and not createRadialGradient', () => {
        engine.init();
        const ctx = engine.ctx;
        engine._renderFog(100);

        expect(ctx.drawImage).toHaveBeenCalledTimes(5);
        expect(ctx.createRadialGradient).not.toHaveBeenCalled();
    });

    test('should handle resize and recreate fog layers', () => {
        engine.init();
        const initialFogLayers = [...engine._fogLayers];

        engine._handleResize();

        expect(engine._fogLayers).not.toBe(initialFogLayers);
        // Ensure they are different objects
        for (let i = 0; i < engine._fogLayers.length; i++) {
            expect(engine._fogLayers[i]).not.toBe(initialFogLayers[i]);
        }
    });

    test('setNightmareMode should increase fogSpeed and opacity', () => {
        engine.init();
        const initialSpeed = engine.options.fogSpeed;
        const initialOpacity = engine.options.opacity;

        engine.setNightmareMode(true);

        expect(engine.options.fogSpeed).toBeGreaterThan(initialSpeed);
        expect(engine.options.opacity).toBeGreaterThan(initialOpacity);
    });
});
