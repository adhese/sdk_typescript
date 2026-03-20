/**
 * Fire a tracking pixel via fetch instead of creating a DOM image element.
 * Used for impression and viewability tracking in React Native.
 */
export function fireTrackingPixel(url: URL | string): void {
  fetch(url.toString(), { method: 'GET' }).catch(() => {
    // Silently fail - tracking pixels are best-effort
  });
}
