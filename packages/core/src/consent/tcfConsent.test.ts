import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { onTcfConsentChange } from './tcfConsent';

describe('tcfConsent', () => {
  const listeners = new Set<(data: unknown, success: boolean) => void>();

  beforeAll(() => {
    Object.defineProperty(window, '__tcfapi', {
      // @ts-expect-error Testing TCF
      value: vi.fn((command: 'addEventListener' | 'removeEventListener', version: number, callback: (data: unknown, success: boolean) => void): void => {
        if (command === 'addEventListener')
          listeners.add(callback);
        else if (command === 'removeEventListener')
          listeners.delete(callback);
      }),
    });
  });

  afterEach(() => {
    listeners.clear();
  });

  it('should listen for TCF consent changes', () => {
    const callback = vi.fn();

    expect(listeners.size).toBe(0);

    onTcfConsentChange(callback);

    expect(callback).toHaveBeenCalledTimes(0);

    listeners.forEach((listener) => {
      listener('data', true);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should remove a listener', () => {
    const callback = vi.fn();

    expect(listeners.size).toBe(0);

    const remove = onTcfConsentChange(callback);

    listeners.forEach((listener) => {
      listener('data', true);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    remove();

    listeners.forEach((listener) => {
      listener('data', true);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
