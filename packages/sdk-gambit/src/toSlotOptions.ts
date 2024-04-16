import type { AdheseSlotOptions } from '@adhese/sdk';
import type { GambitSlot } from './gambit.types';
import { toParameters } from './toParameters';

/**
 * Converts `GambitSlot` to `AdheseSlot`.
 * @param slot
 * @param parameterMap
 */
export function toSlotOptions(slot: GambitSlot, parameterMap?: Record<string, string>): Omit<AdheseSlotOptions, 'context'> {
  return {
    format: slot.slotType,
    containingElement: slot.containerId,
    parameters: slot.data?.parameters && parameterMap ? toParameters(slot.data.parameters, parameterMap) : undefined,
  };
}
