import {
  array,
  booleanLike,
  dateLike,
  extend,
  isJsonOrHtmlOptionalString,
  lazy,
  literal,
  numberLike,
  object,
  optional,
  type output,
  pipe,
  string,
  transform,
  union,
  unknown,
  urlLike,
  type ZodMiniType,
} from '@adhese/sdk-shared/validators';

const baseSchema = object({
  adDuration: optional(numberLike),
  adFormat: optional(string()),
  adType: string(),
  additionalCreativeTracker: optional(urlLike),
  additionalViewableTracker: optional(string()),
  adspaceEnd: optional(dateLike),
  adspaceId: optional(string()),
  adspaceKey: optional(string()),
  adspaceStart: optional(dateLike),
  advertiserId: optional(string()),
  altText: optional(string()),
  auctionable: optional(booleanLike),
  body: isJsonOrHtmlOptionalString,
  clickTag: optional(urlLike),
  comment: optional(string()),
  creativeName: optional(string()),
  deliveryGroupId: optional(string()),
  deliveryMultiples: optional(string()),
  ext: optional(string()),
  extension: optional(object({
    mediaType: string(),
    prebid: optional(unknown()),
  })),
  height: optional(numberLike),
  id: optional(string()),
  impressionCounter: optional(urlLike),
  additionalTracker: optional(urlLike),
  libId: optional(string()),
  orderId: optional(string()),
  orderName: optional(string()),
  orderProperty: optional(string()),
  origin: string(),
  originData: optional(unknown()),
  originInstance: optional(string()),
  poolPath: optional(urlLike),
  preview: optional(booleanLike),
  priority: optional(numberLike),
  renderMode: optional(union([literal('inline'), literal('iframe'), literal('none')])),
  sfSrc: optional(urlLike),
  share: optional(string()),
  // eslint-disable-next-line ts/naming-convention
  slotID: string(),
  slotName: string(),
  swfSrc: optional(urlLike),
  tag: isJsonOrHtmlOptionalString,
  tagUrl: optional(urlLike),
  timeStamp: optional(dateLike),
  trackedImpressionCounter: optional(urlLike),
  tracker: optional(urlLike),
  trackingUrl: optional(urlLike),
  url: optional(urlLike),
  viewableImpressionCounter: optional(urlLike),
  width: optional(numberLike),
  widthLarge: optional(numberLike),
});

export type AdResponse = (output<typeof baseSchema> & {
  additionalCreatives?: ReadonlyArray<AdResponse> | string;
});

const adResponseSchema: ZodMiniType<AdResponse> = extend(baseSchema, {
  additionalCreatives: lazy(() => optional(union([array(adResponseSchema), string()]))),
}) as ZodMiniType<AdResponse>;

export type PreParsedAd = output<typeof adResponseSchema> & {
  additionalCreatives?: ReadonlyArray<PreParsedAd> | string;
};

export type AdheseAd<T = string | Record<string, unknown> | ReadonlyArray<unknown>> = Omit<PreParsedAd, 'tag'> & {
  tag: T | string;
};

export const adSchema: ZodMiniType<PreParsedAd> = pipe(
  adResponseSchema,
  transform(({
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
  }),
) as ZodMiniType<PreParsedAd>;

export function parseResponse(response: unknown): ReadonlyArray<AdheseAd> {
  const rawArray = response as ReadonlyArray<Record<string, unknown>>;

  return rawArray.map((item) => {
    if (item.body && !item.tag)
      return adSchema.parse({ ...item, tag: item.body });
    return adSchema.parse(item);
  }) as ReadonlyArray<AdheseAd>;
}
