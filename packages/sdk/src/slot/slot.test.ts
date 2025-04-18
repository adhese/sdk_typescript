import type { AdheseContext } from '@adhese/sdk';
import { awaitTimeout } from '@adhese/sdk-shared';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// eslint-disable-next-line ts/naming-convention
import MatchMediaMock from 'vitest-matchmedia-mock';
import { testContext } from '../testUtils';
import { createSlot } from './slot';

vi.mock('../logger/logger', () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('slot', () => {
  const mediaQueryMock = new MatchMediaMock();

  let context: AdheseContext;

  beforeEach(() => {
    mediaQueryMock.useMediaQuery('(min-width: 1025px) and (pointer: fine)');
    context = {
      ...testContext,
      options: {
        ...testContext.options,
        eagerRendering: true,
      },
    };

    context.hooks.runOnInit();
  });

  afterEach(() => {
    mediaQueryMock.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  afterAll(() => {
    mediaQueryMock.destroy();
  });

  it('should create a slot', async () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    const slot = createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      context,
    });

    await awaitTimeout(0);

    await slot.render({
      adFormat: 'foo',
      tag: '<div>foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
      id: 'baz',
      origin: 'JERLICIA',
    });

    expect(slot.element).not.toBe(null);
  });

  it('should create a slot with the slot option set', async () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.dataset.slot = 'bar';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    const slot = createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      slot: 'bar',
      context,
    });

    await awaitTimeout(0);

    await slot.render({
      adFormat: 'foo',
      tag: '<div>foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
      id: 'baz',
      origin: 'JERLICIA',
    });
    expect(slot.element).not.toBe(null);
    expect(slot.data).toBeDefined();
  });

  it('should create a slot with parameters', async () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    const slot = createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      parameters: {
        fo: 'ba',
      },
      context,
    });

    expect(slot.parameters.has('fo')).toBe(true);
    expect(slot.parameters.get('fo')).toBe('ba');

    slot.parameters.set('fo', 'bz');

    expect(slot.parameters.get('fo')).toBe('bz');
  });

  it('should log an error when no element is found', async () => {
    try {
      const slot = createSlot({
        format: 'leaderboard',
        containingElement: 'leaderboard',
        context: {
          ...context,
          options: {
            ...context.options,
            eagerRendering: false,
          },
        },
      });

      await slot.render({
        adFormat: 'foo',
        tag: '<div>foo</div>',
        // eslint-disable-next-line ts/naming-convention
        slotID: 'bar',
        slotName: 'baz',
        adType: 'foo',
        id: 'baz',
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

    createSlot({
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

    const slot = createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      context,
    });

    await awaitTimeout(0);

    await slot.render({
      adFormat: 'foo',
      tag: '<div>foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
      impressionCounter: new URL('https://foo.bar'),
      id: 'baz',
      origin: 'JERLICIA',
    });

    expect(slot.element).not.toBe(null);
  });

  it('should be able to render a slot with an additional tracker', async () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    const slot = createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      context,
    });

    await awaitTimeout(0);

    await slot.render({
      adFormat: 'foo',
      tag: '<div>foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
      impressionCounter: new URL('https://foo.bar'),
      additonalTracker: new URL('https://foo2.bar'),
      id: 'baz',
      origin: 'JERLICIA',
    });

    expect(slot.element).not.toBe(null);
  });

  it('should be able generate a slot name', async () => {
    expect((createSlot({
      format: 'bar',
      context,
    })).name).toBe('foo-bar');

    expect((createSlot({
      format: 'bar',
      slot: 'baz',
      context,
    })).name).toBe('foobaz-bar');
  });

  it('should be able to dispose a slot', async () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    const slot = createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      context,
    });

    await slot.render({
      adFormat: 'foo',
      tag: '<div>foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
      impressionCounter: new URL('https://foo.bar'),
      id: 'baz',
      origin: 'JERLICIA',
    });

    slot.dispose();

    expect(slot.element).toBeNull();
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

    document.body.appendChild(element);

    const slot = createSlot({
      format: 'leaderboard',
      containingElement: element,
      context,
      lazyLoading: true,
    });

    slot.data = {
      adFormat: 'foo',
      tag: '<div>foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
      impressionCounter: new URL('https://foo.bar'),
      viewableImpressionCounter: new URL('https://foo.bar'),
      origin: 'JERLICIA',
      id: 'baz',
    };

    expect(observe).toBeCalledTimes(1);
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

        await awaitTimeout(testContext.options?.viewabilityTrackingOptions?.duration ?? 1000);

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

    const slot = createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      context,
    });

    await awaitTimeout(0);

    await slot.render();
  });

  it('should be able to accept format with different media queries', async () => {
    const element = document.createElement('div');

    mediaQueryMock.useMediaQuery('(max-width: 767px)');

    const slot = createSlot({
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

    expect(slot.format).toBe('skyscraper');

    mediaQueryMock.clear();
    mediaQueryMock.useMediaQuery('(min-width: 768px)');

    await awaitTimeout(70);

    expect(slot.format).toBe('leaderboard');
  });

  it('should be able to render a slot with the render mode set to inline', async () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    const slot = createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      renderMode: 'inline',
      context,
    });

    await awaitTimeout(0);

    await slot.render();

    expect(slot.element).not.toBe(null);
  });
});
