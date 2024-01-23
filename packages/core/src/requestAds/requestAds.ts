import type { UrlString } from '@utils';
import { type Slot, logger } from '@core';
import { type ZodType, array, coerce, lazy, literal, object, optional, string, union, unknown, type z } from 'zod';

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

const numberLike = union([coerce.string().regex(/^\d+$/), literal('')]).transform(value => value === '' ? undefined : Number(value));
const booleanLike = union([coerce.boolean(), literal('')]);
const urlLike = union([coerce.string().url(), literal('')]).transform((value) => {
  try {
    return new URL(value);
  }
  catch {
    return undefined;
  }
});
const isDateLike = union([coerce.string(), literal('')]).transform((value) => {
  try {
    return new Date(numberLike.parse(value) ? Number(value) : value);
  }
  catch {
    return undefined;
  }
});
const baseAdResponseScheme = object({
  adDuration: numberLike.optional(),
  adDuration2nd: numberLike.optional(),
  adDuration3rd: numberLike.optional(),
  adDuration4th: numberLike.optional(),
  adDuration5th: numberLike.optional(),
  adDuration6th: numberLike.optional(),
  adFormat: string().optional(),
  adType: string(),
  additionalCreativeTracker: urlLike.optional(),
  additionalViewableTracker: string().optional(),
  adspaceEnd: numberLike.optional(),
  adspaceId: string().optional(),
  adspaceKey: string().optional(),
  adspaceStart: numberLike.optional(),
  advertiserId: string().optional(),
  altText: string().optional(),
  auctionable: optional(booleanLike),
  body: string().optional(),
  clickTag: urlLike.optional(),
  comment: string().optional(),
  creativeName: string().optional(),
  deliveryGroupId: string().optional(),
  deliveryMultiples: string().optional(),
  dm: string().optional(),
  ext: string().optional(),
  extension: optional(object({
    mediaType: string(),
    prebid: optional(unknown()),
  })),
  extraField1: string().optional(),
  extraField2: string().optional(),
  height: numberLike.optional(),
  height3rd: numberLike.optional(),
  height4th: numberLike.optional(),
  height5th: numberLike.optional(),
  height6th: numberLike.optional(),
  heightLarge: numberLike.optional(),
  id: string().optional(),
  impressionCounter: urlLike.optional(),
  libId: string().optional(),
  orderId: string().optional(),
  orderName: string().optional(),
  orderProperty: string().optional(),
  origin: string().optional(),
  originData: optional(unknown()),
  poolPath: urlLike.optional(),
  priority: numberLike.optional(),
  share: string().optional(),
  // eslint-disable-next-line ts/naming-convention
  slotID: string(),
  slotName: string(),
  swfSrc: urlLike.optional(),
  swfSrc2nd: string().optional(),
  swfSrc3rd: string().optional(),
  swfSrc4th: string().optional(),
  swfSrc5th: string().optional(),
  swfSrc6th: string().optional(),
  tag: string(),
  tagUrl: urlLike.optional(),
  timeStamp: isDateLike.optional(),
  trackedImpressionCounter: string().optional(),
  tracker: string().optional(),
  trackingUrl: urlLike.optional(),
  url: urlLike.optional(),
  viewableImpressionCounter: string().optional(),
  width: numberLike.optional(),
  width3rd: numberLike.optional(),
  width4th: numberLike.optional(),
  width5th: numberLike.optional(),
  width6th: numberLike.optional(),
  widthLarge: numberLike.optional(),
});

export type AdResponse = z.infer<typeof baseAdResponseScheme> & {
  additionalCreatives?: ReadonlyArray<AdResponse> | string;
};

const adResponseSchema: ZodType<AdResponse> = baseAdResponseScheme.extend({
  additionalCreatives: lazy(() => optional(union([adResponseSchema.array(), string()]))),
}) as ZodType<AdResponse>;

export type Ad = z.infer<typeof adResponseSchema> & {
  additionalCreatives?: ReadonlyArray<Ad> | string;
};

const adSchema: ZodType<Ad> = adResponseSchema.transform(({
  additionalCreatives,
  ...data
}) => {
  const filteredValue = Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) =>
        Boolean(value)
        && JSON.stringify(value) !== '{}'
        && JSON.stringify(value) !== '[]'),
  ) as typeof data;

  return ({
    ...filteredValue,
    additionalCreatives: Array.isArray(additionalCreatives) ? additionalCreatives.map(creative => adSchema.parse(creative)) : additionalCreatives,
  });
});

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

    const result = array(adSchema).parse((await response.json() as unknown)) as ReadonlyArray<Ad>;
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
