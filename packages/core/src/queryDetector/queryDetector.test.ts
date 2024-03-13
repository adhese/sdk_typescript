import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awaitTimeout } from '@utils';
import { createQueryDetector } from './queryDetector';

describe('queryDetector', () => {
  const listeners = new Map<string, Set<() => void>>();
  let validQuery = '(max-width: 768px) and (pointer: coarse)';

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
          if (listeners.has(type))
            listeners.get(type)?.add(listener);
          else
            listeners.set(type, new Set([listener]));
        }),
        removeEventListener: vi.fn(
          (type: string, listener: () => void) => {
            listeners.get(type)?.delete(listener);
          },
        ),
      })),
    });
  });

  afterEach(() => {
    listeners.clear();
  });

  it('should create a queryDetector', async () => {
    const detector = createQueryDetector();

    expect(detector.getQuery()).toBe('mobile');
  });

  it('should create a queryDetector with onChange', async () => {
    const onChange = vi.fn();
    const detector = createQueryDetector({ onChange });

    listeners.get('change')?.forEach((listener) => {
      listener();
    });

    await awaitTimeout(70);

    expect(onChange).toHaveBeenCalledTimes(1);

    detector.dispose();

    listeners.get('change')?.forEach((listener) => {
      listener();
    });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('should return unknown device', () => {
    validQuery = '(min-width: 1280px) and (pointer: fine)';
    const detector = createQueryDetector();

    expect(detector.getQuery()).toBe('unknown');
  });

  it('should create a queryDetector with custom queries', () => {
    const detector = createQueryDetector({
      queries: {
        mobile: '(max-width: 768px) and (pointer: coarse)',
        tablet: '(min-width: 769px) and (max-width: 1024px) and (pointer: coarse)',
        desktop: '(min-width: 1025px) and (pointer: fine)',
        largeDesktop: '(min-width: 1280px) and (pointer: fine)',
      },
    });

    expect(detector.queries.size).toBe(4);
    expect(detector.queries.has('largeDesktop')).toBe(true);
  });
});
