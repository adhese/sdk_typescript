import { describe, expect, it } from 'vitest';
import { isUrlString } from './isUrlString';

describe('isUrlString', () => {
  it('should return true for valid urls', () => {
    expect(isUrlString('https://www.google.com')).toBe(true);
  });

  it('should return false for invalid urls', () => {
    expect(isUrlString('google')).toBe(false);
  });
});
