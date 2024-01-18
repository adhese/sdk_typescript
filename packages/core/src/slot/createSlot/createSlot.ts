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
   * The id of the element that contains the slot. Used to find the correct element on the page to render the ad in.
   */
  containingElementId: string;
  /**
   * If we have multiple slots with the same format, we can use this to differentiate between them.
   */
  slot?: string;
};

export type Slot = SlotOptions & {
  /**
   * Renders the slot in the containing element.
   */
  render(): HTMLElement | null;
  /**
   * Returns the rendered element.
   */
  getRenderedElement(): HTMLElement | null;
  /**
   * Disposes the slot and removes it from the DOM and cleans up any event listeners and other side effects.
   */
  dispose(): void;
};

/**
 * Create a new slot instance.
 */
export function createSlot({
  location,
  format,
  containingElementId,
}: SlotOptions): Readonly<Slot> {
  let renderedElement: HTMLElement | null = null;

  return {
    location,
    format,
    containingElementId,
    render(): HTMLElement | null {
      renderedElement = document.querySelector<HTMLElement>(`.adunit[data-format="${format}"]#${containingElementId}`);

      if (!renderedElement)
        logger.error(`Could not create slot for format ${format} and ${containingElementId}. Are you sure you have an element with class "adunit" and data-format="${format}" and id="${containingElementId}"?`);

      // TODO workout how to render the slot
      if (!renderedElement)
        return null;

      renderedElement.innerHTML = 'Slot rendered';

      logger.debug('Slot rendered', {
        renderedElement,
        location,
        format,
        containingElementId,
        selector: `.adunit[data-format="${format}"]#${containingElementId}`,
      });

      return renderedElement;
    },
    getRenderedElement(): HTMLElement | null {
      return renderedElement;
    },
    dispose(): void {
      if (!renderedElement)
        return;

      renderedElement.innerHTML = '';
      renderedElement = null;

      logger.debug('Slot disposed', {
        renderedElement,
        location,
        format,
        containingElementId,
        selector: `.adunit[data-format="${format}"]#${containingElementId}`,
      });
    },
  };
}
