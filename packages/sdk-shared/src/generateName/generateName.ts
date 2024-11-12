import type { AdheseSlotOptions } from '@adhese/sdk';

/**
 * Generate a name for a slot based on the location, format and slot.
 */
export function generateName(
  location: string,
  format: AdheseSlotOptions['format'],
  slot?: string,
): string {
  return `${location}${slot ? `${slot}` : ''}-${typeof format === 'string' ? format : JSON.stringify(format)}`;
}
