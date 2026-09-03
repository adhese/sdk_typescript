import type { AdheseAd, AdheseContext } from '@adhese/sdk';
import type * as sdkShared from '@adhese/sdk-shared';
import { addTrackingPixel, awaitTimeout } from '@adhese/sdk-shared';
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

vi.mock('@adhese/sdk-shared', async (importOriginal) => {
  const actual = await importOriginal<typeof sdkShared>();

  return {
    ...actual,
    addTrackingPixel: vi.fn(actual.addTrackingPixel),
  };
});

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
      additionalTracker: new URL('https://foo2.bar'),
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

  describe('tracking', () => {
    function stubIntersectingObserver(): void {
      const intersectionObserverMock = vi.fn(
        (callback: IntersectionObserverCallback) => {
          const observer = {
            observe: vi.fn((target: Element) => {
              callback(
                [
                  {
                    boundingClientRect: new DOMRect(),
                    intersectionRatio: 1,
                    intersectionRect: new DOMRect(),
                    isIntersecting: true,
                    rootBounds: new DOMRect(),
                    target,
                    time: 0,
                  },
                ],
                observer as unknown as IntersectionObserver,
              );
            }),
            unobserve: vi.fn(),
            disconnect: vi.fn(),
            takeRecords: vi.fn(),
            thresholds: [0],
            root: document,
            rootMargin: '',
          };

          return observer;
        },
      );

      vi.stubGlobal('IntersectionObserver', intersectionObserverMock);
    }

    function createContainingElement(): HTMLElement {
      const element = document.createElement('div');

      element.classList.add('adunit');
      element.dataset.format = 'leaderboard';
      element.id = 'leaderboard';

      document.body.appendChild(element);

      return element;
    }

    function createAd(suffix: string): AdheseAd {
      return {
        adFormat: 'foo',
        tag: '<div>foo</div>',
        // eslint-disable-next-line ts/naming-convention
        slotID: 'bar',
        slotName: 'foo-leaderboard',
        adType: 'foo',
        id: 'baz',
        origin: 'JERLICIA',
        impressionCounter: new URL(`https://foo.bar/impression${suffix}`),
        additionalTracker: new URL(`https://foo.bar/additional${suffix}`),
        viewableImpressionCounter: new URL(`https://foo.bar/viewable${suffix}`),
      };
    }

    function countFiredPixels(url: string): number {
      const { calls } = vi.mocked(addTrackingPixel).mock;

      return calls.filter(([firedUrl]) => firedUrl.toString() === url).length;
    }

    function getAdTitle(ad: AdheseAd): string | undefined {
      return typeof ad.tag === 'string'
        ? /<title>(?<title>[\s\S]*?)<\/title>/i.exec(ad.tag)?.groups?.title
        : undefined;
    }

    beforeEach(() => {
      vi.mocked(addTrackingPixel).mockClear();
      stubIntersectingObserver();
    });

    it('should not fire the tracking pixels again when the same ad is re-rendered', async () => {
      const containingElement = createContainingElement();

      const slot = createSlot({
        format: 'leaderboard',
        containingElement: 'leaderboard',
        context,
        initialData: createAd(''),
      });

      await awaitTimeout(100);

      expect(slot.status).toBe('rendered');
      expect(countFiredPixels('https://foo.bar/impression')).toBe(1);
      expect(countFiredPixels('https://foo.bar/additional')).toBe(1);
      expect(countFiredPixels('https://foo.bar/viewable')).toBe(1);

      containingElement.remove();

      await awaitTimeout(100);

      createContainingElement();

      await awaitTimeout(100);

      expect(slot.status).toBe('rendered');
      expect(countFiredPixels('https://foo.bar/impression')).toBe(1);
      expect(countFiredPixels('https://foo.bar/additional')).toBe(1);
      expect(countFiredPixels('https://foo.bar/viewable')).toBe(1);
    });

    it('should fire the tracking pixels again when a new ad is set', async () => {
      createContainingElement();

      const slot = createSlot({
        format: 'leaderboard',
        containingElement: 'leaderboard',
        context,
        initialData: createAd(''),
      });

      await awaitTimeout(100);

      expect(countFiredPixels('https://foo.bar/impression')).toBe(1);

      slot.data = createAd('-refresh');

      await awaitTimeout(100);

      expect(countFiredPixels('https://foo.bar/impression-refresh')).toBe(1);
      expect(countFiredPixels('https://foo.bar/additional-refresh')).toBe(1);
      expect(countFiredPixels('https://foo.bar/viewable-refresh')).toBe(1);
    });

    it('should fire onEmpty immediately from onRequest and still track the position once rendered, without rendering a creative', async () => {
      createContainingElement();

      const onEmpty = vi.fn();
      const onRender = vi.fn();

      const emptyAd: AdheseAd = {
        ...createAd('-empty-onrequest'),
        tag: '<title>Empty</title>',
      };

      let onEmptyCallOrder = -1;
      let requestHookCallOrder = -1;
      let callOrder = 0;

      const slot = createSlot({
        format: 'leaderboard',
        containingElement: 'leaderboard',
        context,
        initialData: emptyAd,
        setup(slotContext, hooks) {
          hooks.onRequest((ad) => {
            requestHookCallOrder = callOrder++;

            if (getAdTitle(ad) === 'Empty') {
              slotContext.value?.processOnEmpty(ad);
            }

            return ad;
          });
          hooks.onEmpty(() => {
            onEmptyCallOrder = callOrder++;
            onEmpty();
          });
          hooks.onRender(onRender);
        },
      });

      await awaitTimeout(100);

      // onEmpty fires synchronously from within the onRequest hook, not deferred until the slot renders.
      expect(onEmptyCallOrder).toBe(requestHookCallOrder + 1);
      expect(slot.status).toBe('rendered');
      expect(slot.isEmpty).toBe(true);
      expect(slot.element?.innerHTML).toBe('');
      expect(onEmpty).toHaveBeenCalledTimes(1);
      expect(onRender).not.toHaveBeenCalled();
      expect(countFiredPixels('https://foo.bar/impression-empty-onrequest')).toBe(1);
      expect(countFiredPixels('https://foo.bar/viewable-empty-onrequest')).toBe(1);

      slot.dispose();
    });

    it('should track the position but not render a creative when onBeforeRender identifies the ad as empty', async () => {
      createContainingElement();

      const onEmpty = vi.fn();
      const onRender = vi.fn();

      const emptyAd: AdheseAd = {
        ...createAd('-empty-onbeforerender'),
        tag: '<title>Empty</title>',
      };

      const slot = createSlot({
        format: 'leaderboard',
        containingElement: 'leaderboard',
        context,
        initialData: emptyAd,
        setup(_slotContext, hooks) {
          hooks.onBeforeRender(ad => (getAdTitle(ad) === 'Empty' ? false as unknown as AdheseAd : ad));
          hooks.onEmpty(onEmpty);
          hooks.onRender(onRender);
        },
      });

      await awaitTimeout(100);

      expect(slot.status).toBe('rendered');
      expect(slot.isEmpty).toBe(true);
      expect(slot.element?.innerHTML).toBe('');
      expect(onEmpty).toHaveBeenCalledTimes(1);
      expect(onRender).not.toHaveBeenCalled();
      expect(countFiredPixels('https://foo.bar/impression-empty-onbeforerender')).toBe(1);
      expect(countFiredPixels('https://foo.bar/viewable-empty-onbeforerender')).toBe(1);

      slot.dispose();
    });

    it('should fire onEmpty and reach the empty status without tracking anything when no ad is returned at all', async () => {
      createContainingElement();

      const onEmpty = vi.fn();
      const onRender = vi.fn();

      const slot = createSlot({
        format: 'leaderboard',
        containingElement: 'leaderboard',
        context,
        setup(slotContext, hooks) {
          hooks.onInit(() => {
            // Simulates the SDK's own "no ad returned by the server for this slot" detection.
            slotContext.value?.processOnEmpty();
          });
          hooks.onEmpty(onEmpty);
          hooks.onRender(onRender);
        },
      });

      await awaitTimeout(100);

      expect(slot.status).toBe('empty');
      expect(slot.isEmpty).toBe(true);
      expect(onEmpty).toHaveBeenCalledTimes(1);
      expect(onRender).not.toHaveBeenCalled();
      expect(vi.mocked(addTrackingPixel)).not.toHaveBeenCalled();

      slot.dispose();
    });
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
