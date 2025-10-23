import type { AdheseAd } from '@adhese/sdk';
import type {
  AdheseSlot,
  AdheseSlotContext,
  AdheseSlotOptions,
  RenderMode,
} from './slot.types';
import {
  addTrackingPixel,
  computed,
  doNothing,
  effectScope,
  generateName,
  omit,
  pick,
  reactive,
  type Ref,
  ref,
  renderIframe,
  renderInline,
  type RenderOptions,
  shallowRef,
  uniqueId,
  type UnwrapRef,
  waitForDomLoad,
  watch,
} from '@adhese/sdk-shared';
import { logger } from '../logger/logger';
import { useQueryDetector } from '../queryDetector/queryDetector';
import { requestAd as extRequestAd } from '../requestAds/requestAds';
import {
  useDomLoaded,
  useRenderIntersectionObserver,
  useSlotHooks,
  useViewabilityObserver,
} from './slot.composables';

const renderFunctions: Record<
  RenderMode,
  (ad: RenderOptions, element: HTMLElement) => void
> = {
  iframe: renderIframe,
  inline: renderInline,
  none: doNothing,
};

const defaultOptions = {
  renderMode: 'iframe',
  type: 'normal',
} satisfies Partial<AdheseSlotOptions>;

/**
 * Create a new slot instance. This slot instance can be used to request and render ads.
 *
 * @param slotOptions {AdheseSlotOptions} The options to create the slot with.
 *
 * @return AdheseSlot The created slot instance.
 */
export function createSlot(slotOptions: AdheseSlotOptions): AdheseSlot {
  const scope = effectScope();

  return scope.run(() => {
    const slotContext = ref<AdheseSlotContext | null>(null);
    const options = slotOptions.context.hooks.runOnSlotCreate({
      ...defaultOptions,
      ...(Object.fromEntries(
        Object.entries(slotOptions).filter(([, value]) => value !== undefined),
      ) as AdheseSlotOptions),
    });

    const {
      containingElement,
      slot,
      context,
      pluginOptions,
      initialData = null,
      type = 'normal',
    } = options;

    let { renderMode = 'iframe' } = options;

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

    const [device, disposeQueryDetector] = useQueryDetector(
      context,
      typeof options.format === 'string'
        ? {
            [options.format]: '(min-width: 0px)',
          }
        : Object.fromEntries(
          options.format.map(item => [item.format, item.query]),
        ),
    );

    const format = computed(() =>
      typeof options.format === 'string' ? options.format : device.value,
    );

    const data = ref<AdheseAd | null>(null) as Ref<AdheseAd | null>;
    const originalData = ref(data.value) as Ref<AdheseAd | null>;
    const name = computed(() =>
      generateName(options.context.location, format.value, options.slot),
    );

    const status = ref<UnwrapRef<AdheseSlot>['status']>('initializing');

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

    const isDomLoaded = useDomLoaded(context);

    const element = shallowRef<HTMLElement | null>(null);

    function getElement(): HTMLElement | null {
      if (
        !(
          typeof options.containingElement === 'string'
          || !options.containingElement
        )
      ) {
        return options.containingElement;
      }

      if (!isDomLoaded.value)
        return null;

      return document.querySelector<HTMLElement>(
        `#${options.containingElement}`,
      );
    }

    watch(element, async (newElement, oldElement) => {
      if (
        status.value === 'empty'
        || status.value === 'error'
        || status.value === 'loading'
      ) {
        return;
      }

      if (newElement === null && data.value) {
        status.value = 'loaded';

        return;
      }

      if (
        newElement === oldElement
        || (oldElement === null && newElement === null)
      ) {
        return;
      }

      await render();
    });

    const domObserver = new MutationObserver(() => {
      element.value = getElement();
    });

    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    watch(
      isDomLoaded,
      () => {
        element.value = getElement();
      },
      { immediate: true, deep: true },
    );

    const isInViewport = useRenderIntersectionObserver({
      options,
      element,
      hooks,
    });

    watch(
      isInViewport,
      async (newIsInViewport) => {
        if (newIsInViewport && status.value !== 'rendered')
          await slotContext.value?.render();
      },
      { immediate: true },
    );

    hooks.onDispose(() => {
      disposeQueryDetector();
    });

    const isViewabilityTracked = useViewabilityObserver({
      context,
      slotContext,
      hooks,
      onTracked(trackingPixel) {
        let viewabilityPixel;
        if (slotContext.value?.data?.origin === undefined) {
          context.logger.warn(
            `Origin not found for ${slotContext.value?.name}`,
          );
          return;
        }
        switch (slotContext.value?.data?.origin) {
          case 'DALE': {
            // @ts-expect-error - Data structure is not typed and very messy to type
            const seatbid = slotContext.value?.data?.originData?.seatbid;
            const bid = seatbid ? seatbid[0]?.bid[0] : undefined;
            viewabilityPixel = bid
              ? bid.ext?.adhese?.viewableImpressionCounter
              : undefined;
            break;
          }
          case 'JERLICIA':
            viewabilityPixel
              = slotContext.value?.data?.viewableImpressionCounter;
            break;
        }
        if (viewabilityPixel) {
          trackingPixel.value = addTrackingPixel(viewabilityPixel);
          context.logger.debug(
            `Viewability tracking pixel fired for ${slotContext.value?.name}`,
          );
          runOnViewableTracked(slotContext.value?.data);
        }
      },
    });

    const impressionTrackingPixelElement = ref<HTMLImageElement | null>(null);
    const additionalTrackingPixelElement = ref<HTMLImageElement | null>(null);
    const isImpressionTracked = ref(false);
    const isAdditionalTracked = ref(false);
    watch(
      [status, isInViewport, data],
      ([newStatus, newIsInViewport, newData]) => {
        if (newStatus === 'rendered' && newIsInViewport) {
          if (
            newData?.impressionCounter
            && !impressionTrackingPixelElement.value
          ) {
            impressionTrackingPixelElement.value = addTrackingPixel(
              newData.impressionCounter,
            );
            isImpressionTracked.value = true;
            context.logger.debug(
              `Impression tracking pixel fired for ${slotContext.value?.name}`,
            );
          }
          if (
            newData?.additionalTracker
            && !additionalTrackingPixelElement.value
          ) {
            additionalTrackingPixelElement.value = addTrackingPixel(
              newData.additionalTracker,
            );
            isAdditionalTracked.value = true;
            context.logger.debug(
              `Additional Impression tracking pixel fired for ${slotContext.value?.name}`,
            );
          }
          runOnImpressionTracked(newData);
        }
      },
      { immediate: true },
    );
    watch(status, async (newStatus, oldStatus) => {
      if (newStatus === 'loaded' && oldStatus === 'rendered') {
        impressionTrackingPixelElement.value?.remove();
        impressionTrackingPixelElement.value = null;
        additionalTrackingPixelElement.value?.remove();
        additionalTrackingPixelElement.value = null;
      }
    });
    hooks.onDispose(() => {
      if (impressionTrackingPixelElement.value)
        impressionTrackingPixelElement.value.remove();
      if (additionalTrackingPixelElement.value)
        additionalTrackingPixelElement.value.remove();
    });

    async function request(): Promise<AdheseAd | null> {
      try {
        if (options.lazyLoading && !isInViewport.value)
          return null;

        status.value = 'loading';

        let response = await runOnBeforeRequest(null);

        if (!response) {
          response = await extRequestAd({
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

        if (!response)
          cleanElement();

        if (response && context.options.eagerRendering && element.value)
          await render(response);

        return response;
      }
      catch (error) {
        status.value = 'error';

        logger.error(`Error requesting ad for slot ${name.value}`, error);

        runOnError(
          new Error(`Error requesting ad for slot ${name.value}`, {
            cause: error,
          }),
        );

        return null;
      }
    }

    async function render(adToRender?: AdheseAd): Promise<HTMLElement | null> {
      if (
        status.value === 'empty'
        || status.value === 'error'
        || status.value === 'initializing'
      ) {
        return null;
      }

      try {
        if (options.lazyLoading && !isInViewport.value)
          return null;

        status.value = 'rendering';
        await waitForDomLoad();
        element.value = getElement();

        let renderAd
          = adToRender ?? data.value ?? originalData.value ?? (await request());

        renderAd = renderAd && (await runOnBeforeRender(renderAd));

        renderMode = renderAd?.renderMode ?? renderMode;

        if (!element.value && renderMode !== 'none') {
          logger.debug(
            `Could not render slot for format ${format.value}. No element found.`,
            slotContext.value,
          );

          return null;
        }

        if (!renderAd) {
          return null;
        }

        if (typeof renderAd?.tag !== 'string' && renderMode !== 'none') {
          const error = `Could not render slot for slot ${name.value}. A valid tag doesn't exist or is not HTML string.`;
          logger.error(error, options);

          throw new Error(error);
        }

        if (renderMode !== 'none' && element.value) {
          renderFunctions[renderMode](
            {
              ...renderAd,
              ...pick(options, ['width', 'height']),
            } as RenderOptions,
            element.value,
          );
        }

        logger.debug(`Slot rendered ${name.value}`, {
          renderedElement: element,
          location: context.location,
          format,
          containingElement,
        });

        // eslint-disable-next-line require-atomic-updates
        status.value = 'rendered';

        runOnRender(renderAd);

        return element.value;
      }
      catch (error) {
        // eslint-disable-next-line require-atomic-updates
        status.value = 'error';

        logger.error(`${error}`, options);

        runOnError(new Error(error as string));

        return null;
      }
    }

    function processOnEmpty(): void {
      status.value = 'empty';
      logger.debug(`No ad to render for slot ${name.value}`);
      runOnEmpty();
    }

    function cleanElement(): void {
      if (!element.value || renderMode === 'none')
        return;

      element.value.innerHTML = '';
      element.value.style.position = '';
    }

    function dispose(): void {
      cleanElement();

      element.value = null;

      data.value = null;
      originalData.value = null;

      domObserver.disconnect();

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
      element,
      isDisposed,
      id,
      pluginOptions,
      isVisible: isInViewport,
      render,
      request,
      dispose,
      processOnEmpty,
      cleanElement,
      options: omit(options, ['context']),
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

      if (options.lazyLoading) {
        return;
      }

      data.value = (await slotContext.value?.request()) ?? null;
    });

    return state;
  })!;
}
