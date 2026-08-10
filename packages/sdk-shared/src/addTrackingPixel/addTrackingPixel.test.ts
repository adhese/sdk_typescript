import { describe, expect, it } from 'vitest';
import { addTrackingPixel } from './addTrackingPixel';

describe('addTrackingPixel', () => {
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

  it('should not fire the same tracking pixel URL twice', () => {
    const url = `https://example.com/track/${crypto.randomUUID()}`;

    const first = addTrackingPixel(url);
    const second = addTrackingPixel(url);

    expect(second).toBe(first);
    expect(
      document.querySelectorAll(`img[src="${url}"]`).length,
    ).toBe(1);
  });

  it('should still fire distinct tracking pixel URLs independently', () => {
    const urlA = `https://example.com/track/${crypto.randomUUID()}`;
    const urlB = `https://example.com/track/${crypto.randomUUID()}`;

    const elementA = addTrackingPixel(urlA);
    const elementB = addTrackingPixel(urlB);

    expect(elementA).not.toBe(elementB);
    expect(document.querySelectorAll(`img[src="${urlA}"]`).length).toBe(1);
    expect(document.querySelectorAll(`img[src="${urlB}"]`).length).toBe(1);
  });

  it('should treat a URL object and its equivalent string as the same tracker', () => {
    const path = `https://example.com/track/${crypto.randomUUID()}`;

    const first = addTrackingPixel(new URL(path));
    const second = addTrackingPixel(path);

    expect(second).toBe(first);
  });
});
