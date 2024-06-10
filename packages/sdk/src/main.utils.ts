import type { AdheseSlot } from './slot/slot.types';
import { logger } from './logger/logger';

/**
 * Checks if the current page is in preview mode.
 */
export function isPreviewMode(): boolean {
  return window.location.search.includes('adhesePreviewCreativeId');
}

export async function fetchAllUnrenderedSlots(slots: ReadonlyArray<AdheseSlot>): Promise<void> {
  const filteredSlots = slots.filter(slot => !slot.lazyLoading && !slot.data);

  if (filteredSlots.length === 0)
    return;

  const results = await Promise.allSettled(filteredSlots.map(slot => slot.request));

  for (const [index, result] of results.entries()) {
    if (result.status === 'rejected') {
      logger.error(`Failed to fetch slot data for slot ${filteredSlots[index].name}`, result.reason);
    }
  }
}
