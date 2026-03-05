import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { NightmareEngine } from '../engine/nightmare.js';
import { vi as jest } from 'vitest';

describe('NightmareEngine', () => {
  let engine;
  let consoleSpy;

  beforeEach(() => {
    engine = new NightmareEngine({ escalationInterval: 1000 });
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    engine.destroy();
    consoleSpy.mockRestore();
  });

  test('should catch errors in event handlers and log them to console.error', () => {
    const errorMessage = 'test error';
    const errorHandler = () => {
      throw new Error(errorMessage);
    };

    engine.on('activate', errorHandler);

    // This should not throw
    expect(() => engine.activate()).not.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[NightmareEngine] handler error for "activate":'),
      expect.any(Error)
    );

    const errorPassed = consoleSpy.mock.calls[0][1];
    expect(errorPassed.message).toBe(errorMessage);
  });

  test('should continue calling other handlers if one throws', () => {
    const firstHandler = jest.fn(() => { throw new Error('first fail'); });
    const secondHandler = jest.fn();

    engine.on('activate', firstHandler);
    engine.on('activate', secondHandler);

    engine.activate();

    expect(firstHandler).toHaveBeenCalled();
    expect(secondHandler).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
  });
});
