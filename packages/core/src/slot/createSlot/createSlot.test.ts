import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { type Ad, type AdheseContext, createSlot } from '@core';

import { awaitTimeout } from '@utils';
import { testContext } from '../../testUtils';

vi.mock('../logger/logger', () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('slot', () => {
  const mediaListeners = new Map<string, Set<() => void>>();
  let validQuery = '(max-width: 767px)';

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
          if (mediaListeners.has(type))
            mediaListeners.get(type)?.add(listener);
          else
            mediaListeners.set(type, new Set([listener]));
        }),
        removeEventListener: vi.fn(
          (type: string, listener: () => void) => {
            mediaListeners.get(type)?.delete(listener);
          },
        ),
      })),
    });
  });

  let context: AdheseContext;

  beforeEach(() => {
    context = {
      ...testContext,
      options: {
        ...testContext.options,
        eagerRendering: true,
      },
    };
  });

  afterEach(() => {
    mediaListeners.clear();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('should create a slot', async () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    const slot = await createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      context,
    });

    expect(slot).toEqual({
      location: 'foo',
      // format: 'leaderboard',
      render: expect.any(Function) as () => Promise<HTMLElement>,
      getElement: expect.any(Function) as () => HTMLElement | null,
      getName: expect.any(Function) as () => string,
      getAd: expect.any(Function) as () => Ad | null,
      setAd: expect.any(Function) as (ad: Ad) => Promise<void>,
      parameters: expect.any(Map) as Map<string, string>,
      dispose: expect.any(Function) as () => void,
      lazyLoading: false,
      isViewabilityTracked: expect.any(Function) as () => boolean,
      isImpressionTracked: expect.any(Function) as () => boolean,
      getFormat: expect.any(Function) as () => string,
      setFormat: expect.any(Function) as (format: string) => Promise<void>,
    } satisfies typeof slot);

    await slot.render({
      tag: '<div>foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
      origin: 'JERLICIA',
    });
    expect(slot.getElement()).not.toBe(null);
  });

  it('should create a slot with the slot option set', async () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.dataset.slot = 'bar';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    const slot = await createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      slot: 'bar',
      context,
    });

    await slot.render({
      tag: '<div>foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
      origin: 'JERLICIA',
    });
    expect(slot.getElement()).not.toBe(null);
    expect(slot.getAd()).toBeDefined();
  });

  it('should create a slot with parameters', async () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    const slot = await createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      parameters: {
        foo: 'bar',
      },
      context,
    });

    expect(slot.parameters.has('foo')).toBe(true);
    expect(slot.parameters.get('foo')).toBe('bar');

    slot.parameters.set('foo', 'baz');

    expect(slot.parameters.get('foo')).toBe('baz');
  });

  it('should log an error when no element is found', async () => {
    const slot = await createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      context,
    });

    try {
      await slot.render({
        tag: '<div>foo</div>',
        // eslint-disable-next-line ts/naming-convention
        slotID: 'bar',
        slotName: 'baz',
        adType: 'foo',
        origin: 'JERLICIA',
      });
    }
    catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should create a slot with an element passed instead of an element id', async () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.dataset.slot = 'bar';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    await createSlot({
      format: 'leaderboard',
      containingElement: element,
      context,
    });
  });

  it('should be able to render a slot', async () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    const slot = await createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      context,
    });

    await slot.render({
      tag: '<div>foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
      impressionCounter: new URL('https://foo.bar'),
      origin: 'JERLICIA',
    });

    expect(slot.getElement()).not.toBe(null);
  });

  it('should be able generate a slot name', async () => {
    expect((await createSlot({
      format: 'bar',
      context,
    })).getName()).toBe('foo-bar');

    expect((await createSlot({
      format: 'bar',
      slot: 'baz',
      context,
    })).getName()).toBe('foobaz-bar');
  });

  it('should be able to dispose a slot', async () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    const slot = await createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      context,
    });

    await slot.render({
      tag: '<div>foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
      impressionCounter: new URL('https://foo.bar'),
      origin: 'JERLICIA',
    });

    slot.dispose();

    expect(slot.getElement()).toBeNull();
  });

  it('should be able to lazy load a slot', async () => {
    const observe = vi.fn();
    const intersectionCallbacks: Array<IntersectionObserverCallback> = [];
    let intersectionObserver: IntersectionObserver | null = null;

    const intersectionObserverMock = vi.fn((callback: IntersectionObserverCallback, options: IntersectionObserverInit) => {
      intersectionCallbacks.push(vi.fn(callback));

      intersectionObserver = {
        observe,
        unobserve: vi.fn(),
        disconnect: vi.fn(),
        takeRecords: vi.fn(),
        thresholds: [0],
        root: document,
        rootMargin: '',
        ...options,
      };

      return intersectionObserver;
    });

    vi.stubGlobal('IntersectionObserver', intersectionObserverMock);

    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    const slot = await createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      context,
      lazyLoading: true,
    });

    await slot.setAd({
      tag: '<div>foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
      impressionCounter: new URL('https://foo.bar'),
      viewableImpressionCounter: new URL('https://foo.bar'),
      origin: 'JERLICIA',
    });

    expect(observe).toBeCalledTimes(2);
    expect(intersectionObserverMock).toBeCalledTimes(2);

    if (intersectionCallbacks.length > 0 && intersectionObserver) {
      await Promise.all(intersectionCallbacks.map(async (callback) => {
        if (!intersectionObserver)
          return;

        callback([{
          boundingClientRect: new DOMRect(),
          intersectionRatio: 1,
          intersectionRect: new DOMRect(),
          isIntersecting: true,
          rootBounds: new DOMRect(),
          target: element,
          time: 0,
        }], intersectionObserver);

        await awaitTimeout(testContext.options.viewabilityTrackingOptions?.duration ?? 1000);

        expect(callback).toBeCalledTimes(1);
      }));
    }

    expect(slot.lazyLoading).toBe(true);
  });

  it('should be able to render a slot without an ad set', async () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    const slot = await createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      context,
    });

    await slot.render();
  });

  it('should be able to accept format with different media queries', async () => {
    const element = document.createElement('div');

    const slot = await createSlot({
      format: [
        {
          format: 'skyscraper',
          query: '(max-width: 767px)',
        },
        {
          format: 'leaderboard',
          query: '(min-width: 768px)',
        },
      ],
      containingElement: element,
      context,
    });

    expect(slot.getFormat()).toBe('skyscraper');

    validQuery = '(min-width: 768px)';

    for (const listener of mediaListeners.get('change') ?? [])
      listener();

    await awaitTimeout(70);

    expect(slot.getFormat()).toBe('leaderboard');
  });

  it('should be able to render a slot with the render mode set to inline', async () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    const slot = await createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      renderMode: 'inline',
      context,
    });

    await slot.render();

    expect(slot.getElement()).not.toBe(null);
  });
});
