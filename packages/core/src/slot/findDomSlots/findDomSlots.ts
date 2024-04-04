import { type AdheseContext, type AdheseSlot, createSlot } from '@core';
import { waitForDomLoad } from '@utils';
import { generateName } from '../createSlot/createSlot.utils';

/**
 * Find all slots in the DOM and render them. Ignore slots that are already active.
 */
export async function findDomSlots(
  context: AdheseContext,
): Promise<ReadonlyArray<AdheseSlot>> {
  await waitForDomLoad();

  return Array.from(document.querySelectorAll<HTMLElement>('.adunit'))
    .filter((element) => {
      if (!element.dataset.format)
        return false;

      const name = generateName(
        context.location,
        element.dataset.format,
        element.dataset.slot,
      );

      return !context.getAll?.().some(activeSlot => activeSlot.name.value === name);
    })
    .map(element => createSlot({
      format: element.dataset.format as string,
      containingElement: element,
      slot: element.dataset.slot,
      context,
    }))
    .filter(slot => !context.getAll?.().some(activeSlot => activeSlot.name.value === slot.name.value));
}
