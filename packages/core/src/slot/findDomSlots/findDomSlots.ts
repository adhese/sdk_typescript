import { type AdheseContext, type AdheseSlot, createSlot } from '@core';
import { waitForDomLoad } from '@utils';

/**
 * Find all slots in the DOM and render them. Ignore slots that are already active.
 */
export async function findDomSlots(
  context: AdheseContext,
): Promise<ReadonlyArray<AdheseSlot>> {
  await waitForDomLoad();

  return (await Promise.all(Array.from(document.querySelectorAll<HTMLElement>('.adunit'))
    .filter(element => Boolean(element.dataset.format))
    .map(element => createSlot({
      format: element.dataset.format as string,
      containingElement: element,
      slot: element.dataset.slot,
      context,
    }))))
    .filter(slot => !context.getAll?.().some(activeSlot => activeSlot.getName() === slot.getName()));
}
