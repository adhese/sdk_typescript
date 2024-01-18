import { type Slot, createSlot } from '@core';

/**
 * Find all slots in the DOM and render them. Ignore slots that are already active.
 * @param activeSlots
 * @param location
 */
export function findDomSlots(
  activeSlots: ReadonlyArray<Slot> = [],
  location: string = window.location.pathname,
): ReadonlyArray<Slot> {
  return Array.from(document.querySelectorAll<HTMLElement>('.adunit'))
    .filter((element) => {
      const isAlreadyActive = activeSlots.some(slot => slot.getRenderedElement() === element);
      const hasFormat = Boolean(element.dataset.format);

      return !isAlreadyActive && hasFormat;
    }).map((element) => {
      const slot = createSlot({
        format: element.dataset.format as string,
        location,
        containingElement: element,
        slot: element.dataset.slot,
      });
      slot.render();

      return slot;
    });
}
