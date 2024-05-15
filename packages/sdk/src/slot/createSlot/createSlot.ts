import {
  computed,
  effectScope,
  reactive,
  ref,
  waitForDomLoad,
  watch,
} from '@adhese/sdk-shared';
import { doNothing, isDeepEqual } from 'remeda';
import type { AdheseAd, AdheseSlot, AdheseSlotOptions } from '@adhese/sdk';
import { addTrackingPixel } from '../../impressionTracking/impressionTracking';
import { onInit, waitOnInit } from '../../hooks/onInit';
import { requestAd as extRequestAd } from '../../requestAds/requestAds';
import { runOnSlotCreate } from '../../hooks/onSlotCreate';
import { logger } from '../../logger/logger';
import type { BaseSlot, BaseSlotOptionsWithSetup, RenderMode } from '../slot.types';
import { renderIframe, renderInline } from './createSlot.utils';
import {
  useBaseSlot,
  useViewabilityObserver,
} from './createSlot.hooks';

const renderFunctions: Record<RenderMode, (ad: AdheseAd, element: HTMLElement) => void> = {
  iframe: renderIframe,
  inline: renderInline,
  none: doNothing,
};

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
    const options = runOnSlotCreate(slotOptions as BaseSlotOptionsWithSetup<BaseSlot>);

    const {
      containingElement,
      slot,
      context,
      renderMode = 'iframe',
    } = options;
    const {
      name,
      format,
      element,
      parameters,
      isInViewport,
      status,
      runOnSlotRender,
      runOnDispose,
      runOnRequest,
      id,
      isDisposed,
      ...hooks
    } = useBaseSlot<AdheseSlot, AdheseAd>({
      options,
      slotContext,
    });

    const ad = ref<AdheseAd | null>(null);
    const originalAd = ref(ad.value);

    watch(name, async (newName, oldName) => {
      if (newName === oldName)
        return;

      const newAd = await request();

      cleanElement();

      ad.value = newAd;
      originalAd.value = newAd;
    });

    watch([ad, isInViewport], async ([newAd, newIsInViewport], [oldAd]) => {
      if ((!newAd || (oldAd && isDeepEqual(newAd, oldAd))) && status.value === 'rendered')
        return;

      if (newIsInViewport)
        await render(newAd ?? undefined);
    });

    const isViewabilityTracked = useViewabilityObserver({
      context,
      slotContext,
      hooks,
      onTracked(trackingPixel) {
        if (slotContext.value?.ad?.viewableImpressionCounter) {
          trackingPixel.value = addTrackingPixel(slotContext.value?.ad?.viewableImpressionCounter);

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

      await runOnRequest();

      const response = await extRequestAd({
        slot: {
          name: name.value,
          parameters,
        },
        context,
      });

      ad.value = response;

      if (!originalAd.value)
        originalAd.value = response;

      status.value = response ? 'loaded' : 'empty';

      if (!response)
        cleanElement();

      return response;
    }

    async function render(adToRender?: AdheseAd): Promise<HTMLElement | null> {
      status.value = 'rendering';

      await waitForDomLoad();
      await waitOnInit;

      let renderAd = adToRender ?? ad.value ?? originalAd.value ?? await request();

      if (!renderAd) {
        status.value = 'empty';
        logger.debug(`No ad to render for slot ${name.value}`);

        return null;
      }

      renderAd = options.onBeforeRender?.(renderAd) ?? renderAd;

      renderAd = await runOnSlotRender(renderAd);

      if (!element.value) {
        const error = `Could not create slot for format ${format.value}. No element found.`;
        logger.error(error, options);
        throw new Error(error);
      }

      if (context.debug)
        element.value.style.position = 'relative';

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

      options.onRender?.(element.value);

      // eslint-disable-next-line require-atomic-updates
      ad.value = renderAd;

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

      ad.value = null;
      originalAd.value = null;
    }

    function dispose(): void {
      cleanElement();

      impressionTrackingPixelElement.value?.remove();

      ad.value = null;

      runOnDispose();

      isDisposed.value = true;

      scope.stop();
    }

    onInit(async () => {
      status.value = 'initialized';

      if (options.lazyLoading)
        return;

      ad.value = await request();
    });

    const state = reactive({
      location: context.location ?? '',
      lazyLoading: options.lazyLoading ?? false,
      slot,
      parameters,
      format,
      name,
      ad,
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
