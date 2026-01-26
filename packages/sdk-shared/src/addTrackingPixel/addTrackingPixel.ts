/**
 * Add a tracking pixel to the page to track impressions of the ad.
 * @param url The URL of the tracking pixel. The URL is part of the ad response.
 *
 * @returns The tracking pixel element.
 */
export function addTrackingPixel(url: URL | string): HTMLImageElement {
  const img = document.createElement('img');

  img.src = url.toString();
  img.style.height = '1px';
  img.style.width = '1px';
  img.style.margin = '-1px';
  img.style.border = '0';
  img.style.position = 'absolute';
  img.style.top = '0';
  img.alt = '';
  img.role = 'presentation';

  return document.body.appendChild(img);
}
