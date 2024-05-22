import {
  type Ref,
  type UnwrapRef,
  addTrackingPixel,
  computed,
  effectScope,
  reactive,
  ref,
  uniqueId,
  waitForDomLoad,
  watch,
} from '@adhese/sdk-shared';
import { doNothing, isDeepEqual } from 'remeda';
import type { AdheseAd } from '@adhese/sdk';
import { requestAd as extRequestAd } from '../requestAds/requestAds';
import { logger } from '../logger/logger';
import { useQueryDetector } from '../queryDetector/queryDetector';
import type { AdheseSlot, AdheseSlotOptions, RenderMode } from './slot.types';
import { generateName, renderIframe, renderInline } from './slot.utils';
import {
  useDomLoaded,
  useRenderIntersectionObserver,
  useSlotHooks,
  useViewabilityObserver,
} from './slot.composables';

const renderFunctions: Record<RenderMode, (ad: AdheseAd, element: HTMLElement) => void> = {
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
    const slotContext = ref<AdheseSlot | null>(null);
    const options = slotOptions.context.hooks.runOnSlotCreate({
      ...defaultOptions,
      ...slotOptions,
    });

    const {
      containingElement,
      slot,
      context,
      renderMode = 'iframe',
      type = 'normal',
    } = options;

    const id = uniqueId();
    const {
      runOnBeforeRender,
      runOnRender,
      runOnBeforeRequest,
      runOnRequest,
      runOnDispose,
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

    context.hooks.onInit(async () => {
      status.value = 'initialized';

      if (options.lazyLoading)
        return;

      data.value = await slotContext.value?.request() ?? null;
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
    const isImpressionTracked = computed(() => Boolean(impressionTrackingPixelElement.value));

    async function request(): Promise<AdheseAd | null> {
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

    async function render(adToRender?: AdheseAd): Promise<HTMLElement | null> {
      status.value = 'rendering';

      await waitForDomLoad();

      let renderAd = adToRender ?? data.value ?? originalData.value ?? await request();

      renderAd = renderAd && await runOnBeforeRender(renderAd);

      if (!renderAd) {
        status.value = 'empty';
        logger.debug(`No ad to render for slot ${name.value}`);

        return null;
      }

      renderAd = await runOnRender(renderAd);

      if (!element.value) {
        const error = `Could not create slot for format ${format.value}. No element found.`;
        logger.error(error, options);
        throw new Error(error);
      }

      if (context.debug)
        element.value.style.position = 'relative';

      if (typeof renderAd?.tag !== 'string') {
        const error = `Could not render slot for slot ${name.value}. A valid tag doesn't exist or is not HTML string.`;
        logger.error(error, options);

        status.value = 'error';
        throw new Error(error);
      }

      renderFunctions[renderMode](renderAd, element.value);

      if (renderAd.impressionCounter && !impressionTrackingPixelElement.value) {
        impressionTrackingPixelElement.value = addTrackingPixel(renderAd.impressionCounter);

        logger.debug(`Impression tracking pixel fired for ${name.value}`);
      }

      logger.debug('Slot rendered', {
        renderedElement: element,
        location: context.location,
        format,
        containingElement,
      });

      // eslint-disable-next-line require-atomic-updates
      data.value = renderAd;

      status.value = 'rendered';

      return element.value;
    }

    function cleanElement(): void {
      if (!element.value)
        return;

      element.value.innerHTML = '';
      element.value.style.position = '';
      element.value.style.width = '';
      element.value.style.height = '';

      data.value = null;
      originalData.value = null;
    }

    function dispose(): void {
      cleanElement();

      impressionTrackingPixelElement.value?.remove();

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
      render,
      request,
      dispose,
      cleanElement,
      ...hooks,
    });

    watch(state, (newState) => {
      slotContext.value = newState;
    }, {
      deep: true,
      immediate: true,
    });

    return state;
  })!;
}
