import { type Ref, type UnwrapRef, computed, effectScope, reactive, ref, uniqueId, waitForDomLoad, watch } from '@adhese/sdk-shared';
import { doNothing, isDeepEqual } from 'remeda';
import type { AdheseAd } from '@adhese/sdk';
import { addTrackingPixel } from '../../impressionTracking/impressionTracking';
import { useQueryDetector } from '../../queryDetector/queryDetector';
import { onInit, waitOnInit } from '../../hooks/onInit';
import { requestAd as extRequestAd } from '../../requestAds/requestAds';
import { runOnSlotCreate } from '../../hooks/onSlotCreate';
import { logger } from '../../logger/logger';
import type { AdheseSlot, AdheseSlotOptions, RenderMode } from './createSlot.types';
import { generateName, renderIframe, renderInline } from './createSlot.utils';
import { useViewabilityObserver } from './useViewabilityObserver';
import { useRenderIntersectionObserver } from './useRenderIntersectionObserver';
import { useSlotHooks } from './useSlotHooks';

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

  const mergedOptions = {
    renderMode: 'iframe',
    ...slotOptions,
  } satisfies AdheseSlotOptions;

  return scope.run(() => {
    const slotContext = ref<AdheseSlot | null>(null);
    const options = runOnSlotCreate(mergedOptions);

    const id = uniqueId();

    const { runOnSlotRender, runOnDispose, runOnRequest } = useSlotHooks(options, slotContext, id);

    const {
      containingElement,
      slot,
      context,
      renderMode,
    } = mergedOptions;
    const parameters = reactive(new Map(Object.entries(options.parameters ?? {})));

    const [device, disposeQueryDetector] = useQueryDetector(typeof options.format === 'string'
      ? {
          [options.format]: '(min-width: 0px)',
        }
      : Object.fromEntries(options.format.map(item => [item.format, item.query])));

    const format = computed(() => typeof options.format === 'string' ? options.format : device.value);

    const ad = ref<AdheseAd | null>(null);
    const originalAd = ref(ad.value);

    const name = computed(() => generateName(context.location, format.value, slot));
    watch(name, async (newName, oldName) => {
      if (newName === oldName)
        return;

      const newAd = await request();

      cleanElement();

      ad.value = newAd;
      originalAd.value = newAd;
    });

    const isDomLoaded = useDomLoaded();

    const isDisposed = ref(false);
    const element = computed(() => {
      if (!(typeof containingElement === 'string' || !containingElement))
        return containingElement;

      if (!isDomLoaded.value || isDisposed.value)
        return null;

      return document.querySelector<HTMLElement>(`.adunit[data-format="${format.value}"]#${containingElement}${slot ? `[data-slot="${slot}"]` : ''}`);
    },
    );

    const [isInViewport, disposeRenderIntersectionObserver] = useRenderIntersectionObserver({
      options,
      element,
    });

    const status = ref<UnwrapRef<AdheseSlot>['status']>('initializing');
    watch([ad, isInViewport], async ([newAd, newIsInViewport], [oldAd]) => {
      if ((!newAd || (oldAd && isDeepEqual(newAd, oldAd))) && status.value === 'rendered')
        return;

      if (newIsInViewport)
        await render(newAd ?? undefined);
    });

    watch(isInViewport, (value) => {
      options.onViewabilityChanged?.(value);
    });

    const [
      isViewabilityTracked,
      disposeViewabilityObserver,
    ] = useViewabilityObserver({
      context,
      ad,
      name,
      element,
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

      disposeRenderIntersectionObserver();
      disposeViewabilityObserver();
      disposeQueryDetector();

      options.onDispose?.();

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

function useDomLoaded(): Readonly<Ref<boolean>> {
  const isDomLoaded = ref(false);

  onInit(async () => {
    await waitForDomLoad();

    isDomLoaded.value = true;
  });
  return isDomLoaded;
}
