import type { UrlString } from '@utils';
import { logger } from '@core';

export type SlotOptions = {
  /**
   * The location of the slot. This is the location that is used to determine the current page URL.
   */
  location: UrlString;
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
   * The element that contains the slot. Used to render the ad in.
   */
  element: HTMLElement | null;
};

export function createSlot({
  location,
  format,
  containingElementId,
}: SlotOptions): Readonly<Slot> {
  const element = document.querySelector<HTMLElement>(`.adunit[data-format="${format}"]#${containingElementId}`);

  if (!element)
    logger.error(`Could not create slot for format ${format} and ${containingElementId}. Are you sure you have an element with class "adunit" and data-format="${format}" and id="${containingElementId}"?`);

  return {
    element,
    location,
    format,
    containingElementId,
  };
}
