import { type Ad, logger, requestAd } from '@core';
import { type Merge, waitForDomLoad } from '@utils';
import { addTrackingPixel } from '../../impressionTracking/impressionTracking';
import type { AdheseContext } from '../../main';

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
    return element;
  }

  let trackingPixelElement: HTMLImageElement | null = null;

  let isInViewport = false;

  let ad: Ad | null = null;
  function getAd(): Ad | null {
    return ad;
  }

  async function setAd(newAd: Ad): Promise<void> {
    ad = newAd;

    if (isInViewport || context.options.eagerRendering)
      await render(ad);
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

  if (element)
    renderIntersectionObserver.observe(element);

  async function render(adToRender?: Ad): Promise<HTMLElement> {
    if (adToRender)
      ad = adToRender;
    const newAd = adToRender ?? ad ?? await requestAd({
      slot: {
        getName,
        parameters,
      },
      account: context.options.account,
      host: context.options.host,
      parameters: context.parameters,
      context,
    });

    await waitForDomLoad();

    if (!element) {
      const error = `Could not create slot for format ${format}.?`;
      logger.error(error, options);
      throw new Error(error);
    }

    element.innerHTML = newAd.tag;

    if (newAd.impressionCounter)
      trackingPixelElement = addTrackingPixel(newAd.impressionCounter);

    logger.debug('Slot rendered', {
      renderedElement: element,
      location: context.location,
      format,
      containingElement,
    });

    renderIntersectionObserver.disconnect();

    return element;
  }

  function getName(): string {
    return `${context.location}${slot ? `${slot}` : ''}-${format}`;
  }

  function dispose(): void {
    if (element)
      element.innerHTML = '';

    trackingPixelElement?.remove();

    element = null;
    ad = null;

    options.onDispose?.();
    renderIntersectionObserver.disconnect();
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
    dispose,
  };
}
