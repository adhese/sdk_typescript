/* v8 ignore start */
export { createAdhese } from './main';
export { logger } from './logger/logger';
export type { SlotManager } from './slot/slotManager/slotManager';
export type { AdRequestOptions } from './requestAds/requestAds';
export { requestAds, requestAd } from './requestAds/requestAds';
export type { Ad } from './requestAds/requestAds.schema';
export type { AdheseSlot, AdheseSlotOptions } from './slot/createSlot/createSlot.types';
export type { AdheseContext, Adhese, AdheseOptions, AdhesePlugin, AdhesePluginInformation } from './main.types';
export { onInit } from './hooks/onInit';
export { onDispose } from './hooks/onDispose';
export { onRequest } from './hooks/onRequest';
export { onRender } from './hooks/onRender';
export { onResponse } from './hooks/onResponse';
