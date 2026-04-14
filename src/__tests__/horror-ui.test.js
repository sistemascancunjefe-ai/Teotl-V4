import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import { HorrorUI } from '../ui/horror-ui.js';

describe('HorrorUI', () => {
  let ui;
  let mockAtmoEl;
  let mockGlitchOverlay;
  let mockScreenEl;
  let toggleSpy;

  beforeEach(() => {
    mockAtmoEl = { textContent: '' };
    mockGlitchOverlay = {
      classList: {
        add: () => {},
        remove: () => {},
        toggle: () => {}
      }
    };
    mockScreenEl = {};

    global.document = {
      body: {
        classList: {
          toggle: (cls, active) => {
             // Mock implementation
          }
        }
      }
    };

    if (typeof global.window === 'undefined') {
      global.window = {
        crypto: {
          getRandomValues: (array) => {
            for (let i = 0; i < array.length; i++) {
              array[i] = Math.floor(Math.random() * 0xffffffff);
            }
            return array;
          }
        }
      };
    }

    spyOn(global.document.body.classList, 'toggle');

    ui = new HorrorUI();
  });

  afterEach(() => {
    ui.stop();
  });

  it('should initialize with default options', () => {
    expect(ui._options).toEqual({
      flickerEnabled: true,
      corruptTextEnabled: true,
      glitchIntensity: 5,
    });
  });

  it('should update options via setOptions', () => {
    ui.setOptions({ glitchIntensity: 8, flickerEnabled: false });
    expect(ui._options.glitchIntensity).toBe(8);
    expect(ui._options.flickerEnabled).toBe(false);
    expect(ui._options.corruptTextEnabled).toBe(true);
  });

  it('should mount elements correctly', () => {
    ui.mount({
      atmosphereText: mockAtmoEl,
      glitchOverlay: mockGlitchOverlay,
      screen: mockScreenEl
    });
    expect(ui._atmoEl).toBe(mockAtmoEl);
    expect(ui._glitchOverlay).toBe(mockGlitchOverlay);
    expect(ui._screenEl).toBe(mockScreenEl);
  });

  it('should handle setNightmareMode', () => {
    ui.mount({ screen: mockScreenEl });
    ui.setNightmareMode(true);
    expect(ui._nightmareMode).toBe(true);
    expect(global.document.body.classList.toggle).toHaveBeenCalledWith('nightmare-active', true);

    ui.setNightmareMode(false);
    expect(ui._nightmareMode).toBe(false);
    expect(global.document.body.classList.toggle).toHaveBeenCalledWith('nightmare-active', false);
  });

  it('should not toggle class if screen element is not mounted', () => {
    ui.setNightmareMode(true);
    expect(ui._nightmareMode).toBe(true);
    expect(global.document.body.classList.toggle).not.toHaveBeenCalled();
  });

  describe('corruptText', () => {
    it('should not corrupt text when ratio is 0', () => {
      const original = 'Hello World';
      expect(HorrorUI.corruptText(original, 0)).toBe(original);
    });

    it('should corrupt text when ratio is 1', () => {
      const original = 'abc';
      const result = HorrorUI.corruptText(original, 1);
      expect(result.length).toBe(3);
      expect(result).not.toBe(original);
    });

    it('should preserve spaces', () => {
      const original = 'a b c';
      const result = HorrorUI.corruptText(original, 1);
      expect(result[1]).toBe(' ');
      expect(result[3]).toBe(' ');
    });
  });

  describe('start and stop', () => {
    it('should schedule effects on start', () => {
      const setTimeoutSpy = spyOn(global, 'setTimeout');
      ui.mount({ atmosphereText: mockAtmoEl });
      ui.start();

      // Should schedule atmosphere text and glitch
      expect(setTimeoutSpy).toHaveBeenCalled();
      setTimeoutSpy.mockRestore();
    });

    it('should clear timers on stop', () => {
      const clearTimeoutSpy = spyOn(global, 'clearTimeout');
      ui.mount({ atmosphereText: mockAtmoEl, glitchOverlay: mockGlitchOverlay });
      ui.start();

      ui.stop();
      expect(clearTimeoutSpy).toHaveBeenCalled();
      expect(ui._atmoTimer).toBeNull();
      expect(ui._glitchTimer).toBeNull();
      expect(ui._timers).toEqual([]);
      clearTimeoutSpy.mockRestore();
    });
  });
});
