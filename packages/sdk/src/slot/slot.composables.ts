import {
  type ComputedRef,
  type Ref,
  type UnwrapRef,
  computed,
  reactive,
  ref,
  uniqueId,
  waitForDomLoad,
  watch,
} from '@adhese/sdk-shared';
import type { AdheseContext, AdheseSlot } from '@adhese/sdk';
import { isDeepEqual, round } from 'remeda';
import { onInit } from '../hooks/onInit';
import { createAsyncHook, createPassiveHook } from '../hooks/createHook';
import { useQueryDetector } from '../queryDetector/queryDetector';
import type { BaseSlot, BaseSlotOptions, BaseSlotOptionsWithSetup, SlotHooks } from './slot.types';
import { generateName } from './slot.utils';

export function useDomLoaded(): Readonly<Ref<boolean>> {
  const isDomLoaded = ref(false);

  onInit(async () => {
    await waitForDomLoad();

    isDomLoaded.value = true;
  });
  return isDomLoaded;
}

export function useRenderIntersectionObserver<T>({ options, element, hooks }: {
  options: BaseSlotOptions;
  element: Ref<HTMLElement | null>;
  hooks: SlotHooks<T>;
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

export function useViewabilityObserver<
  T extends BaseSlot<U>,
  U
,>(
  { context, slotContext, hooks, onTracked }: {
    context: AdheseContext;
    slotContext: Ref<T | null>;
    hooks: SlotHooks<U>;
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

export function useSlotHooks<T extends BaseSlot<U>, U>({ setup }: BaseSlotOptionsWithSetup<T, U>, slotContext: Ref<T | null>, id: string): {
  runOnBeforeRender: ReturnType<typeof createAsyncHook<U>>[0];
  runOnSlotRender: ReturnType<typeof createAsyncHook<U>>[0];
  runOnRequest: ReturnType<typeof createAsyncHook<void>>[0];
  runOnDispose: ReturnType<typeof createPassiveHook<void>>[0];
} & SlotHooks<U> {
  const [runOnBeforeRender, onBeforeRender, disposeOnBeforeRender] = createAsyncHook<U>(`onBeforeRender:${id}`);
  const [runOnSlotRender, onRender, disposeOnRender] = createAsyncHook<U>(`onRender:${id}`);
  const [runOnRequest, onRequest, disposeOnRequest] = createAsyncHook(`onRequest:${id}`);
  const [runOnDispose, onDispose, disposeOnDispose] = createPassiveHook(`onDispose:${id}`);

  setup?.(slotContext, {
    onBeforeRender,
    onRender,
    onDispose,
    onRequest,
  });

  onDispose(() => {
    disposeOnBeforeRender();
    disposeOnRender();
    disposeOnRequest();
    disposeOnDispose();
  });

  return { runOnBeforeRender, runOnSlotRender, runOnRequest, runOnDispose, onDispose, onRequest, onBeforeRender, onRender };
}

export function useBaseSlot<
  T extends BaseSlot<U>,
  U,
>(
  {
    options,
    slotContext,
  }: {
    options: BaseSlotOptions;
    slotContext: Ref<T | null>;
  },
): {
  name: ComputedRef<string>;
  format: ComputedRef<string>;
  element: ComputedRef<HTMLElement | null>;
  parameters: Map<string, ReadonlyArray<string> | string>;
  isInViewport: Ref<boolean>;
  status: Ref<UnwrapRef<T>['status']>;
  id: string;
  isDisposed: Ref<boolean>;
  data: Ref<U | null>;
  originalData: Ref<U | null>;
} & ReturnType<typeof useSlotHooks<T, U>> {
  const id = uniqueId();
  const hooks = useSlotHooks<T, U>(options, slotContext, id);

  const isDisposed = ref(false);
  const parameters = reactive(new Map(Object.entries(options.parameters ?? {})));

  const [device, disposeQueryDetector] = useQueryDetector(typeof options.format === 'string'
    ? {
        [options.format]: '(min-width: 0px)',
      }
    : Object.fromEntries(options.format.map(item => [item.format, item.query])));

  const format = computed(() => typeof options.format === 'string' ? options.format : device.value);

  const data = ref<T | null>(null) as Ref<U | null>;
  const originalData = ref(data.value) as Ref<U | null>;
  const name = computed(() => generateName(options.context.location, format.value, options.slot));

  watch(name, async (newName, oldName) => {
    if (newName === oldName)
      return;

    const newAd = await slotContext.value?.request();

    if (!newAd)
      return;

    slotContext.value?.cleanElement();

    data.value = newAd;
    originalData.value = newAd;
  });

  const isDomLoaded = useDomLoaded();

  const element = computed(() => {
    if (!(typeof options.containingElement === 'string' || !options.containingElement))
      return options.containingElement;

    if (!isDomLoaded.value || slotContext.value?.isDisposed)
      return null;

    return document.querySelector<HTMLElement>(`.adunit[data-format="${format.value}"]#${options.containingElement}${options.slot ? `[data-slot="${options.slot}"]` : ''}`);
  },
  );

  const isInViewport = useRenderIntersectionObserver({
    options,
    element,
    hooks,
  });

  const status = ref<UnwrapRef<AdheseSlot>['status']>('initializing');

  watch([data, isInViewport], async ([newData, newIsInViewport], [oldData]) => {
    if ((!newData || (oldData && isDeepEqual(newData, oldData))) && status.value === 'rendered')
      return;

    if (newIsInViewport)
      await slotContext.value?.render(newData ?? undefined);
  });

  hooks.onDispose(() => {
    disposeQueryDetector();
  });

  return {
    ...hooks,
    id,
    name,
    format,
    element,
    parameters,
    isInViewport,
    status,
    isDisposed,
    data,
    originalData,
  };
}
