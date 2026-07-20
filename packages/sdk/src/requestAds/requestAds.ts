import type { AdheseContext } from '../main.types';
import type { AdheseAd } from './requestAds.schema';
import { debounce } from '@adhese/sdk-shared';
import { logger } from '../logger/logger';
import { requestPreviews } from './requestAds.preview';
import { requestWithGet, requestWithPost } from './requestAds.utils';

export type AdRequestOptions = {
  /**
   * Slot you want to fetch the ad for
   */
  slot: {
    name: string;
    parameters: Map<string, ReadonlyArray<string> | string>;
  };
  context: AdheseContext;
};

export type AdMultiRequestOptions = Omit<AdRequestOptions, 'slot'> & {
  slots: ReadonlyArray<AdRequestOptions['slot']>;
};

const batch = new Map<
  string,
  {
    options: AdRequestOptions;
    resolve(ad: AdheseAd | null): void;
    reject(error: unknown): void;
  }
>();

/**
 * Debounced function to request ads in batches. This function is debounced to prevent multiple requests for the same ad.
 */
const runRequestAdsBatch = debounce(
  async (context: AdheseContext) => {
    if (batch.size === 0)
      return [];

    const entries = Array.from(batch.values());
    batch.clear();

    try {
      const ads = await requestAds({
        slots: entries.map(({ options }) => options.slot),
        context,
      });

      for (const { options, resolve } of entries) {
        const ad = ads.find(({ slotName }) => slotName === options.slot.name);
        resolve(ad ?? null);
      }

      return ads;
    }
    catch (error) {
      for (const { reject } of entries)
        reject(error);

      return [];
    }
  },
  {
    waitMs: 200,
    timing: 'trailing',
  },
);

/**
 * Request a single ad from the API. If you need to fetch multiple ads at once use the `requestAds` function.
 */
export async function requestAd(
  options: AdRequestOptions,
): Promise<AdheseAd | null> {
  const promise = new Promise<AdheseAd | null>((resolve, reject) => {
    batch.set(options.slot.name, { options, resolve, reject });
  });

  await runRequestAdsBatch.call(options.context);

  return promise;
}

/**
 * Request multiple ads from the API. If you need to fetch a single ad use the `requestAd` function.
 */
export async function requestAds(
  requestOptions: AdMultiRequestOptions,
): Promise<ReadonlyArray<AdheseAd>> {
  const options = await requestOptions.context.hooks.runOnRequest(
    requestOptions,
  );

  const { context } = options;

  try {
    context?.events?.requestAd.dispatch({
      ...options,
      context,
    });

    const [response, previews, parseResponse] = await Promise.all([
      context.options.requestType?.toUpperCase() === 'POST'
        ? requestWithPost(options)
        : requestWithGet(options),
      requestPreviews(options?.context?.options.previewHost),
      import('./requestAds.schema').then(module => module.parseResponse),
    ]);

    logger.debug('Received response', response);

    if (!response.ok) {
      throw new Error(
        `Failed to request ad: ${response.status} ${response.statusText}`,
      );
    }

    const result = parseResponse((await response.json()) as unknown);
    logger.debug('Parsed ad', result);

    if (previews.length > 0) {
      logger.info(
        `Found ${previews.length} ${
          previews.length === 1 ? 'preview' : 'previews'
        }. Replacing ads in response with preview items`,
        previews,
      );
    }

    const matchedPreviews: Array<AdheseAd> = [];
    for (const [, value] of context.slots.entries()) {
      const ad = result.find(({ slotName }) => slotName === value.name);
      const partnerAd = previews.find(
        preview => preview.adType === value.format,
      );
      if (ad || partnerAd) {
        const baseAd = partnerAd ?? ad;
        matchedPreviews.push({
          ...baseAd,
          slotName: value.name,
        } as AdheseAd);
      }
      else {
        if (value.status === 'loading')
          value.processOnEmpty();
      }
    }

    if (matchedPreviews.length > 0)
      context.events?.previewReceived.dispatch(matchedPreviews);

    const mergedResult = await context.hooks.runOnResponse(matchedPreviews);

    context.events?.responseReceived.dispatch(mergedResult);

    return mergedResult;
  }
  catch (error) {
    logger.error(String(error));
    context?.events?.requestError.dispatch(error as Error);
    throw error;
  }
}
