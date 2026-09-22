import type { AdheseAd, AdheseContext } from '@adhese/sdk';
import type * as sdkShared from '@adhese/sdk-shared';
import type * as requestAdsModule from '../requestAds/requestAds';
import { addTrackingPixel, awaitTimeout } from '@adhese/sdk-shared';
import { http, HttpResponse } from 'msw';
import { mockServer } from 'server-mocking';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// eslint-disable-next-line ts/naming-convention
import MatchMediaMock from 'vitest-matchmedia-mock';
import { requestAd } from '../requestAds/requestAds';
import { testContext } from '../testUtils';
import { createSlot } from './slot';

vi.mock('../logger/logger', () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('@adhese/sdk-shared', async (importOriginal) => {
  const actual = await importOriginal<typeof sdkShared>();

  return {
    ...actual,
    addTrackingPixel: vi.fn(actual.addTrackingPixel),
  };
});

vi.mock('../requestAds/requestAds', async (importOriginal) => {
  const actual = await importOriginal<typeof requestAdsModule>();

  return {
    ...actual,
    requestAd: vi.fn(actual.requestAd),
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

  it('should not issue a duplicate ad request when the slot becomes visible while the initial request is still in flight', async () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.id = 'leaderboard-inflight-race';

    document.body.appendChild(element);

    const intersectionCallbacks: Array<IntersectionObserverCallback> = [];

    vi.stubGlobal('IntersectionObserver', vi.fn((callback: IntersectionObserverCallback) => {
      intersectionCallbacks.push(callback);

      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
        takeRecords: vi.fn(),
        thresholds: [0],
        root: document,
        rootMargin: '',
      } as unknown as IntersectionObserver;
    }));

    let requestCount = 0;
    let resolveRequest: ((ad: AdheseAd | null) => void) | undefined;

    const ad: AdheseAd = {
      adFormat: 'foo',
      tag: '<div>foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
      id: 'baz',
      origin: 'JERLICIA',
    };

    // Stands in for the network round trip: it resolves only once the test calls `resolveRequest`, giving
    // the test full control over how long the request stays in flight.
    vi.mocked(requestAd).mockImplementation(() => new Promise((resolve) => {
      requestCount++;
      resolveRequest = resolve;
    }));

    const slot = createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard-inflight-race',
      context: {
        ...context,
        options: {
          ...context.options,
          // Rendering only happens once the slot is visible, so the viewport watcher below is what drives
          // `render()` — this is the code path the race condition runs through.
          eagerRendering: false,
        },
      },
    });

    try {
      await vi.waitFor(() => {
        expect(slot.status).toBe('loading');
      }, { timeout: 2000, interval: 10 });

      expect(requestCount).toBe(1);

      // The slot scrolls into view while the first request is still unresolved.
      for (const callback of intersectionCallbacks) {
        callback([{
          boundingClientRect: new DOMRect(),
          intersectionRatio: 1,
          intersectionRect: new DOMRect(),
          isIntersecting: true,
          rootBounds: new DOMRect(),
          target: element,
          time: 0,
        }], {} as IntersectionObserver);
      }

      await awaitTimeout(20);

      // Becoming visible makes the slot want to render, which asks for an ad again. That must join the
      // request that's already in flight instead of firing a second one at the ad server.
      expect(requestCount).toBe(1);
      expect(slot.status).not.toBe('rendered');

      resolveRequest?.(ad);

      await vi.waitFor(() => {
        expect(slot.status).toBe('rendered');
      }, { timeout: 2000, interval: 10 });

      expect(requestCount).toBe(1);
      expect(slot.element?.innerHTML).toContain(ad.tag as string);
    }
    finally {
      slot.dispose();
    }
  });

  it('should issue a new request once the previous one has settled', async () => {
    const element = document.createElement('div');

    document.body.appendChild(element);

    let requestCount = 0;

    vi.mocked(requestAd).mockImplementation(async () => {
      requestCount++;

      return {
        adFormat: 'foo',
        tag: '<div>foo</div>',
        // eslint-disable-next-line ts/naming-convention
        slotID: 'bar',
        slotName: 'baz',
        adType: 'foo',
        id: 'baz',
        origin: 'JERLICIA',
      } satisfies AdheseAd;
    });

    const slot = createSlot({
      format: 'leaderboard',
      containingElement: element,
      context,
    });

    try {
      await vi.waitFor(() => {
        expect(requestCount).toBe(1);
      }, { timeout: 2000, interval: 10 });

      await slot.request();

      // Sharing an in-flight request must not outlive that request — otherwise a slot could never refetch.
      expect(requestCount).toBe(2);
    }
    finally {
      slot.dispose();
    }
  });

  it('should still batch the requests of separate slots into a single call to the ad server', async () => {
    const batchedSlotNames: Array<Array<string>> = [];

    mockServer.use(
      http.post('https://ads-test.adhese.com/json', async ({ request }) => {
        const body = await request.json() as { slots: ReadonlyArray<{ slotname: string }> };

        batchedSlotNames.push(body.slots.map(({ slotname }) => slotname));

        return HttpResponse.json([]);
      }),
    );

    const slots = ['batch-a', 'batch-b', 'batch-c'].map((id) => {
      const element = document.createElement('div');

      element.id = id;
      document.body.appendChild(element);

      return createSlot({
        format: 'leaderboard',
        slot: id,
        containingElement: id,
        context,
      });
    });

    const names = slots.map(({ name }) => name);

    try {
      await vi.waitFor(() => {
        expect(
          batchedSlotNames.some(batch => names.every(name => batch.includes(name))),
        ).toBe(true);
      }, { timeout: 2000, interval: 20 });

      // Asserting the absence of a follow-up request means actually waiting out the batch debounce
      // window, so this one genuinely needs a fixed wait rather than a `vi.waitFor`.
      await awaitTimeout(400);

      // Slots left behind by earlier tests can ride along in the same batch, so this asserts the
      // property that matters rather than an exact batch size: each of these slots was requested
      // exactly once, and all of them travelled in the same request.
      for (const name of names)
        expect(batchedSlotNames.filter(batch => batch.includes(name))).toHaveLength(1);

      expect(
        batchedSlotNames.filter(batch => names.every(name => batch.includes(name))),
      ).toHaveLength(1);
    }
    finally {
      for (const slot of slots)
        slot.dispose();
    }
  });

  it('should not stack copies of the creative when the same ad is rendered into the same element twice', async () => {
    const element = document.createElement('div');

    element.id = 'leaderboard-repeat-render';
    document.body.appendChild(element);

    const onRender = vi.fn();

    const ad: AdheseAd = {
      adFormat: 'foo',
      tag: '<div class="creative">foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
      id: 'baz',
      origin: 'JERLICIA',
    };

    const slot = createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard-repeat-render',
      renderMode: 'inline',
      context,
      initialData: ad,
      setup(_slotContext, hooks) {
        hooks.onRender(onRender);
      },
    });

    try {
      await vi.waitFor(() => {
        expect(slot.status).toBe('rendered');
      }, { timeout: 2000, interval: 20 });

      expect(element.querySelectorAll('.creative')).toHaveLength(1);

      await slot.render();

      // Rendering writes the creative again, which is what an explicit `render()` call asks for. What it
      // must not do is leave two copies behind, which is what `renderInline` did when it appended.
      expect(element.querySelectorAll('.creative')).toHaveLength(1);
      expect(element.children).toHaveLength(1);
    }
    finally {
      slot.dispose();
    }
  });

  it('should render the creative again when the host app has wiped the slot element', async () => {
    const element = document.createElement('div');

    element.id = 'leaderboard-wiped';
    document.body.appendChild(element);

    const ad: AdheseAd = {
      adFormat: 'foo',
      tag: '<div class="creative">foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
      id: 'baz',
      origin: 'JERLICIA',
    };

    const slot = createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard-wiped',
      renderMode: 'inline',
      context,
      initialData: ad,
    });

    try {
      await vi.waitFor(() => {
        expect(slot.status).toBe('rendered');
      }, { timeout: 2000, interval: 20 });

      expect(element.querySelectorAll('.creative')).toHaveLength(1);

      // A framework re-rendering this part of the page can drop the creative while keeping the same
      // element. Skipping the render then would leave the slot permanently blank while still counting as
      // rendered - and its impression as tracked.
      element.innerHTML = '';

      await slot.render();

      expect(element.querySelectorAll('.creative')).toHaveLength(1);
    }
    finally {
      slot.dispose();
    }
  });

  it('should render the creative when an onBeforeRender hook clears the element first', async () => {
    const element = document.createElement('div');

    element.id = 'leaderboard-cleared-by-hook';
    document.body.appendChild(element);

    const ad: AdheseAd = {
      adFormat: 'foo',
      tag: '<div class="creative">foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
      id: 'baz',
      origin: 'JERLICIA',
    };

    const slot = createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard-cleared-by-hook',
      renderMode: 'inline',
      context,
      initialData: ad,
      setup(slotContext, hooks) {
        // Apps do this to take ownership of the container before the creative is written. It runs on
        // every render, so by the time the slot decides whether to write, its own creative is gone.
        hooks.onBeforeRender((adToRender) => {
          const el = slotContext.value?.element;
          if (el)
            el.innerHTML = '';

          return adToRender;
        });
      },
    });

    try {
      await vi.waitFor(() => {
        expect(slot.status).toBe('rendered');
      }, { timeout: 2000, interval: 20 });

      expect(element.querySelectorAll('.creative')).toHaveLength(1);

      // Skipping here would leave the slot blank, because the hook already emptied it.
      await slot.render();

      expect(element.querySelectorAll('.creative')).toHaveLength(1);
    }
    finally {
      slot.dispose();
    }
  });

  it('should keep firing onRender for renderMode none, where the app owns the element', async () => {
    const element = document.createElement('div');

    element.id = 'leaderboard-render-none';
    document.body.appendChild(element);

    const ad: AdheseAd = {
      adFormat: 'foo',
      tag: '<div class="creative">foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
      id: 'baz',
      origin: 'JERLICIA',
    };

    let onRenderCount = 0;

    const slot = createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard-render-none',
      renderMode: 'none',
      context,
      initialData: ad,
      setup(slotContext, hooks) {
        // Mirrors the safe-frame plugin, which draws into the element from `onRender` and leaves its
        // content in place. That content is the app's, not the slot's, so it must not be mistaken for a
        // creative that is still rendered.
        hooks.onRender(() => {
          onRenderCount++;

          const el = slotContext.value?.element;
          if (el && !el.querySelector('.app-rendered')) {
            const node = document.createElement('div');
            node.className = 'app-rendered';
            el.appendChild(node);
          }
        });
      },
    });

    try {
      await vi.waitFor(() => {
        expect(onRenderCount).toBe(1);
      }, { timeout: 2000, interval: 20 });

      await slot.render();
      await slot.render();

      await vi.waitFor(() => {
        expect(onRenderCount).toBe(3);
      }, { timeout: 2000, interval: 20 });
    }
    finally {
      slot.dispose();
    }
  });

  it('should still render when a different ad is passed for an already rendered slot', async () => {
    const element = document.createElement('div');

    element.id = 'leaderboard-new-ad-render';
    document.body.appendChild(element);

    const onRender = vi.fn();

    const ad: AdheseAd = {
      adFormat: 'foo',
      tag: '<div class="creative">foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
      id: 'baz',
      origin: 'JERLICIA',
    };

    const slot = createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard-new-ad-render',
      renderMode: 'inline',
      context,
      initialData: ad,
      setup(_slotContext, hooks) {
        hooks.onRender(onRender);
      },
    });

    try {
      await vi.waitFor(() => {
        expect(slot.status).toBe('rendered');
      }, { timeout: 2000, interval: 20 });

      expect(onRender).toHaveBeenCalledTimes(1);

      await slot.render({ ...ad, id: 'other', tag: '<div class="other-creative">bar</div>' });

      // Skipping a repeated render must only apply to the ad that is already rendered.
      expect(onRender).toHaveBeenCalledTimes(2);
      expect(element.querySelectorAll('.other-creative')).toHaveLength(1);

      // The new creative replaces the previous one instead of being appended below it.
      expect(element.querySelectorAll('.creative')).toHaveLength(0);
      expect(element.children).toHaveLength(1);
    }
    finally {
      slot.dispose();
    }
  });

  it('should issue a separate request when the slot name changes while a request is still in flight', async () => {
    const element = document.createElement('div');

    document.body.appendChild(element);

    mediaQueryMock.useMediaQuery('(max-width: 767px)');

    const requestedNames: Array<string> = [];

    vi.mocked(requestAd).mockImplementation(async ({ slot: requestedSlot }) => {
      requestedNames.push(requestedSlot.name);

      // Never settles, so the request for the previous name is still in flight when the name changes.
      return new Promise(() => {});
    });

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

    try {
      await vi.waitFor(() => {
        expect(requestedNames).toEqual(['foo-skyscraper']);
      }, { timeout: 2000, interval: 10 });

      mediaQueryMock.clear();
      mediaQueryMock.useMediaQuery('(min-width: 768px)');

      // The in-flight request was for the old name, so it must not be reused for the new one.
      await vi.waitFor(() => {
        expect(requestedNames).toEqual(['foo-skyscraper', 'foo-leaderboard']);
      }, { timeout: 2000, interval: 10 });
    }
    finally {
      slot.dispose();
    }
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

    function createContainingElement(id = 'leaderboard'): HTMLElement {
      const element = document.createElement('div');

      element.classList.add('adunit');
      element.dataset.format = 'leaderboard';
      element.id = id;

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

    async function waitForFiredPixels(url: string, times: number): Promise<void> {
      // The viewability pixel fires after a real setTimeout (the configured dwell duration), so poll for it
      // instead of a fixed sleep — a fixed wait is flaky under CI load and, worse, leaves a slot's assertions
      // failing before it reaches `slot.dispose()`, letting its pending timer fire later and contaminate a
      // later test.
      await vi.waitFor(() => {
        expect(countFiredPixels(url)).toBe(times);
      }, { timeout: 2000, interval: 20 });
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

      try {
        await vi.waitFor(() => {
          expect(slot.status).toBe('rendered');
        }, { timeout: 2000, interval: 20 });

        await waitForFiredPixels('https://foo.bar/impression', 1);
        await waitForFiredPixels('https://foo.bar/additional', 1);
        await waitForFiredPixels('https://foo.bar/viewable', 1);

        containingElement.remove();

        await awaitTimeout(100);

        createContainingElement();

        await awaitTimeout(100);

        // Asserting the pixels did *not* fire a second time, so these stay fixed waits.
        expect(slot.status).toBe('rendered');
        expect(countFiredPixels('https://foo.bar/impression')).toBe(1);
        expect(countFiredPixels('https://foo.bar/additional')).toBe(1);
        expect(countFiredPixels('https://foo.bar/viewable')).toBe(1);
      }
      finally {
        slot.dispose();
      }
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
      createContainingElement('leaderboard-empty-onrequest');

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
        containingElement: 'leaderboard-empty-onrequest',
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

      try {
        await vi.waitFor(() => {
          expect(slot.status).toBe('rendered');
        }, { timeout: 2000, interval: 20 });

        // onEmpty fires synchronously from within the onRequest hook, not deferred until the slot renders.
        expect(onEmptyCallOrder).toBe(requestHookCallOrder + 1);
        expect(slot.isEmpty).toBe(true);
        expect(slot.element?.innerHTML).toBe('');
        expect(onEmpty).toHaveBeenCalledTimes(1);
        expect(onRender).not.toHaveBeenCalled();
        await waitForFiredPixels('https://foo.bar/impression-empty-onrequest', 1);
        await waitForFiredPixels('https://foo.bar/viewable-empty-onrequest', 1);
      }
      finally {
        slot.dispose();
      }
    });

    it('should track the position but not render a creative when onBeforeRender identifies the ad as empty', async () => {
      createContainingElement('leaderboard-empty-onbeforerender');

      const onEmpty = vi.fn();
      const onRender = vi.fn();

      const emptyAd: AdheseAd = {
        ...createAd('-empty-onbeforerender'),
        tag: '<title>Empty</title>',
      };

      const slot = createSlot({
        format: 'leaderboard',
        containingElement: 'leaderboard-empty-onbeforerender',
        context,
        initialData: emptyAd,
        setup(_slotContext, hooks) {
          hooks.onBeforeRender(ad => (getAdTitle(ad) === 'Empty' ? false as unknown as AdheseAd : ad));
          hooks.onEmpty(onEmpty);
          hooks.onRender(onRender);
        },
      });

      try {
        await vi.waitFor(() => {
          expect(slot.status).toBe('rendered');
        }, { timeout: 2000, interval: 20 });

        expect(slot.isEmpty).toBe(true);
        expect(slot.element?.innerHTML).toBe('');
        expect(onEmpty).toHaveBeenCalledTimes(1);
        expect(onRender).not.toHaveBeenCalled();
        await waitForFiredPixels('https://foo.bar/impression-empty-onbeforerender', 1);
        await waitForFiredPixels('https://foo.bar/viewable-empty-onbeforerender', 1);
      }
      finally {
        slot.dispose();
      }
    });

    it('should not overwrite a fallback the app rendered itself when the ad is empty', async () => {
      createContainingElement('leaderboard-empty-fallback');

      const emptyAd: AdheseAd = {
        ...createAd('-empty-fallback'),
        tag: '<title>Empty</title>',
      };

      const slot = createSlot({
        format: 'leaderboard',
        containingElement: 'leaderboard-empty-fallback',
        context,
        initialData: emptyAd,
        setup(slotContext, hooks) {
          hooks.onRequest((ad) => {
            if (getAdTitle(ad) === 'Empty') {
              // Fires `onEmpty` as soon as the ad is known to be empty. The slot's `element` isn't
              // necessarily resolved yet at this point (e.g. on the very first request), so a fallback
              // that needs the DOM element is rendered from `onBeforeRender` below instead, which is
              // guaranteed to run with `element` resolved, right before the slot would otherwise render.
              slotContext.value?.processOnEmpty(ad);
            }

            return ad;
          });
          hooks.onBeforeRender((ad) => {
            if (slotContext.value?.isEmpty && slotContext.value.element) {
              slotContext.value.element.innerHTML = '<div class="fallback">No ad available</div>';
            }

            return ad;
          });
        },
      });

      try {
        await vi.waitFor(() => {
          expect(slot.status).toBe('rendered');
        }, { timeout: 2000, interval: 20 });

        expect(slot.isEmpty).toBe(true);
        expect(slot.element?.innerHTML).toContain('No ad available');
      }
      finally {
        slot.dispose();
      }
    });

    it('should fire onEmpty and reach the empty status without tracking anything when no ad is returned at all', async () => {
      createContainingElement('leaderboard-empty-no-ad');

      const onEmpty = vi.fn();
      const onRender = vi.fn();

      const slot = createSlot({
        format: 'leaderboard',
        containingElement: 'leaderboard-empty-no-ad',
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

      try {
        await vi.waitFor(() => {
          expect(slot.status).toBe('empty');
        }, { timeout: 2000, interval: 20 });

        expect(slot.isEmpty).toBe(true);
        expect(onEmpty).toHaveBeenCalledTimes(1);
        expect(onRender).not.toHaveBeenCalled();
        expect(vi.mocked(addTrackingPixel)).not.toHaveBeenCalled();
      }
      finally {
        slot.dispose();
      }
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
