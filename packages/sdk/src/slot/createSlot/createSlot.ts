import { waitForDomLoad } from '@adhese/sdk-shared';
import { type Ref, type UnwrapRef, computed, effectScope, reactive, ref, watch } from '@vue/runtime-core';
import { isDeepEqual } from 'remeda';
import type { AdheseAd } from '@adhese/sdk';
import { addTrackingPixel } from '../../impressionTracking/impressionTracking';
import { type QueryDetector, createQueryDetector } from '../../queryDetector/queryDetector';
import { onInit, waitOnInit } from '../../hooks/onInit';
import { requestAd as extRequestAd } from '../../requestAds/requestAds';
import { runOnRender } from '../../hooks/onRender';
import { runOnSlotCreate } from '../../hooks/onSlotCreate';
import { logger } from '../../logger/logger';
import type { AdheseSlot, AdheseSlotOptions, RenderMode } from './createSlot.types';
import { generateName, renderIframe, renderInline } from './createSlot.utils';
import { createViewabilityObserver } from './createViewabilityObserver';
import { createRenderIntersectionObserver } from './createRenderIntersectionObserver';

const renderFunctions: Record<RenderMode, (ad: AdheseAd, element: HTMLElement) => void> = {
  iframe: renderIframe,
  inline: renderInline,
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
    const options = runOnSlotCreate(slotOptions);

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

    const ad = ref<AdheseAd | null>(null);
    const originalAd = ref(ad.value);

    const name = computed(() => generateName(context.location, format.value, slot));
    watch(name, async (newName, oldName) => {
      if (newName === oldName)
        return;

      options.onNameChange?.(newName, oldName);

      const newAd = await requestAd();

      cleanElement();

      ad.value = newAd;
      originalAd.value = newAd;
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

    const [isInViewport, disposeRenderIntersectionObserver] = createRenderIntersectionObserver({
      options,
      element,
    });

    const status = ref<UnwrapRef<AdheseSlot>['status']>('initializing');
    watch(status, () => {
      context.events.changeSlots.dispatch(Array.from(context.getAll?.() ?? []));
    });
    watch([ad, isInViewport], async ([newAd, newIsInViewport], [oldAd]) => {
      if ((!newAd || (oldAd && isDeepEqual(newAd, oldAd))) && status.value === 'rendered')
        return;

      if (newIsInViewport)
        await render(newAd ?? undefined);

      context.events?.changeSlots.dispatch(Array.from(context.getAll?.() ?? []));
    });

    watch(isInViewport, (value) => {
      options.onViewabilityChanged?.(value);
    });

    const [
      isViewabilityTracked,
      disposeViewabilityObserver,
    ] = createViewabilityObserver({
      context,
      ad,
      name,
      element,
    });

    const impressionTrackingPixelElement = ref<HTMLImageElement | null>(null);
    const isImpressionTracked = computed(() => Boolean(impressionTrackingPixelElement.value));

    async function requestAd(): Promise<AdheseAd | null> {
      status.value = 'loading';

      const response = await extRequestAd({
        slot: {
          name: name.value,
          parameters,
        },
        context,
      });

      if (response) {
        ad.value = response;

        if (!originalAd.value)
          originalAd.value = response;

        status.value = response ? 'loaded' : 'empty';
      }

      return response;
    }

    async function render(adToRender?: AdheseAd): Promise<HTMLElement | null> {
      status.value = 'rendering';

      await waitForDomLoad();
      await waitOnInit;

      let renderAd = adToRender ?? ad.value ?? originalAd.value ?? await requestAd();

      if (!renderAd) {
        status.value = 'empty';
        logger.debug(`No ad to render for slot ${name.value}`);
        return null;
      }

      renderAd = options.onBeforeRender?.(renderAd) ?? renderAd;

      renderAd = await runOnRender(renderAd);

      if (!element.value) {
        const error = `Could not create slot for format ${format.value}. No element found.`;
        logger.error(error, options);
        throw new Error(error);
      }

      if (context.debug)
        element.value.style.position = 'relative';

      if (context.safeFrame && renderAd && renderMode === 'iframe') {
        const position = context.safeFrame.addPosition(renderAd, element.value);

        await context.safeFrame.render(position);
      }
      else {
        renderFunctions[renderMode](renderAd, element.value);
      }

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

    onInit(async () => {
      status.value = 'initialized';

      if (options.lazyLoading)
        return;

      ad.value = await requestAd();
    });

    return reactive({
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
      render,
      getElement,
      request: requestAd,
      dispose,
    });
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
