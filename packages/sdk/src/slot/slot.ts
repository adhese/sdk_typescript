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
    const isEmpty = ref(false);
    // Ad stashed by `processOnEmpty(ad)` when `onRequest` identifies an ad's creative as empty. `request()`
    // rescues it into `data`/`originalData` so tracking pixels are still available once the slot renders.
    let emptyAdForTracking: AdheseAd | null = null;
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
      if (!context.options.eagerRendering && !oldElement) {
        return;
      }
      if (status.value === 'rendering' || status.value === 'rendered') {
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
        if (newIsInViewport && status.value !== 'rendered' && status.value !== 'rendering')
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

    const impressionTrackedAd = ref<AdheseAd | null>(null);
    const additionalTrackedAd = ref<AdheseAd | null>(null);

    watch(
      [status, isInViewport, data],
      ([newStatus, newIsInViewport, newData]) => {
        if (newStatus !== 'rendered' || !newIsInViewport)
          return;

        if (
          newData?.impressionCounter
          && impressionTrackedAd.value !== newData
        ) {
          impressionTrackingPixelElement.value?.remove();
          impressionTrackingPixelElement.value = addTrackingPixel(
            newData.impressionCounter,
          );
          impressionTrackedAd.value = newData;
          runOnImpressionTracked(newData);
          isImpressionTracked.value = true;
          context.logger.debug(
            `Impression tracking pixel fired for ${slotContext.value?.name}`,
          );
        }
        if (
          newData?.additionalTracker
          && additionalTrackedAd.value !== newData
        ) {
          additionalTrackingPixelElement.value?.remove();
          additionalTrackingPixelElement.value = addTrackingPixel(
            newData.additionalTracker,
          );
          additionalTrackedAd.value = newData;
          isAdditionalTracked.value = true;
          context.logger.debug(
            `Additional Impression tracking pixel fired for ${slotContext.value?.name}`,
          );
        }
      },
      { immediate: true },
    );
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
        isEmpty.value = false;
        emptyAdForTracking = null;

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

        if (!response && emptyAdForTracking) {
          // `onRequest` identified the ad as empty via `processOnEmpty(ad)`. Keep the original ad around so
          // it still reaches `render()`, where the position is tracked even though no creative is shown.
          response = emptyAdForTracking;
        }

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
        processOnError(error as string);
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

        if (adToRender) {
          // An explicit ad was passed in, overriding whatever the slot previously fetched. Don't carry over an
          // `isEmpty` flag from an earlier, unrelated ad.
          isEmpty.value = false;
        }

        let renderAd = adToRender ?? data.value ?? originalData.value ?? null;
        if (!renderAd) {
          renderAd = await request();
          if ((status.value as UnwrapRef<AdheseSlot>['status']) === 'rendered') {
            return element.value;
          }
        }

        const hadAdBeforeBeforeRenderHook = Boolean(renderAd);

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
          if (hadAdBeforeBeforeRenderHook) {
            // The ad was identified as empty by the `onBeforeRender` hook itself. The position is still
            // tracked as rendered, but no creative is written to the element. Whatever the app already put
            // in the element (e.g. a fallback rendered from `onEmpty`) is left untouched.
            markEmpty();
            // eslint-disable-next-line require-atomic-updates
            status.value = 'rendered';
            logger.debug(`Slot ${name.value} identified as empty by the onBeforeRender hook`, slotContext.value);

            return element.value;
          }

          return null;
        }

        if (isEmpty.value) {
          // The ad was already identified as empty earlier, typically via `processOnEmpty(ad)` from the
          // `onRequest` hook. The position is tracked as rendered, but no creative is written to the element.
          // Whatever the app already put in the element (e.g. a fallback rendered from `onEmpty`) is left
          // untouched.
          // eslint-disable-next-line require-atomic-updates
          status.value = 'rendered';

          return element.value;
        }

        if (typeof renderAd?.tag !== 'string' && renderMode !== 'none') {
          const error = `Could not render slot for slot ${name.value}. A valid tag doesn't exist or is not HTML string.`;
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
        processOnError(error as string);
        return null;
      }
    }

    function markEmpty(): void {
      if (isEmpty.value)
        return;

      isEmpty.value = true;
      runOnEmpty();
    }

    function processOnEmpty(ad?: AdheseAd): void {
      markEmpty();

      if (ad) {
        // An ad was returned, but its creative was identified as empty (e.g. a no-fill/house banner). Stash
        // it so `request()` can keep it alive for tracking once the slot renders, instead of treating this
        // as "no ad returned at all".
        emptyAdForTracking = ad;
        return;
      }

      status.value = 'empty';
      logger.debug(`No ad to render for slot ${name.value}`);
    }

    function processOnError(error: string): void {
      if (status.value !== 'error') {
        status.value = 'error';
        logger.error(error);
        runOnError(new Error(error, {
          cause: error,
        }));
      }
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
      isEmpty,
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
      processOnError,
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
        isEmpty.value = false;
        emptyAdForTracking = null;

        data.value = initialData;

        let response = await runOnRequest(initialData);

        if (!response && emptyAdForTracking) {
          // `onRequest` identified the ad as empty via `processOnEmpty(ad)`. Keep the original ad around so
          // it still reaches `render()`, where the position is tracked even though no creative is shown.
          response = emptyAdForTracking;
        }

        data.value = response;
        // eslint-disable-next-line require-atomic-updates
        status.value = response ? 'loaded' : 'empty';

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
