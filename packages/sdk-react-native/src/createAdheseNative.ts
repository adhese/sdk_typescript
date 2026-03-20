import type { Adhese, AdheseOptions, AdhesePlugin, PlatformAdapters } from '@adhese/sdk/core';
import { createAdheseCore } from '@adhese/sdk/core';
import { useConsent } from './platform/consent';
import { useDebugMode } from './platform/debugMode';
import { useDeviceDetection } from './platform/deviceDetection';
import { useParameters } from './platform/parameters';
import { createSlot } from './platform/slot';

/**
 * Creates an Adhese instance configured for React Native.
 *
 * Key differences from the web `createAdhese`:
 * - No DOM slot discovery
 * - No IntersectionObserver (uses timer-based viewability tracking instead)
 * - No window.matchMedia (uses Dimensions API instead)
 * - No TCF consent API (accepts binary or string consent)
 * - No document.referrer or window.location logging
 * - Rendering is handled by React Native components, not the SDK
 */
export function createAdheseNative<T extends ReadonlyArray<AdhesePlugin>>(
  options: AdheseOptions<T>,
): Adhese<T> {
  const platform: PlatformAdapters = {
    createSlot,
    useConsent,
    useParameters,
    useDebugMode,
    useDeviceDetection,
  };

  return createAdheseCore({
    findDomSlotsOnLoad: false,
    logReferrer: false,
    logUrl: false,
    eagerRendering: true,
    viewabilityTracking: true,
    ...options,
  } as AdheseOptions<T>, platform);
}
