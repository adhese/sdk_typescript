import { type Ad, logger, requestAd } from '@core';
import { waitForDomLoad } from '@utils';
import { type Ref, computed, effectScope, reactive, ref, watch } from '@vue/runtime-core';
import { isEqual } from 'lodash-es';
import { addTrackingPixel } from '../../impressionTracking/impressionTracking';
import { type QueryDetector, createQueryDetector } from '../../queryDetector/queryDetector';
import { onInit } from '../../hooks/onInit';
import type { AdheseSlot, AdheseSlotOptions, RenderMode } from './createSlot.types';
import { generateName, renderIframe, renderInline } from './createSlot.utils';
import { useViewabilityObserver } from './useViewabilityObserver';
import { useRenderIntersectionObserver } from './useRenderIntersectionObserver';

const renderFunctions: Record<RenderMode, (ad: Ad, element: HTMLElement) => void> = {
  iframe: renderIframe,
  inline: renderInline,
};

/**
 * Create a new slot instance.
 */
export function createSlot(options: AdheseSlotOptions): Readonly<AdheseSlot> {
  const scope = effectScope();

  return scope.run(() => {
    const {
      containingElement,
      slot,
      context,
      renderMode = 'iframe',
    } = options;
    const parameters = reactive(new Map(Object.entries(options.parameters ?? {})));
    let queryDetector: QueryDetector | null = null;

    if (typeof options.format !== 'string') {
      queryDetector = createQueryDetector({
        onChange: onQueryChange,
        queries: Object.fromEntries(options.format.map(item => [item.format, item.query])),
      });
    }

    const format = ref(queryDetector ? queryDetector.getQuery() : options.format as string);
    function onQueryChange(newFormat: string): void {
      format.value = newFormat;
    }

    const ad = ref<Ad | null>(null);

    const name = computed(() => generateName(context.location, format.value, slot));
    watch(name, async (newName, oldName) => {
      if (newName === oldName)
        return;

      options.onNameChange?.(newName, oldName);

      const newAd = await requestAd({
        slot: {
          name: newName,
          parameters,
        },
        context,
      });

      cleanElement();

      ad.value = newAd;
    });

    const isDomLoaded = useDomLoaded();

    const element = computed(() => {
      if (!(typeof containingElement === 'string' || !containingElement))
        return containingElement;

      if (!isDomLoaded.value)
        return null;

      return document.querySelector<HTMLElement>(`.adunit[data-format="${format.value}"]#${containingElement}${slot ? `[data-slot="${slot}"]` : ''}`);
    },
    );

    function getElement(): HTMLElement | null {
      if (renderMode === 'iframe')
        return element.value?.querySelector('iframe') ?? null;

      return element.value?.innerHTML ? (element.value.firstElementChild as HTMLElement) : null;
    }

    const [isInViewport, disposeRenderIntersectionObserver] = useRenderIntersectionObserver({
      ad,
      options,
      element,
      render,
    });

    watch([ad, isInViewport], async ([newAd, newIsInViewport], [oldAd]) => {
      if (!newAd || isEqual(newAd, oldAd))
        return;

      if (newIsInViewport || context.options.eagerRendering)
        await render(newAd);

      if (element.value) {
        element.value.style.width = `${newAd.width}px`;
        element.value.style.height = `${newAd.height}px`;
      }

      context.events?.changeSlots.dispatch(Array.from(context.getAll?.() ?? []));
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

    async function render(adToRender?: Ad): Promise<HTMLElement> {
      await waitForDomLoad();

      // eslint-disable-next-line require-atomic-updates
      ad.value = adToRender ?? ad.value ?? await requestAd({
        slot: {
          name,
          parameters,
        },
        context,
      });

      if (!element.value) {
        const error = `Could not create slot for format ${format.value}. No element found.`;
        logger.error(error, options);
        throw new Error(error);
      }

      if (context.debug)
        element.value.style.position = 'relative';

      renderFunctions[renderMode](ad.value, element.value);

      if (ad.value?.impressionCounter && !impressionTrackingPixelElement.value) {
        impressionTrackingPixelElement.value = addTrackingPixel(ad.value?.impressionCounter);

        logger.debug(`Impression tracking pixel fired for ${name.value}`);
      }

      logger.debug('Slot rendered', {
        renderedElement: element,
        location: context.location,
        format,
        containingElement,
      });

      options.onRender?.(element.value);

      disposeRenderIntersectionObserver();

      return element.value;
    }

    function cleanElement(): void {
      if (!element.value)
        return;

      element.value.innerHTML = '';
      element.value.style.position = '';
      element.value.style.width = '';
      element.value.style.height = '';
    }

    function dispose(): void {
      cleanElement();

      impressionTrackingPixelElement.value?.remove();

      ad.value = null;

      disposeRenderIntersectionObserver();
      disposeViewabilityObserver();

      options.onDispose?.();

      queryDetector?.dispose();

      scope.stop();
    }

    return {
      location: context.location,
      lazyLoading: options.lazyLoading ?? false,
      slot,
      parameters,
      format,
      name,
      ad,
      isViewabilityTracked,
      isImpressionTracked,
      render,
      getElement,
      dispose,
    };
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
