import type { AdheseOptions, AdheseSlotOptions } from '@adhese/sdk';
import { parseGambitParameters } from './parseGambitParameters';
import type { GambitConfig } from './gambit.types';

/**
 * Converts `GambitConfig` to `AdheseOptions`.
 * @param config The Gambit configuration.
 *
 * @returns The Adhese options.
 */
export function parseFromGambitToAdheseOptions(config: GambitConfig): AdheseOptions {
  return {
    initialSlots: config.slots?.map(slot => ({
      format: slot.slotType,
      containingElement: slot.containerId,
      parameters: slot.data?.parameters,
    } satisfies Omit<AdheseSlotOptions, 'context'>)),
    account: config.account,
    parameters: parseGambitParameters(config.data),
    location: config.data.pagePath,
    debug: config.options.debug,
  };
}
