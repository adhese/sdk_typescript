import { logger } from './logger/logger';

import type { AdheseContext } from './main.types';
import type { AdheseSlot } from './slot/createSlot/createSlot.types';

/**
 * Sets up logging based on the provided options. If debug is enabled, the log level threshold is set to debug.
 */
export function setupLogging(mergedOptions: AdheseContext['options']): void {
  if (mergedOptions.debug || window.location.search.includes('adhese_debug=true')) {
    logger.setMinLogLevelThreshold('debug');
    logger.debug('Debug logging enabled');
  }

  logger.debug('Created Adhese SDK instance', {
    mergedOptions,
  });
}

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

  await Promise.allSettled(filteredSlots.map(slot => slot.request()));
}
