/**
 * Run `callback` when the page is idle, so the tag never competes with rendering.
 */
export function whenIdle(callback: () => void): void {
  if (typeof requestIdleCallback === 'function')
    requestIdleCallback(callback);
  else
    setTimeout(callback, 1);
}
