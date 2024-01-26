import { type Ad, logger } from '@core';
import { type Merge, waitForDomLoad } from '@utils';

export type SlotOptions = {
  /**
   * The location of the slot. This is the location that is used to determine the current page URL.
   */
  location: string;
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
};

export type Slot = Merge<SlotOptions, {
  /**
   * The parameters that are used to render the ad.
   */
  parameters: Map<string, ReadonlyArray<string> | string>;
  /**
   * Renders the slot in the containing element.
   */
  render(ad: Ad): Promise< HTMLElement | null>;
  /**
   * Returns the rendered element.
   */
  getElement(): HTMLElement | null;
  /**
   * Returns the name of the slot.
   */
  getSlotName(): string;
  /**
   * Returns the ad that is currently rendered in the slot.
   */
  getAd(): Ad | null;
}>;

/**
 * Create a new slot instance.
 */
export function createSlot(options: SlotOptions): Readonly<Slot> {
  const {
    location,
    format,
    containingElement,
    slot,
  } = options;

  let element: HTMLElement | null = typeof containingElement === 'string' || !containingElement ? null : containingElement;
  let ad: Ad | null = null;
  const parameters = new Map(Object.entries(options.parameters ?? {}));

  return {
    location,
    format,
    slot,
    parameters,
    async render(adToRender): Promise<HTMLElement | null> {
      await waitForDomLoad();

      if (!element && typeof containingElement === 'string')
        element = element ?? document.querySelector<HTMLElement>(`.adunit[data-format="${format}"]#${containingElement}${slot ? `[data-slot="${slot}"]` : ''}`);

      if (!element) {
        const error = `Could not create slot for format ${format}.?`;
        logger.error(error, options);
        throw new Error(error);
      }

      element.innerHTML = adToRender.tag;
      ad = adToRender;

      logger.debug('Slot rendered', {
        renderedElement: element,
        location,
        format,
        containingElement,
      });

      return element;
    },
    getElement(): HTMLElement | null {
      return element;
    },
    getSlotName(): string {
      return `${location}${slot ? `${slot}` : ''}-${format}`;
    },
    getAd(): Ad | null {
      return ad;
    },
  };
}
