import type { Adhese, AdheseSlotOptions } from '@adhese/sdk';

/**
 * Generate a signature for a slot based on the options and the location.
 */
export function generateSlotSignature(options: Pick<AdheseSlotOptions, 'format' | 'parameters' | 'slot'> & Pick<Adhese, 'location'>): string {
  return objectFingerPrint(options);
}

function objectFingerPrint(obj: object): string {
  return Object.entries(obj)
    .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
    .map(([key, value]) => {
      if (!value) {
        return '';
      }

      if (value && typeof value === 'object') {
        return [key, objectFingerPrint(value)].join('=');
      }

      return [key, value].join('=');
    })
    .filter(Boolean)
    .join(',');
}
