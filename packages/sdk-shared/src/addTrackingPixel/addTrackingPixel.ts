const firedTrackingPixels = new Map<string, HTMLImageElement>();

/**
 * Add a tracking pixel to the page to track impressions of the ad.
 *
 * If this exact URL has already been fired on this page, the existing
 * pixel element is returned instead of creating a second one
 *
 * @param url The URL of the tracking pixel. The URL is part of the ad response.
 *
 * @returns The tracking pixel element.
 */
export function addTrackingPixel(url: URL | string): HTMLImageElement {
  const key = url.toString();

  const alreadyFired = firedTrackingPixels.get(key);
  if (alreadyFired) {
    return alreadyFired;
  }

  const img = document.createElement('img');

  img.src = key;
  img.style.height = '1px';
  img.style.width = '1px';
  img.style.margin = '-1px';
  img.style.border = '0';
  img.style.position = 'absolute';
  img.style.top = '0';
  img.alt = '';
  img.role = 'presentation';

  const element = document.body.appendChild(img);
  firedTrackingPixels.set(key, element);

  return element;
}
