import { expect, test, describe, vi } from 'vitest';
import { NightmareEngine } from './nightmare';

describe('NightmareEngine (TypeScript)', () => {
  test('should register and emit events', () => {
    const engine = new NightmareEngine();
    const handler = vi.fn();

    engine.on('activate', handler);
    engine.activate();

    expect(handler).toHaveBeenCalledWith({ level: 1 });
  });

  test('should unbind events correctly', () => {
    const engine = new NightmareEngine();
    const handler = vi.fn();

    engine.on('activate', handler);
    engine.off('activate', handler);
    engine.activate();

    expect(handler).not.toHaveBeenCalled();
  });

  test('should handle multiple listeners and unbind one', () => {
    const engine = new NightmareEngine();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    engine.on('activate', handler1);
    engine.on('activate', handler2);
    engine.off('activate', handler1);

    engine.activate();

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });

  test('should catch errors in handlers and continue', () => {
    const engine = new NightmareEngine();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const faultyHandler = () => { throw new Error('fail'); };
    const goodHandler = vi.fn();

    engine.on('activate', faultyHandler as any);
    engine.on('activate', goodHandler);

    engine.activate();

    expect(goodHandler).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
