import {
  type ComputedRef,
  type Ref,
  computed,
  createAsyncHook,
  createPassiveHook,
  ref,
  waitForDomLoad,
  watch,
} from '@adhese/sdk-shared';
import type { AdheseAd, AdheseContext, AdheseSlot, AdheseSlotOptions } from '@adhese/sdk';
import { round } from 'remeda';
import type { SlotHooks } from './slot.types';

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
  hooks: SlotHooks;
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
    hooks: SlotHooks;
    onTracked?(trackingPixel: Ref<HTMLImageElement | null>): void;
  },
): ComputedRef<boolean> {
  let timeoutId: number | null = null;
  const {
    threshold,
    duration,
    rootMargin,
  } = {
    threshold: 0.2,
    duration: 1000,
    rootMargin: '0px',
    ...context.options.viewabilityTrackingOptions,
  } satisfies Required<typeof context.options.viewabilityTrackingOptions>;

  const trackingPixel = ref<HTMLImageElement | null>(null);

  const isTracked = computed(() => Boolean(trackingPixel.value));

  const viewabilityObserver = new IntersectionObserver(([entry]) => {
    if (context.options.viewabilityTracking && !trackingPixel.value) {
      const ratio = round(entry.intersectionRatio, 1);

      if (ratio >= threshold && !timeoutId) {
        // @ts-expect-error The is misfiring to the Node type
        timeoutId = setTimeout(() => {
          timeoutId = null;

          onTracked?.(trackingPixel);
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

  return isTracked;
}

export function useSlotHooks({ setup }: AdheseSlotOptions, slotContext: Ref<AdheseSlot | null>): {
  runOnBeforeRender: ReturnType<typeof createAsyncHook<AdheseAd>>[0];
  runOnRender: ReturnType<typeof createAsyncHook<AdheseAd>>[0];
  runOnBeforeRequest: ReturnType<typeof createAsyncHook<AdheseAd | null>>[0];
  runOnRequest: ReturnType<typeof createAsyncHook<AdheseAd>>[0];
  runOnDispose: ReturnType<typeof createPassiveHook<void>>[0];
} & SlotHooks {
  const [runOnBeforeRender, onBeforeRender, disposeOnBeforeRender] = createAsyncHook<AdheseAd>();
  const [runOnRender, onRender, disposeOnRender] = createAsyncHook<AdheseAd>();
  const [runOnBeforeRequest, onBeforeRequest, disposeOnBeforeRequest] = createAsyncHook<AdheseAd | null>();
  const [runOnRequest, onRequest, disposeOnRequest] = createAsyncHook<AdheseAd>();
  const [runOnDispose, onDispose, disposeOnDispose] = createPassiveHook();

  setup?.(slotContext, {
    onBeforeRender,
    onRender,
    onBeforeRequest,
    onDispose,
    onRequest,
  });

  onDispose(() => {
    disposeOnBeforeRender();
    disposeOnRender();
    disposeOnBeforeRequest();
    disposeOnRequest();
    disposeOnDispose();
  });

  return { runOnBeforeRender, runOnRender, runOnBeforeRequest, runOnRequest, runOnDispose, onDispose, onBeforeRequest, onRequest, onBeforeRender, onRender };
}
