import type { UrlString } from '@utils';
import { type Adhese, type AdheseSlot, logger } from '@core';
import { type Ad, adSchema } from './requestAds.schema';
import { requestPreviews } from './requestAds.preview';
import { requestWithGet, requestWithPost } from './requestAds.utils';

export type AdRequestOptions = {
  /**
   * List of slots you want to fetch the ad for
   */
  slots: ReadonlyArray<Pick<AdheseSlot, 'getName' | 'parameters'>>;
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
  context: Partial<Adhese>;
};

/**
 * Request multiple ads at once from the API
 */
export async function requestAds({
  method = 'POST',
  context,
  ...options
}: AdRequestOptions): Promise<ReadonlyArray<Ad>> {
  try {
    context.events?.requestAd.dispatch({
      ...options,
      context,
      method,
    });

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

    const matchedPreviews = previews.map(({ slotName, ...preview }) => {
      const partnerAd = result.find(ad => ad.libId === preview.libId);

      return ({
        slotName: `${partnerAd?.slotName ?? slotName}`,
        ...preview,
      });
    });

    if (matchedPreviews.length > 0)
      context.events?.previewReceived.dispatch(matchedPreviews);

    const mergedResult: ReadonlyArray<Ad> = [
      ...result.filter(ad => !previews.some(preview => preview.libId === ad.libId)),
      ...matchedPreviews,
    ];

    context.events?.responseReceived.dispatch(mergedResult);

    return mergedResult;
  }
  catch (error) {
    logger.error(String(error));
    context.events?.requestError.dispatch(error as Error);

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
  slot: Pick<AdheseSlot, 'getName' | 'parameters'>;
}): Promise<Ad> {
  const [ad] = await requestAds({
    slots: [slot],
    ...options,
  });

  return ad;
}
