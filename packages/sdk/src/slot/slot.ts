import type { AdheseAd } from '@adhese/sdk';
import type { AdheseSlot, AdheseSlotContext, AdheseSlotOptions, RenderMode } from './slot.types';
import {
  addTrackingPixel,
  computed,
  doNothing,
  effectScope,
  generateName,
  isDeepEqual,
  omit,
  pick,
  reactive,
  type Ref,
  ref,
  renderIframe,
  renderInline,
  type RenderOptions,
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

const renderFunctions: Record<RenderMode, (ad: RenderOptions, element: HTMLElement) => void> = {
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
      ...(Object.fromEntries(Object.entries(slotOptions).filter(([,value]) => value !== undefined)) as AdheseSlotOptions),
    });

    const {
      containingElement,
      slot,
      context,
      pluginOptions,
      renderMode = 'iframe',
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
      ...hooks
    } = useSlotHooks(options, slotContext);

    const isDisposed = ref(false);
    const parameters = reactive(new Map(Object.entries(options.parameters ?? {})));

    const [device, disposeQueryDetector] = useQueryDetector(context, typeof options.format === 'string'
      ? {
          [options.format]: '(min-width: 0px)',
        }
      : Object.fromEntries(options.format.map(item => [item.format, item.query])));

    const format = computed(() => typeof options.format === 'string' ? options.format : device.value);

    const data = ref<AdheseAd | null>(null) as Ref<AdheseAd | null>;
    const originalData = ref(data.value) as Ref<AdheseAd | null>;
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

    const isDomLoaded = useDomLoaded(context);

    const element = computed(() => {
      if (!(typeof options.containingElement === 'string' || !options.containingElement))
        return options.containingElement;

      if (!isDomLoaded.value || slotContext.value?.isDisposed)
        return null;

      return document.querySelector<HTMLElement>(`#${options.containingElement}`);
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

    const isViewabilityTracked = useViewabilityObserver({
      context,
      slotContext,
      hooks,
      onTracked(trackingPixel) {
        if (slotContext.value?.data?.viewableImpressionCounter) {
          trackingPixel.value = addTrackingPixel(slotContext.value?.data?.viewableImpressionCounter);

          context.logger.debug(`Viewability tracking pixel fired for ${slotContext.value?.name}`);
        }
      },
    });

    const impressionTrackingPixelElement = ref<HTMLImageElement | null>(null);
    const isImpressionTracked = ref(false);
    hooks.onDispose(() => {
      if (impressionTrackingPixelElement.value)
        impressionTrackingPixelElement.value.remove();
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

        return response;
      }
      catch (error) {
        status.value = 'error';

        logger.error(`Error requesting ad for slot ${name.value}`, error);

        runOnError(new Error(`Error requesting ad for slot ${name.value}`, { cause: error }));

        return null;
      }
    }

    async function render(adToRender?: AdheseAd): Promise<HTMLElement | null> {
      try {
        status.value = 'rendering';

        await waitForDomLoad();

        let renderAd = adToRender ?? data.value ?? originalData.value ?? await request();

        renderAd = renderAd && await runOnBeforeRender(renderAd);

        if (!renderAd) {
          status.value = 'empty';
          logger.debug(`No ad to render for slot ${name.value}`);

          runOnEmpty();

          return null;
        }

        if (!element.value) {
          const error = `Could not create slot for format ${format.value}. No element found.`;
          logger.error(error, options);

          throw new Error(error);
        }

        if (typeof renderAd?.tag !== 'string') {
          const error = `Could not render slot for slot ${name.value}. A valid tag doesn't exist or is not HTML string.`;
          logger.error(error, options);

          throw new Error(error);
        }

        renderFunctions[renderMode]({
          ...renderAd,
          ...pick(options, ['width', 'height']),
        } as RenderOptions, element.value);

        if (renderAd.impressionCounter && !impressionTrackingPixelElement.value)
          impressionTrackingPixelElement.value = addTrackingPixel(renderAd.impressionCounter);

        isImpressionTracked.value = true;

        logger.debug(`Slot rendered ${name.value}`, {
          renderedElement: element,
          location: context.location,
          format,
          containingElement,
        });

        status.value = 'rendered';

        runOnRender(renderAd);

        return element.value;
      }
      catch (error) {
        status.value = 'error';

        logger.error(`${error}`, options);

        runOnError(new Error(error as string));

        return null;
      }
    }

    function cleanElement(): void {
      if (!element.value)
        return;

      element.value.innerHTML = '';
      element.value.style.position = '';

      data.value = null;
      originalData.value = null;
    }

    function dispose(): void {
      cleanElement();

      data.value = null;

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
      cleanElement,
      options: omit(options, ['context']),
      ...hooks,
    });

    watch(state, (newState) => {
      slotContext.value = newState;
    }, {
      deep: true,
      immediate: true,
    });

    context.hooks.onInit(async () => {
      status.value = 'initialized';

      runOnInit();

      if (options.lazyLoading)
        return;

      data.value = await slotContext.value?.request() ?? null;
    });

    return state;
  })!;
}
