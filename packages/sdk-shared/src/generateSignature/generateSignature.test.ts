import { describe, expect, it } from 'vitest';
import { generateSlotSignature } from './generateSignature';

describe('generateSignature', () => {
  it('should generate a name signature', () => {
    expect(generateSlotSignature({
      format: 'foo',
      location: 'bar',
      parameters: {
        aa: 'abc',
        bb: 'def',
      },
      slot: 'baz',
    })).toBe('format=foo,location=bar,parameters=aa=abc,bb=def,slot=baz');
  });
});
