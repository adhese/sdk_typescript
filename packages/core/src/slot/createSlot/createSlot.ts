import { type Ad, logger, requestAd } from '@core';
import { type Merge, waitForDomLoad } from '@utils';
import { round } from 'lodash-es';
import type { AdheseContext } from '../../main';
import { addTrackingPixel } from '../../impressionTracking/impressionTracking';

export type SlotOptions = {
  /**
   * The format code of the slot. Used to find the correct element on the page to render the ad in.
   */
  format: string;
  /**
   * If we have multiple slots with the same format, we can use this to differentiate between them.
   */
  slot?: string;
  /**
   * The element that contains the slot. Used to find the correct element on the page to render the ad in.
   */
  containingElement?: string | HTMLElement;
  /**
   * The parameters that are used to render the ad.
   */
  parameters?: Record<string, ReadonlyArray<string> | string>;
  /**
   * The Adhese context
   */
  context: AdheseContext;
  /**
   * Callback that is called when the slot is disposed.
   */
  onDispose?(): void;
} & ({
  /**
   * If the slot should be lazy loaded. This means that the ad will only be requested when the slot is in the viewport.
   * If `true`, the slot will handle the request itself and render the ad.
   */
  lazyLoading: true;
  lazyLoadingOptions?: {
    /**
     * The root margin of the intersection observer. This is used to determine when the slot is in the viewport.
     */
    rootMargin?: string;
  };
} | {
  lazyLoading?: false;
  lazyLoadingOptions?: never;
});

export type Slot = Merge<Omit<SlotOptions, 'onDispose' | 'context'>, {
  /**
   * The location of the slot. This is the location that is used to determine the current page URL.
   */
  location: string;
  /**
   * The parameters that are used to render the ad.
   */
  parameters: Map<string, ReadonlyArray<string> | string>;
  /**
   * Renders the slot in the containing element. If no ad is provided, a new ad will be requested from the API.
   */
  render(ad?: Ad): Promise<HTMLElement>;
  /**
   * Returns the rendered element.
   */
  getElement(): HTMLElement | null;
  /**
   * Returns the name of the slot.
   */
  getName(): string;
  /**
   * Returns the ad that is to be rendered in the slot or is currently rendered in the slot.
   */
  getAd(): Ad | null;
  /**
   * Sets the ad that is to be rendered in the slot. If the slot is in the viewport, the ad will be rendered immediately.
   */
  setAd(ad: Ad): Promise<void>;
  /**
   * Returns whether the viewability tracking pixel has been fired.
   */
  isViewabilityTracked(): boolean;
  /**
   * Returns whether the impression tracking pixel has been fired.
   */
  isImpressionTracked(): boolean;
  /**
   * Removes the slot from the DOM and cleans up the slot instance.
   */
  dispose(): void;
}>;

/**
 * Create a new slot instance.
 */
export async function createSlot(options: SlotOptions): Promise<Readonly<Slot>> {
  const {
    format,
    containingElement,
    slot,
    context,
  } = options;
  await waitForDomLoad();

  const parameters = new Map(Object.entries(options.parameters ?? {}));

  let element: HTMLElement | null = typeof containingElement === 'string' || !containingElement
    ? document.querySelector<HTMLElement>(`.adunit[data-format="${format}"]#${containingElement}${slot ? `[data-slot="${slot}"]` : ''}`)
    : containingElement;
  function getElement(): HTMLElement | null {
    return element?.querySelector('iframe') ?? null;
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
      const error = `Could not create slot for format ${format}.?`;
      logger.error(error, options);
      throw new Error(error);
    }

    if (context.debug)
      element.style.position = 'relative';

    const iframe = document.createElement('iframe');
    iframe.srcdoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          ${ad.tag}
        </body>
      `.replaceAll(/\s+/g, ' ').trim();

    iframe.style.border = 'none';
    iframe.style.width = ad.width ? `${ad.width}px` : '100%';
    iframe.style.height = ad.height ? `${ad.height}px` : '100%';
    element.replaceChildren(iframe);

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

  function getName(): string {
    return `${context.location}${slot ? `${slot}` : ''}-${format}`;
  }

  function dispose(): void {
    if (element)
      element.innerHTML = '';

    impressionTrackingPixelElement?.remove();
    viewabilityTrackingPixelElement?.remove();

    element = null;
    ad = null;

    renderIntersectionObserver.disconnect();
    viewabilityObserver.disconnect();

    options.onDispose?.();
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
    format,
    slot,
    parameters,
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
