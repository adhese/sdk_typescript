/* v8 ignore start */
import type { AdheseAd } from '../../requestAds/requestAds.schema';
import type { BaseSlot, BaseSlotOptionsWithSetup } from '../slot.types';

export type AdheseSlotOptions = BaseSlotOptionsWithSetup<AdheseSlot, AdheseAd>;

export type AdheseSlot = BaseSlot<AdheseAd> & {
  /**
   * Ad object that is fetched from the API.
   */
  ad: AdheseAd | null;
};
