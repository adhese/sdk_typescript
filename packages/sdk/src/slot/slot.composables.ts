import type { AdheseAd, AdheseContext, AdheseSlot, AdheseSlotContext, AdheseSlotHooks, AdheseSlotOptions } from '@adhese/sdk';
import {
  createAsyncHook,
  createPassiveHook,
  type Ref,
  ref,
  round,
  waitForDomLoad,
  watch,
} from '@adhese/sdk-shared';

export function useDomLoaded(context: AdheseContext): Readonly<Ref<boolean>> {
  const isDomLoaded = ref(false);

  context.hooks.onInit(async () => {
    await waitForDomLoad();

    isDomLoaded.value = true;
  });
  return isDomLoaded;
}

export function useRenderIntersectionObserver({ options, element, hooks }: {
  options: AdheseSlotOptions;
  element: Ref<HTMLElement | null>;
  hooks: AdheseSlotHooks;
}): Ref<boolean> {
  const isInViewport = ref(false);

  const renderIntersectionObserver = new IntersectionObserver((entries) => {
    isInViewport.value = entries.some(entry => entry.isIntersecting);
  }, {
    rootMargin: options.lazyLoadingOptions?.rootMargin ?? '200px',
    threshold: 0,
  });

  function observe(newElement: HTMLElement | null, oldElement?: HTMLElement | null): () => void {
    if (oldElement)
      renderIntersectionObserver.unobserve(oldElement);

    if (newElement)
      renderIntersectionObserver.observe(newElement);

    return () => {
      if (newElement)
        renderIntersectionObserver.unobserve(newElement);
    };
  }

  watch(element, observe);
  observe(element.value);

  hooks.onDispose(() => {
    renderIntersectionObserver.disconnect();
  });

  return isInViewport;
}

export function useViewabilityObserver(
  { context, slotContext, hooks, onTracked }: {
    context: AdheseContext;
    slotContext: Ref<AdheseSlot | null>;
    hooks: AdheseSlotHooks;
    onTracked?(trackingPixel: Ref<HTMLImageElement | null>): void;
  },
): Ref<boolean> {
  let timeoutId: number | null = null;
  const {
    threshold,
    duration,
    rootMargin,
  } = {
    threshold: 0.5,
    duration: 1000,
    rootMargin: '0px',
    ...context.options.viewabilityTrackingOptions,
  } satisfies Required<typeof context.options.viewabilityTrackingOptions>;

  const trackingPixel = ref<HTMLImageElement | null>(null);

  const isTracked = ref(false);

  const viewabilityObserver = new IntersectionObserver(([entry]) => {
    if (context.options.viewabilityTracking && !trackingPixel.value) {
      const ratio = round(entry.intersectionRatio, 1);

      if (ratio >= threshold && !timeoutId) {
        // @ts-expect-error The is misfiring to the Node type
        timeoutId = setTimeout(() => {
          timeoutId = null;

          onTracked?.(trackingPixel);

          isTracked.value = true;
        }, duration);
      }
      else if (ratio < threshold && timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }
  }, {
    rootMargin,
    threshold: Array.from({ length: 11 }, (_, i) => i * 0.1),
  });

  function observe(newElement: HTMLElement | null, oldElement?: HTMLElement | null): () => void {
    if (oldElement)
      viewabilityObserver.unobserve(oldElement);

    if (newElement && context.options.viewabilityTracking)
      viewabilityObserver.observe(newElement);

    return () => {
      if (newElement)
        viewabilityObserver.unobserve(newElement);
    };
  }

  watch(() => slotContext.value?.element, (element) => {
    if (element)
      observe(element);
  }, { immediate: true });

  watch(slotContext, (slot) => {
    if (slot?.element)
      viewabilityObserver.observe(slot.element);
  }, { once: true });

  hooks.onDispose(() => {
    trackingPixel.value?.remove();
    viewabilityObserver.disconnect();
  });

  watch(() => slotContext.value?.status, async (newStatus, oldStatus) => {
    if (newStatus === 'loaded' && oldStatus === 'rendered') {
      trackingPixel.value?.remove();
      trackingPixel.value = null;
    }
  });

  return isTracked;
}

export function useSlotHooks({ setup }: AdheseSlotOptions, slotContext: Ref<AdheseSlotContext | null>): {
  runOnBeforeRender: ReturnType<typeof createAsyncHook<AdheseAd>>[0];
  runOnRender: ReturnType<typeof createPassiveHook<AdheseAd>>[0];
  runOnBeforeRequest: ReturnType<typeof createAsyncHook<AdheseAd | null>>[0];
  runOnRequest: ReturnType<typeof createAsyncHook<AdheseAd>>[0];
  runOnInit: ReturnType<typeof createAsyncHook<void>>[0];
  runOnDispose: ReturnType<typeof createPassiveHook<void>>[0];
  runOnEmpty: ReturnType<typeof createPassiveHook<void>>[0];
  runOnError: ReturnType<typeof createPassiveHook<Error>>[0];
} & AdheseSlotHooks {
  const [runOnBeforeRender, onBeforeRender, disposeOnBeforeRender] = createAsyncHook<AdheseAd>();
  const [runOnRender, onRender, disposeOnRender] = createPassiveHook<AdheseAd>();
  const [runOnBeforeRequest, onBeforeRequest, disposeOnBeforeRequest] = createAsyncHook<AdheseAd | null>();
  const [runOnRequest, onRequest, disposeOnRequest] = createAsyncHook<AdheseAd>();
  const [runOnInit, onInit, disposeOnInit] = createAsyncHook();
  const [runOnDispose, onDispose, disposeOnDispose] = createPassiveHook();
  const [runOnEmpty, onEmpty, disposeOnEmpty] = createPassiveHook();
  const [runOnError, onError, disposeOnError] = createPassiveHook<Error>();

  setup?.(slotContext, {
    onBeforeRender,
    onRender,
    onBeforeRequest,
    onDispose,
    onRequest,
    onInit,
    onEmpty,
    onError,
  });

  onDispose(() => {
    disposeOnBeforeRender();
    disposeOnRender();
    disposeOnBeforeRequest();
    disposeOnRequest();
    disposeOnInit();
    disposeOnDispose();
    disposeOnEmpty();
    disposeOnError();
  });

  return { runOnBeforeRender, runOnRender, runOnBeforeRequest, runOnRequest, runOnDispose, onDispose, onBeforeRequest, onRequest, onBeforeRender, onRender, onInit, runOnInit, runOnEmpty, onEmpty, runOnError, onError };
}
