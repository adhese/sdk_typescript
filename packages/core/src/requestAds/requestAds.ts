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
  /**
   * Request method to use for the requestAds
   *
   * @default 'POST'
   */
  method?: 'GET' | 'POST' | 'get' | 'post';
  /**
   * The parameters that are used for all ads.
   */
  parameters?: Map<string, ReadonlyArray<string> | string>;
};

/**
 * Request multiple ads at once from the API
 */
export async function requestAds({
  method = 'POST',
  ...options
}: AdRequestOptions): Promise<ReadonlyArray<Ad>> {
  try {
    const response = method?.toUpperCase() === 'POST'
      ? await requestWithPost(options)
      : await requestWithGet(options);

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

function requestWithPost({
  host,
  ...options
}: Omit<AdRequestOptions, 'method'>): Promise<Response> {
  const payload = {
    ...options,
    slots: options.slots.map(slot => ({
      slotname: slot.getName(),
      parameters: parseParameters(slot.parameters),
    })),
    parameters: options.parameters && parseParameters(options.parameters),
  } satisfies {
    slots: ReadonlyArray<{
      slotname: string;
      parameters?: Record<string, ReadonlyArray<string> | string>;
    }>;
    parameters?: Record<string, ReadonlyArray<string> | string>;
  };

  return fetch(`${new URL(host).href}json`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      // eslint-disable-next-line ts/naming-convention
      'Content-Type': 'application/json',
    },
  });
}

async function requestWithGet(options: Omit<AdRequestOptions, 'method'>): Promise<Response> {
  return fetch(new URL(`${options.host}/json/sl${options.slots.map(slot => slot.getName()).join('/sl')}`), {
    method: 'GET',
    headers: {
      // eslint-disable-next-line ts/naming-convention
      'Content-Type': 'application/json',
    },
  });
}

export function parseParameters<T extends string | ReadonlyArray<string>>(parameters: Map<string, T>): Record<string, T> {
  return Object.fromEntries(Array.from(parameters.entries()).filter(([key]) => {
    if (key.length === 2)
      return true;

    logger.warn(`Invalid parameter key: ${key}. Key should be exactly 2 characters long. Key will be ignored.`);
    return false;
  }));
}
