import type { ConsentData } from '../types';

/**
 * Listen for TCF consent changes
 * @param callback - Callback function to be called when consent changes occur
 *
 * @returns Function to remove the listener
 */
export function onTcfConsentChange(callback: (data: ConsentData) => Promise<void> | void): () => void {
  window.__tcfapi?.('addEventListener', 2, callback);

  return () => window.__tcfapi?.('removeEventListener', 2, callback);
}
