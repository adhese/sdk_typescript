import { logger } from './logger/logger';
import type { QueryDetector } from './queryDetector/queryDetector';

import type { AdheseContext, AdheseOptions } from './main.types';
import type { AdheseSlot } from './slot/createSlot/createSlot.types';

/**
 * Creates the parameters map with a set of default parameters.
 */
export function createParameters(
  options: Pick<AdheseOptions, 'parameters' | 'consent' | 'logUrl' | 'logReferrer'>,
  queryDetector: QueryDetector,
): Map<string, string | ReadonlyArray<string>> {
  const parameters = new Map<string, string | ReadonlyArray<string>>();

  if (options.logReferrer)
    parameters.set('re', btoa(document.referrer));

  if (options.logUrl)
    parameters.set('ur', btoa(window.location.href));

  for (const [key, value] of Object.entries({
    ...options.parameters ?? {},
    tl: options.consent ? 'all' : 'none',
    dt: queryDetector.getQuery(),
    br: queryDetector.getQuery(),
    rn: Math.round(Math.random() * 10_000).toString(),
  }))
    parameters.set(key, value);

  return parameters;
}

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
  const filteredSlots = slots.filter(slot => !slot.lazyLoading && !slot.ad);

  if (filteredSlots.length === 0)
    return;

  await Promise.allSettled(slots.map(slot => slot.request()));
}
