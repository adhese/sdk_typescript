import { logger } from '@core';

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
};

export type Slot = SlotOptions & {
  /**
   * Renders the slot in the containing element.
   */
  render(): HTMLElement | null;
  /**
   * Returns the rendered element.
   */
  getElement(): HTMLElement | null;
};

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

  return {
    location,
    format,
    render(): HTMLElement | null {
      const selector = `.adunit[data-format="${format}"]${typeof containingElement === 'string' ? `#${containingElement}` : ''}${slot ? `[data-slot="${slot}"]` : ''}`;
      element = element ?? document.querySelector<HTMLElement>(selector);

      if (!element)
        logger.error(`Could not create slot for format ${format}. Are you sure you have an element with class "adunit" and data-format="${format}"?`);

      // TODO workout how to render the slot
      if (!element)
        return null;

      element.innerHTML = 'Slot rendered';

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
  };
}
