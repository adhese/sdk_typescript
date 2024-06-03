import type { AdheseOptions } from '@adhese/sdk';
import { toParameters } from './toParameters';
import { toSlotOptions } from './toSlotOptions';
import type { GambitConfig } from './gambit';

/**
 * Converts `GambitConfig` to `AdheseOptions`.
 * @param config The Gambit configuration.
 * @param parameterMap The map of Gambit parameters to their corresponding keys.
 *
 * @returns The Adhese options.
 */
export function toOptions(config: GambitConfig, parameterMap?: Record<string, string>): AdheseOptions {
  return {
    initialSlots: config.slots?.map(slot => toSlotOptions(slot, parameterMap)) as AdheseOptions['initialSlots'],
    account: config.account,
    parameters: (parameterMap && config.data) ? toParameters(config.data, parameterMap) : undefined,
    location: config.data?.pagePath,
    debug: config.options.debug,
  };
}
