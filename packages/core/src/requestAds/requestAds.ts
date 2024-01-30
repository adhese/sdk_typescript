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
   * The Adhese account name.
   */
  account: string;
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

type AdPostPayload = {
  slots: ReadonlyArray<{
    slotname: string;
    parameters?: Record<string, ReadonlyArray<string> | string>;
  }>;
  parameters?: Record<string, ReadonlyArray<string> | string>;
};

/**
 * Request multiple ads at once from the API
 */
export async function requestAds({
  method = 'POST',
  ...options
}: AdRequestOptions): Promise<ReadonlyArray<Ad>> {
  try {
    const [response, previews] = await Promise.all([method?.toUpperCase() === 'POST'
      ? requestWithPost(options)
      : requestWithGet(options), requestPreviews(options.account)]);

    logger.debug('Received response', response);

    if (!response.ok)
      throw new Error(`Failed to request ad: ${response.status} ${response.statusText}`);

    const result = adSchema.array().parse((await response.json() as unknown));
    logger.debug('Parsed ad', result);

    if (previews.length > 0)
      logger.info(`Found ${previews.length} ${previews.length === 1 ? 'preview' : 'previews'}. Replacing ads in response with preview items`, previews);

    return [
      ...result.filter(ad => !previews.some(preview => preview.libId === ad.libId)),
      ...previews.map(({ slotName, ...preview }) => {
        const partnerAd = result.find(ad => ad.libId === preview.libId);

        return ({
          slotName: `${partnerAd?.slotName ?? slotName}`,
          ...preview,
        });
      }),
    ];
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
  } satisfies AdPostPayload;

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

export async function requestPreviews(account: string): Promise<ReadonlyArray<Ad>> {
  const currentUrl = new URL(window.location.href);

  const previewObjects: Array<Record<string, string>> = [];
  let currentObject: Record<string, string> = {};

  for (const [key, value] of currentUrl.searchParams.entries()) {
    if (key in currentObject) {
      previewObjects.push(currentObject);
      currentObject = {};
    }

    currentObject[key] = value;
  }

  if (Object.keys(currentObject).length > 0)
    previewObjects.push(currentObject);

  const list = (await Promise.allSettled(previewObjects
    .filter(previewObject => 'adhesePreviewCreativeId' in previewObject)
    .map(async (previewObject) => {
      const endpoint = new URL(`https://${account}-preview.adhese.org/creatives/preview/json/tag.do`);
      endpoint.searchParams.set(
        'id',
        previewObject.adhesePreviewCreativeId,
      );

      const response = await fetch(endpoint.href, {
        method: 'GET',
        headers: {
          accept: 'application/json',
        },
      });

      if (!response.ok)
        return Promise.reject(new Error(`Failed to request preview ad with ID: ${previewObject.adhesePreviewCreativeId}`));

      return await response.json() as unknown;
    })))
    .filter((response): response is PromiseFulfilledResult<ReadonlyArray<unknown>> => {
      if (response.status === 'rejected') {
        logger.error(response.reason as string);
        return false;
      }
      return response.status === 'fulfilled';
    })
    .map(response => response.value);

  return adSchema.array().parse(list.flat());
}
