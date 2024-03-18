import { type Ad, logger, requestAd } from '@core';
import { waitForDomLoad } from '@utils';
import { round } from 'lodash-es';
import { addTrackingPixel } from '../../impressionTracking/impressionTracking';
import { type QueryDetector, createQueryDetector } from '../../queryDetector/queryDetector';
import type { AdheseSlot, AdheseSlotOptions, RenderMode } from './createSlot.types';
import { renderIframe, renderInline } from './createSlot.utils';

const renderFunctions: Record<RenderMode, (ad: Ad, element: HTMLElement) => void> = {
  iframe: renderIframe,
  inline: renderInline,
};

/**
 * Create a new slot instance.
 */
export async function createSlot(options: AdheseSlotOptions): Promise<Readonly<AdheseSlot>> {
  const {
    containingElement,
    slot,
    context,
    renderMode = 'iframe',
  } = options;
  await waitForDomLoad();

  const parameters = new Map(Object.entries(options.parameters ?? {}));

  let format: string;
  let queryDetector: QueryDetector | null = null;

  if (typeof options.format === 'string') {
    // eslint-disable-next-line prefer-destructuring
    format = options.format;
  }
  else {
    queryDetector = createQueryDetector({
      onChange: setFormat,
      queries: Object.fromEntries(options.format.map(item => [item.format, item.query])),
    });

    format = queryDetector.getQuery();
  }

  async function setFormat(newFormat: string): Promise<void> {
    const oldName = getName();

    format = newFormat;
    options.onNameChange?.(getName(), oldName);

    const newAd = await requestAd({
      slot: {
        getName,
        parameters,
      },
      account: context.options.account,
      host: context.options.host,
      parameters: context.parameters,
      context,
    });

    cleanElement();

    await setAd(newAd);
  }

  function getFormat(): string {
    return format;
  }

  let element: HTMLElement | null = typeof containingElement === 'string' || !containingElement
    ? document.querySelector<HTMLElement>(`.adunit[data-format="${format}"]#${containingElement}${slot ? `[data-slot="${slot}"]` : ''}`)
    : containingElement;
  function getElement(): HTMLElement | null {
    if (renderMode === 'iframe')
      return element?.querySelector('iframe') ?? null;

    return element?.innerHTML ? (element.firstElementChild as HTMLElement) : null;
  }

  let impressionTrackingPixelElement: HTMLImageElement | null = null;
  let viewabilityTrackingPixelElement: HTMLImageElement | null = null;

  let isInViewport = false;

  let ad: Ad | null = null;
  function getAd(): Ad | null {
    return ad;
  }

  async function setAd(newAd: Ad): Promise<void> {
    ad = newAd;

    if (isInViewport || context.options.eagerRendering)
      await render(ad);

    if (element) {
      element.style.width = `${ad.width}px`;
      element.style.height = `${ad.height}px`;
    }

    await context.events?.changeSlots.dispatchAsync(Array.from(context.getAll?.() ?? []));
  }

  const renderIntersectionObserver = new IntersectionObserver((entries) => {
    isInViewport = entries.some(entry => entry.isIntersecting);

    if (isInViewport) {
      (async (): Promise<void> => {
        if (!ad && options.lazyLoading)
          await render();

        else if (ad)
          await render(ad);
      })().catch(logger.error);
    }
  }, {
    rootMargin: options.lazyLoadingOptions?.rootMargin ?? '200px',
    threshold: 0,
  });

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

  const viewabilityObserver = new IntersectionObserver(([entry]) => {
    if (context.options.viewabilityTracking && !viewabilityTrackingPixelElement && ad) {
      const ratio = round(entry.intersectionRatio, 1);

      if (ratio >= threshold && !timeoutId) {
        // @ts-expect-error The is misfiring to the Node type
        timeoutId = setTimeout(() => {
          timeoutId = null;

          if (ad?.viewableImpressionCounter) {
            viewabilityTrackingPixelElement = addTrackingPixel(ad.viewableImpressionCounter);

            logger.debug(`Viewability tracking pixel fired for ${getName()}`);

            context.events?.changeSlots.dispatch(Array.from(context.getAll?.() ?? []));
          }
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

  if (element && context.options.viewabilityTracking)
    viewabilityObserver.observe(element);

  if (element)
    renderIntersectionObserver.observe(element);

  async function render(adToRender?: Ad): Promise<HTMLElement> {
    await waitForDomLoad();

    // eslint-disable-next-line require-atomic-updates
    ad = adToRender ?? ad ?? await requestAd({
      slot: {
        getName,
        parameters,
      },
      account: context.options.account,
      host: context.options.host,
      parameters: context.parameters,
      context,
    });

    if (!element) {
      const error = `Could not create slot for format ${format}. No element found.`;
      logger.error(error, options);
      throw new Error(error);
    }

    if (context.debug)
      element.style.position = 'relative';

    renderFunctions[renderMode](ad, element);

    if (ad?.impressionCounter && !impressionTrackingPixelElement) {
      impressionTrackingPixelElement = addTrackingPixel(ad.impressionCounter);

      logger.debug(`Impression tracking pixel fired for ${getName()}`);
    }

    logger.debug('Slot rendered', {
      renderedElement: element,
      location: context.location,
      format,
      containingElement,
    });

    renderIntersectionObserver.disconnect();

    await context.events?.changeSlots.dispatchAsync(Array.from(context.getAll?.() ?? []));

    return element;
  }

  function cleanElement(): void {
    if (!element)
      return;

    element.innerHTML = '';
    element.style.position = '';
    element.style.width = '';
    element.style.height = '';
  }

  function getName(): string {
    return `${context.location}${slot ? `${slot}` : ''}-${format}`;
  }

  function dispose(): void {
    cleanElement();

    impressionTrackingPixelElement?.remove();
    viewabilityTrackingPixelElement?.remove();

    element = null;
    ad = null;

    renderIntersectionObserver.disconnect();
    viewabilityObserver.disconnect();

    options.onDispose?.();

    queryDetector?.dispose();
  }

  function isViewabilityTracked(): boolean {
    return Boolean(viewabilityTrackingPixelElement);
  }

  function isImpressionTracked(): boolean {
    return Boolean(impressionTrackingPixelElement);
  }

  return {
    location: context.location,
    lazyLoading: options.lazyLoading ?? false,
    slot,
    parameters,
    setFormat,
    getFormat,
    render,
    getElement,
    getName,
    getAd,
    setAd,
    isViewabilityTracked,
    isImpressionTracked,
    dispose,
  };
}
