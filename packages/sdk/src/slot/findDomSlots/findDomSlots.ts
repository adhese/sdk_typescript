import { waitForDomLoad } from '@adhese/sdk-shared';
import { generateName } from '../createSlot/createSlot.utils';
import type { AdheseContext } from '../../main.types';
import type { AdheseSlot } from '../createSlot/createSlot.types';
import { createSlot } from '../createSlot/createSlot';

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

      return !context.getAll?.().some(activeSlot => activeSlot.name === name);
    })
    .map(element => createSlot({
      format: element.dataset.format as string,
      containingElement: element,
      slot: element.dataset.slot,
      context,
    }))
    .filter(slot => !context.getAll?.().some(activeSlot => activeSlot.name === slot.name));
}
