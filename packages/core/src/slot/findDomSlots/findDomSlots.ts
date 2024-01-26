import { type Slot, createSlot } from '@core';
import { waitForDomLoad } from '@utils';

/**
 * Find all slots in the DOM and render them. Ignore slots that are already active.
 * @param activeSlots
 * @param location
 */
export async function findDomSlots(
  activeSlots: ReadonlyArray<Slot> = [],
  location: string = window.location.pathname,
): Promise<ReadonlyArray<Slot>> {
  await waitForDomLoad();

  return Array.from(document.querySelectorAll<HTMLElement>('.adunit'))
    .filter(element => Boolean(element.dataset.format))
    .map(element => createSlot({
      format: element.dataset.format as string,
      location,
      containingElement: element,
      slot: element.dataset.slot,
    }))
    .filter(slot => !activeSlots.some(activeSlot => activeSlot.getName() === slot.getName()));
}
