import type { AdheseAd } from '../requestAds/requestAds.schema';
import type { AdheseSlot, AdheseSlotOptions } from '../slot/slot.types';
import type { AdheseContext, AdheseContextState, MergedOptions } from '../main.types';

export type PlatformAdapters = {
  /**
   * Platform-specific slot creation function.
   */
  createSlot: (options: AdheseSlotOptions) => AdheseSlot;
  /**
   * Platform-specific consent handling.
   */
  useConsent?: (context: AdheseContext) => void;
  /**
   * Platform-specific parameter initialization (e.g., referrer, URL logging).
   */
  useParameters?: (context: AdheseContextState, options: MergedOptions) => void;
  /**
   * Platform-specific debug mode initialization.
   */
  useDebugMode?: (context: AdheseContextState) => void;
  /**
   * Platform-specific device detection.
   */
  useDeviceDetection?: (context: AdheseContextState, options: MergedOptions) => void;
  /**
   * Platform-specific DOM slot discovery. Only relevant for web.
   */
  findDomSlots?: (context: AdheseContext) => Promise<ReadonlyArray<AdheseSlot>>;
  /**
   * Platform-specific preview ad fetching. Only relevant for web (uses window.location).
   */
  requestPreviews?: (previewHost: string) => Promise<ReadonlyArray<AdheseAd>>;
};
