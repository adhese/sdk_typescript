/**
 * Generate a name for a slot based on the location, format and slot.
 */
export function generateName(
  location: string,
  format: string,
  slot?: string,
): string {
  return `${location}${slot ? `${slot}` : ''}-${format}`;
}
