import type { AdheseAd, AdheseSlot, AdheseSlotContext, AdheseSlotOptions } from '@adhese/sdk/core';
import {
  computed,
  createAsyncHook,
  createPassiveHook,
  effectScope,
  generateName,
  reactive,
  type Ref,
  ref,
  type UnwrapRef,
  uniqueId,
  watch,
} from '@adhese/sdk-shared/core';
import { requestAd } from '@adhese/sdk/core';
import { fireTrackingPixel } from './tracking';

/**
 * Platform-specific slot hooks setup, mirroring the web version but without DOM dependencies.
 */
function useSlotHooks({ setup }: AdheseSlotOptions, slotContext: Ref<AdheseSlotContext | null>) {

  const [runOnBeforeRender, onBeforeRender, disposeOnBeforeRender] = createAsyncHook<AdheseAd>();
  const [runOnRender, onRender, disposeOnRender] = createPassiveHook<AdheseAd>();
  const [runOnBeforeRequest, onBeforeRequest, disposeOnBeforeRequest] = createAsyncHook<AdheseAd | null>();
  const [runOnRequest, onRequest, disposeOnRequest] = createAsyncHook<AdheseAd>();
  const [runOnInit, onInit, disposeOnInit] = createAsyncHook();
  const [runOnDispose, onDispose, disposeOnDispose] = createPassiveHook();
  const [runOnEmpty, onEmpty, disposeOnEmpty] = createPassiveHook();
  const [runOnError, onError, disposeOnError] = createPassiveHook<Error>();
  const [runOnImpressionTracked, onImpressionTracked, disposeOnImpressionTracked] = createAsyncHook<AdheseAd>();
  const [runOnViewableTracked, onViewableTracked, disposeOnViewableTracked] = createAsyncHook<AdheseAd>();

  setup?.(slotContext, {
    onBeforeRender,
    onRender,
    onBeforeRequest,
    onDispose,
    onRequest,
    onInit,
    onEmpty,
    onError,
    onImpressionTracked,
    onViewableTracked,
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
    disposeOnImpressionTracked();
    disposeOnViewableTracked();
  });

  return {
    runOnBeforeRender, runOnRender, runOnBeforeRequest, runOnRequest,
    runOnDispose, onDispose, onBeforeRequest, onRequest, onBeforeRender,
    onRender, onInit, runOnInit, runOnEmpty, onEmpty, runOnError, onError,
    runOnImpressionTracked, onImpressionTracked, runOnViewableTracked, onViewableTracked,
  };
}

/**
 * Create a React Native slot. This is a simplified version of the web slot
 * that doesn't use DOM APIs (MutationObserver, IntersectionObserver, etc.).
 *
 * Rendering is handled by the React Native component, not by the slot itself.
 */
export function createSlot(slotOptions: AdheseSlotOptions): AdheseSlot {
  const scope = effectScope();

  return scope.run(() => {
    const slotContext = ref<AdheseSlotContext | null>(null);
    const options = slotOptions.context.hooks.runOnSlotCreate({
      renderMode: 'none',
      type: 'normal',
      ...(Object.fromEntries(
        Object.entries(slotOptions).filter(([, value]) => value !== undefined),
      ) as AdheseSlotOptions),
    });

    const {
      context,
      slot,
      pluginOptions,
      initialData = null,
      type = 'normal',
    } = options;

    const id = uniqueId();
    const {
      runOnBeforeRender,
      runOnRender,
      runOnBeforeRequest,
      runOnRequest,
      runOnInit,
      runOnDispose,
      runOnEmpty,
      runOnError,
      runOnImpressionTracked,
      runOnViewableTracked,
      ...hooks
    } = useSlotHooks(options, slotContext);

    const isDisposed = ref(false);
    const parameters = reactive(
      new Map(Object.entries(options.parameters ?? {})),
    );

    const format = computed(() =>
      typeof options.format === 'string' ? options.format : options.format[0]?.format ?? 'unknown',
    );

    const data = ref<AdheseAd | null>(null) as Ref<AdheseAd | null>;
    const originalData = ref(data.value) as Ref<AdheseAd | null>;
    const name = computed(() =>
      generateName(options.context.location, format.value, options.slot),
    );

    const status = ref<UnwrapRef<AdheseSlot>['status']>('initializing');
    const isImpressionTracked = ref(false);
    const isViewabilityTracked = ref(false);
    let viewabilityTimer: ReturnType<typeof setTimeout> | null = null;

    /**
     * Resolve the viewable impression counter URL from ad data.
     * Handles both JERLICIA and DALE origin formats.
     */
    function getViewableImpressionCounter(ad: AdheseAd): string | URL | undefined {
      if (!ad.origin) return undefined;

      switch (ad.origin) {
        case 'DALE': {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const seatbid = (ad as any).originData?.seatbid;
          const bid = seatbid ? seatbid[0]?.bid[0] : undefined;
          return bid?.ext?.adhese?.viewableImpressionCounter;
        }
        case 'JERLICIA':
          return ad.viewableImpressionCounter;
        default:
          return ad.viewableImpressionCounter;
      }
    }

    // Track impressions when status changes to rendered
    watch(
      [status, data],
      ([newStatus, newData]) => {
        if (newStatus === 'rendered' && newData && !isImpressionTracked.value) {
          // Fire impression tracking pixel
          if (newData.impressionCounter) {
            fireTrackingPixel(newData.impressionCounter);
            context.logger.debug(`Impression tracking pixel fired for ${name.value}`);
          }

          // Fire additional tracker if present
          if (newData.additionalTracker) {
            fireTrackingPixel(newData.additionalTracker);
            context.logger.debug(`Additional tracking pixel fired for ${name.value}`);
          }

          runOnImpressionTracked(newData);
          isImpressionTracked.value = true;

          // Start viewability timer — in React Native we assume the ad is visible
          // once rendered (no IntersectionObserver). We use a 1-second delay to
          // approximate the IAB viewability standard (50% visible for 1 second).
          if (!isViewabilityTracked.value) {
            viewabilityTimer = setTimeout(() => {
              if (isDisposed.value || status.value !== 'rendered' || !data.value) return;

              const viewableCounter = getViewableImpressionCounter(data.value);
              if (viewableCounter) {
                fireTrackingPixel(viewableCounter);
                context.logger.debug(`Viewability tracking pixel fired for ${name.value}`);
              }

              runOnViewableTracked(data.value);
              isViewabilityTracked.value = true;
              viewabilityTimer = null;
            }, 1000);
          }
        }
      },
      { immediate: true },
    );

    // Reset tracking when ad data changes (new ad loaded)
    watch(status, (newStatus, oldStatus) => {
      if ((newStatus === 'loaded' && oldStatus === 'rendered') || (newStatus === 'loading' && oldStatus === 'rendered')) {
        isImpressionTracked.value = false;
        isViewabilityTracked.value = false;

        if (viewabilityTimer) {
          clearTimeout(viewabilityTimer);
          viewabilityTimer = null;
        }
      }
    });

    async function request(): Promise<AdheseAd | null> {
      try {
        status.value = 'loading';

        let response = await runOnBeforeRequest(null);

        if (!response) {
          response = await requestAd({
            slot: {
              name: name.value,
              parameters,
            },
            context,
          });
        }

        if (response)
          response = await runOnRequest(response);

        data.value = response;

        if (!originalData.value)
          originalData.value = response;

        status.value = response ? 'loaded' : 'empty';

        if (!response) {
          processOnEmpty();
        }

        return response;
      }
      catch (error) {
        processOnError(error as string);
        return null;
      }
    }

    async function render(adToRender?: AdheseAd): Promise<null> {
      if (
        status.value === 'empty'
        || status.value === 'error'
        || status.value === 'initializing'
      ) {
        return null;
      }

      try {
        status.value = 'rendering';

        let renderAd = adToRender ?? data.value ?? originalData.value ?? (await request());

        renderAd = renderAd && (await runOnBeforeRender(renderAd));

        if (!renderAd) {
          return null;
        }

        // In React Native, actual rendering is handled by the component.
        // We just update the status.
        status.value = 'rendered';

        runOnRender(renderAd);

        return null;
      }
      catch (error) {
        processOnError(error as string);
        return null;
      }
    }

    function processOnEmpty(): void {
      status.value = 'empty';
      runOnEmpty();
    }

    function processOnError(error: string): void {
      if (status.value !== 'error') {
        status.value = 'error';
        runOnError(new Error(error, {
          cause: error,
        }));
      }
    }

    function cleanElement(): void {
      // No-op in React Native - component handles its own rendering
    }

    function dispose(): void {
      cleanElement();

      if (viewabilityTimer) {
        clearTimeout(viewabilityTimer);
        viewabilityTimer = null;
      }

      data.value = null;
      originalData.value = null;

      runOnDispose();

      isDisposed.value = true;

      scope.stop();
    }

    const state = reactive({
      location: context.location ?? '',
      lazyLoading: options.lazyLoading ?? false,
      type,
      slot,
      parameters,
      format,
      name,
      data,
      isViewabilityTracked,
      isImpressionTracked,
      status,
      element: null as HTMLElement | null,
      isDisposed,
      id,
      pluginOptions,
      isVisible: true,
      render,
      request,
      dispose,
      processOnEmpty,
      processOnError,
      cleanElement,
      options: { ...options, context: undefined } as unknown as Omit<AdheseSlotOptions, 'context'>,
      ...hooks,
    });

    watch(
      state,
      (newState) => {
        slotContext.value = newState;
      },
      {
        deep: true,
        immediate: true,
      },
    );

    context.hooks.onInit(async () => {
      await runOnInit();

      if (status.value === 'empty' || status.value === 'error') {
        return;
      }

      if (initialData) {
        status.value = 'loaded';

        data.value = initialData;
        data.value = await runOnRequest(initialData);

        return;
      }

      status.value = 'initialized';

      data.value = (await slotContext.value?.request()) ?? null;
    });

    return state;
  })!;
}
