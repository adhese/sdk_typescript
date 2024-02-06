import { type Ad, logger } from '@core';
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
  context: AdheseContext;
  onDispose?(): void;
};

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
   * Renders the slot in the containing element.
   */
  render(ad: Ad): Promise<HTMLElement>;
  /**
   * Returns the rendered element.
   */
  getElement(): HTMLElement | null;
  /**
   * Returns the name of the slot.
   */
  getName(): string;
  /**
   * Returns the ad that is currently rendered in the slot.
   */
  getAd(): Ad | null;
  /**
   * Removes the slot from the DOM and cleans up the slot instance.
   */
  dispose(): void;
}>;

/**
 * Create a new slot instance.
 */
export function createSlot(options: SlotOptions): Readonly<Slot> {
  const {
    format,
    containingElement,
    slot,
    context,
  } = options;
  const parameters = new Map(Object.entries(options.parameters ?? {}));

  let element: HTMLElement | null = typeof containingElement === 'string' || !containingElement ? null : containingElement;
  function getElement(): HTMLElement | null {
    return element;
  }

  let trackingPixelElement: HTMLImageElement | null = null;

  let ad: Ad | null = null;
  function getAd(): Ad | null {
    return ad;
  }

  async function render(adToRender: Ad): Promise<HTMLElement> {
    await waitForDomLoad();

    if (!element && typeof containingElement === 'string')
      element = document.querySelector<HTMLElement>(`.adunit[data-format="${format}"]#${containingElement}${slot ? `[data-slot="${slot}"]` : ''}`);

    if (!element) {
      const error = `Could not create slot for format ${format}.?`;
      logger.error(error, options);
      throw new Error(error);
    }

    element.innerHTML = adToRender.tag;
    ad = adToRender;

    if (adToRender.impressionCounter)
      trackingPixelElement = addTrackingPixel(adToRender.impressionCounter);

    logger.debug('Slot rendered', {
      renderedElement: element,
      location: context.location,
      format,
      containingElement,
    });

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
  }

  return {
    location: context.location,
    format,
    slot,
    parameters,
    render,
    getElement,
    getName,
    getAd,
    dispose,
  };
}
