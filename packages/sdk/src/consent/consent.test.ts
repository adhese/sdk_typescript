import { createAdhese } from '@adhese/sdk';
import { awaitTimeout } from '@adhese/sdk-shared';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

describe('consent', () => {
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

  const mqListeners = new Map<string, Set<() => void>>();
  const validQuery = '(max-width: 768px) and (pointer: coarse)';

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn((
        query: string,
      ) => ({
        media: query,
        onchange: null,
        dispatchEvent: null,
        matches: query === validQuery,
        addEventListener: vi.fn((type: string, listener: () => void) => {
          if (mqListeners.has(type))
            mqListeners.get(type)?.add(listener);
          else
            mqListeners.set(type, new Set([listener]));
        }),
        removeEventListener: vi.fn(
          (type: string, listener: () => void) => {
            mqListeners.get(type)?.delete(listener);
          },
        ),
      })),
    });
  });

  afterEach(() => {
    listeners.clear();
  });

  it('should listen for TCF consent changes', async () => {
    const element = document.createElement('div');
    element.id = 'billboard';
    element.classList.add('adunit');
    element.dataset.format = 'billboard';

    const adhese = createAdhese({
      account: 'demo',
      initialSlots: [
        {
          format: 'billboard',
          containingElement: 'billboard',
          slot: 'billboard',
        },
      ],
    });
    expect(listeners.size).toBe(1);

    expect(adhese?.parameters.get('xt')).toBeUndefined();
    expect(adhese?.parameters.get('tl')).toBe('none');

    listeners.forEach((listener) => {
      listener({
        tcString: 'data',
      }, true);
    });

    await awaitTimeout(0);

    expect(adhese?.parameters.get('xt')).toBe('data');
    expect(adhese?.parameters.get('tl')).toBeUndefined();

    adhese?.dispose();
  });
});
