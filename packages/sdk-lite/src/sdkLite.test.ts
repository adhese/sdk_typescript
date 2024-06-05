import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSlot } from '@adhese/sdk-lite';
import { mockServer } from 'server-mocking';

describe('sdkLite', () => {
  const intersectionMockFunctions = {
    disconnect: vi.fn(),
    observe: vi.fn(),
    takeRecords: vi.fn(),
    unobserve: vi.fn(),
  };

  const intersectionObserverMap = new Map<IntersectionObserver, IntersectionObserverCallback>();

  beforeAll(() => {
    mockServer.listen();
  });
  beforeEach(() => {
    const intersectionObserverMock = vi.fn((callback: IntersectionObserverCallback, options: IntersectionObserverInit) => {
      const intersectionObserver = {
        thresholds: typeof options.threshold === 'number' ? [options.threshold] : (options.threshold ?? [0]),
        root: document,
        rootMargin: '',
        ...intersectionMockFunctions,
        ...options,
      };

      intersectionObserverMap.set(intersectionObserver, callback);

      return intersectionObserver;
    });

    vi.stubGlobal('IntersectionObserver', intersectionObserverMock);
  });
  afterEach(() => {
    mockServer.resetHandlers();
    intersectionObserverMap.clear();

    // vi.time
  });
  afterAll(() => {
    mockServer.close();
  });

  it('should create a slot', async () => {
    const element = document.createElement('div');

    const slot = createSlot({
      containingElement: element,
      format: 'skyscraper',
      account: 'test',
      location: '_sdk_example_',
    });

    await slot.render();

    expect(element.querySelector('iframe')).not.toBe(null);
  });

  it('should create a slot with consent set to true', () => {
    const element = document.createElement('div');

    const slot = createSlot({
      containingElement: element,
      format: 'skyscraper',
      account: 'test',
      location: '_sdk_example_',
      consent: true,
    });

    expect(slot.parameters.tl).toBe('all');
  });

  it('should create a slot with consent set to false', () => {
    const element = document.createElement('div');

    const slot = createSlot({
      containingElement: element,
      format: 'skyscraper',
      account: 'test',
      location: '_sdk_example_',
      consent: false,
    });

    expect(slot.parameters.tl).toBe('none');
  });

  it('should create a slot with consent set as a string', () => {
    const element = document.createElement('div');

    const slot = createSlot({
      containingElement: element,
      format: 'skyscraper',
      account: 'test',
      location: '_sdk_example_',
      consent: 'foo',
    });

    expect(slot.parameters.xt).toBe('foo');
  });

  it('should handle an empty slot', async () => {
    const element = document.createElement('div');

    const onEmpty = vi.fn();

    const slot = createSlot({
      containingElement: element,
      format: 'skyscraper',
      account: 'empty',
      location: '_sdk_example_',
      onEmpty,
    });

    await slot.render();

    expect(slot.data).toBeUndefined;
    expect(onEmpty).toHaveBeenCalledTimes(1);
  });

  it('should be able to dispose a slot', async () => {
    const element = document.createElement('div');

    const onDispose = vi.fn();

    const slot = createSlot({
      containingElement: element,
      format: 'skyscraper',
      account: 'test',
      location: '_sdk_example_',
      onDispose,
    });

    await slot.render();

    expect(element.querySelector('iframe')).not.toBe(null);

    slot.dispose();

    expect(element.querySelector('iframe')).toBe(null);
    expect(onDispose).toHaveBeenCalledTimes(1);
  });

  it('should be able to handle viewability tracking', async () => {
    const element = document.createElement('div');

    const onRender = vi.fn();

    await createSlot({
      containingElement: element,
      format: 'skyscraper',
      account: 'test',
      location: '_sdk_example_',
      onRender,
    }).render();

    vi.useFakeTimers();

    for (const [observer, callback] of intersectionObserverMap) {
      callback([
        {
          isIntersecting: true,
          intersectionRatio: 1,
          target: element,
          boundingClientRect: new DOMRect(),
          intersectionRect: new DOMRect(),
          rootBounds: null,
          time: 0,
        },
      ], observer);
    }

    vi.advanceTimersByTime(100);

    for (const [observer, callback] of intersectionObserverMap) {
      callback([
        {
          isIntersecting: true,
          intersectionRatio: 0,
          target: element,
          boundingClientRect: new DOMRect(),
          intersectionRect: new DOMRect(),
          rootBounds: null,
          time: 0,
        },
      ], observer);
    }

    vi.advanceTimersByTime(100);

    for (const [observer, callback] of intersectionObserverMap) {
      callback([
        {
          isIntersecting: true,
          intersectionRatio: 1,
          target: element,
          boundingClientRect: new DOMRect(),
          intersectionRect: new DOMRect(),
          rootBounds: null,
          time: 0,
        },
      ], observer);
    }

    vi.advanceTimersByTime(1100);

    vi.useRealTimers();

    expect(document.querySelector('img[src="/viewable-impression"]')).not.toBe(null);
  });

  it('should be able to handle click tracking', async () => {
    const element = document.createElement('div');

    const slot = createSlot({
      containingElement: element,
      format: 'skyscraper',
      account: 'test',
      location: '_sdk_example_',
      clickTrackerUrl: 'https://foo.bar',
    });

    await slot.render();

    element.click();

    expect(document.querySelector('img[src="https://foo.bar"]')).not.toBe(null);
  });
});
