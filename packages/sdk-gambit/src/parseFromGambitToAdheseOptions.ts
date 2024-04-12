import type { AdheseOptions, AdheseSlotOptions } from '@adhese/sdk';
import { parseGambitParameters } from './parseGambitParameters';
import type { GambitConfig } from './gambit.types';

/**
 * Converts `GambitConfig` to `AdheseOptions`.
 * @param config The Gambit configuration.
 * @param parameterMap The map of Gambit parameters to their corresponding keys.
 *
 * @returns The Adhese options.
 */
export function parseFromGambitToAdheseOptions(config: GambitConfig, parameterMap?: Record<string, string>): AdheseOptions {
  return {
    initialSlots: config.slots?.map(slot => ({
      format: slot.slotType,
      containingElement: slot.containerId,
      parameters: slot.data?.parameters,
    } satisfies Omit<AdheseSlotOptions, 'context'>)),
    account: config.account,
    parameters: (parameterMap && config.data) ? parseGambitParameters(config.data, parameterMap) : undefined,
    location: config.data?.pagePath,
    debug: config.options.debug,
  };
}
