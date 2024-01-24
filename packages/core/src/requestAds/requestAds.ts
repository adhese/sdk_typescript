import type { UrlString } from '@utils';
import { type Slot, logger } from '@core';
import { type Ad, adSchema } from './requestAds.schema';

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

/**
 * Request multiple ads at once from the API
 */
export async function requestAds({
  host,
  ...options
}: AdRequestOptions): Promise<ReadonlyArray<Ad>> {
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

    const result = adSchema.array().parse((await response.json() as unknown));
    logger.debug('Parsed ad', result);

    return result;
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
}): Promise<Ad> {
  const [ad] = await requestAds({
    slots: [slot],
    ...options,
  });

  return ad;
}
