import type { AdheseSlotOptions } from '@core';
import type { GambitSlot } from './gambit.types';
import { parseGambitParameters } from './parseGambitParameters';

/**
 * Converts `GambitSlot` to `AdheseSlot`.
 * @param slot
 * @param parameterMap
 */
export function parseFromGambitSlotToAdheseSlot(slot: GambitSlot, parameterMap?: Record<string, string>): Omit<AdheseSlotOptions, 'context'> {
  return {
    format: slot.slotType,
    containingElement: slot.containerId,
    parameters: slot.data?.parameters && parameterMap ? parseGambitParameters(slot.data.parameters, parameterMap) : undefined,
  };
}
