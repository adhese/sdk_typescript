/* v8 ignore start */
export { createAdhese } from './main';
export { logger } from './logger/logger';
export { createSlot } from './slot/createSlot/createSlot';
export { findDomSlots } from './slot/findDomSlots/findDomSlots';
export { createSlotManager } from './slot/slotManager/slotManager';
export type { SlotManager } from './slot/slotManager/slotManager';
export type { AdRequestOptions } from './requestAds/requestAds';
export { requestAds, requestAd } from './requestAds/requestAds';
export type { Ad } from './requestAds/requestAds.schema';
export type { AdheseSlot, AdheseSlotOptions } from './slot/createSlot/createSlot.types';
export type { AdheseContext, Adhese, AdheseOptions } from './main.types';
export { onInit } from './hooks/onInit';
export { onDispose } from './hooks/onDispose';
