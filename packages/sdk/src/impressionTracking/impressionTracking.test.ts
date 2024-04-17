import { describe, expect, it } from 'vitest';
import { addTrackingPixel } from './impressionTracking';

describe('impressionTracking', () => {
  it('should add tracking pixel', () => {
    const element = addTrackingPixel(new URL('https://example.com'));

    expect(element).toBeInstanceOf(HTMLImageElement);
    expect(element.src).toBe('https://example.com/');
    expect(element.style.height).toBe('1px');
    expect(element.style.width).toBe('1px');
    expect(element.style.margin).toBe('-1px');
    expect(element.style.border).toBe('0px');
    expect(element.style.position).toBe('absolute');
    expect(element.style.top).toBe('0px');

    expect(document.body.contains(element)).toBe(true);
  });
});
