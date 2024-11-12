import { describe, expect, it } from 'vitest';
import { generateName } from './generateName';

describe('generateName', () => {
  it('should generate a name', () => {
    expect(generateName('location', 'format')).toBe('location-format');
  });

  it('should generate a name with a slot', () => {
    expect(generateName('location', 'format', 'slot')).toBe('locationslot-format');
  });

  it('should generate a name with a format object', () => {
    expect(generateName('location', [
      {
        format: 'format',
        query: 'query',
      },
    ])).toBe('location-[{"format":"format","query":"query"}]');
  });
});
