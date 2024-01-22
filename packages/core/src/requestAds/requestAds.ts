import type { UrlString } from '@utils';
import { type Slot, logger } from '@core';

export type AdRequestOptions = {
  /**
   * List of slots you want to fetch the ad for
   */
  slots: ReadonlyArray<Slot>;
  /**
   * Host that you want to fetch the ads from
   */
  host: UrlString;
};

/* eslint-disable ts/naming-convention */
export type AdResponse = {
  dm: string;
  adType: string;
  adFormat: string;
  timeStamp: string;
  share: string;
  priority: string;
  orderId: string;
  adspaceId: string;
  adspaceKey: string;
  body: string;
  trackingUrl: string;
  tracker: string;
  extraField1: string;
  extraField2: string;
  altText: string;
  height: string;
  width: string;
  tag: string;
  tagUrl: string;
  heightLarge: string;
  widthLarge: string;
  libId: string;
  id: string;
  advertiserId: string;
  orderProperty: string;
  ext: string;
  swfSrc: string;
  url: string;
  clickTag: string;
  swfSrc2nd: string;
  swfSrc3rd: string;
  swfSrc4th: string;
  poolPath: string;
  comment: string;
  adDuration: string;
  adDuration2nd: string;
  adDuration3rd: string;
  adDuration4th: string;
  orderName: string;
  creativeName: string;
  deliveryMultiples: string;
  deliveryGroupId: string;
  adspaceStart: string;
  adspaceEnd: string;
  swfSrc5th: string;
  swfSrc6th: string;
  adDuration5th: string;
  adDuration6th: string;
  width3rd: string;
  width4th: string;
  width5th: string;
  width6th: string;
  height3rd: string;
  height4th: string;
  height5th: string;
  height6th: string;
  slotName: string;
  slotID: string;
  impressionCounter: string;
  trackedImpressionCounter: string;
  viewableImpressionCounter: string;
  additionalCreatives: string;
  origin: string;
  originData: string;
  auctionable: string;
  additionalViewableTracker: string;
  additionalCreativeTracker: string;
  extension: string;
};
/* eslint-enable ts/naming-convention */

/**
 * Request multiple ads at once from the API
 */
export async function requestAds({
  host,
  ...options
}: AdRequestOptions): Promise<ReadonlyArray<AdResponse>> {
  const payload = {
    ...options,
    slots: options.slots.map(slot => ({
      slotname: slot.getSlotName(),
    })),
  } satisfies {
    slots: ReadonlyArray<{
      slotname: string;
    }>;
  };

  try {
    logger.debug('Requesting ad', payload);

    const endpoint = `${new URL(host).href}json`;

    const response = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        // eslint-disable-next-line ts/naming-convention
        'Content-Type': 'application/json',
      },
    });

    logger.debug('Received response', response);

    if (!response.ok)
      throw new Error(`Failed to request ad: ${response.status} ${response.statusText}`);

    const data = await response.json() as ReadonlyArray<AdResponse>;

    logger.debug('Parsed ad', data);

    return data;
  }
  catch (error) {
    logger.error(String(error));

    throw error;
  }
}

/**
 * Request a single ad from the API. If you need to fetch multiple ads at once use the `requestAds` function.
 */
export async function requestAd({
  slot,
  ...options
}: Omit<AdRequestOptions, 'slots'> & {
  slot: Slot;
}): Promise<AdResponse> {
  const [ad] = await requestAds({
    slots: [slot],
    ...options,
  });

  return ad;
}
