/* v8 ignore start */
export { createAdheseCore } from './core/createAdhese';
export type { PlatformAdapters } from './core/types';
export type { Adhese, AdheseContext, AdheseOptions, AdhesePlugin, AdhesePluginInformation } from './main.types';
export type { AdRequestOptions } from './requestAds/requestAds';
export type { AdheseAd } from './requestAds/requestAds.schema';
export type { AdheseSlot, AdheseSlotContext, AdheseSlotHooks, AdheseSlotOptions } from './slot/slot.types';
export type { AdheseSlotManager } from './slotManager/slotManager';
export { requestAd, requestAds } from './requestAds/requestAds';
export { createGlobalHooks } from './hooks';
