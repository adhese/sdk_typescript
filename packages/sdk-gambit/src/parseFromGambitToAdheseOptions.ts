import type { AdheseOptions } from '@adhese/sdk';
import { parseGambitParameters } from './parseGambitParameters';
import type { GambitConfig } from './gambit.types';
import { parseFromGambitSlotToAdheseSlot } from './parseFromGambitSlotToAdheseSlot';

/**
 * Converts `GambitConfig` to `AdheseOptions`.
 * @param config The Gambit configuration.
 * @param parameterMap The map of Gambit parameters to their corresponding keys.
 *
 * @returns The Adhese options.
 */
export function parseFromGambitToAdheseOptions(config: GambitConfig, parameterMap?: Record<string, string>): AdheseOptions {
  return {
    initialSlots: config.slots?.map(slot => parseFromGambitSlotToAdheseSlot(slot, parameterMap)) as AdheseOptions['initialSlots'],
    account: config.account,
    parameters: (parameterMap && config.data) ? parseGambitParameters(config.data, parameterMap) : undefined,
    location: config.data?.pagePath,
    debug: config.options.debug,
  };
}
