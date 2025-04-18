import {
  booleanLike,
  cssValueLike,
  dateLike,
  isJsonOrHtmlOptionalString,
  isJsonOrHtmlString,
  lazy,
  literal,
  numberLike,
  object,
  string,
  type TypeOf,
  union,
  unknown,
  urlLike,
  type ZodType,
} from '@adhese/sdk-shared/validators';

const baseSchema = object({
  adDuration: numberLike.optional(),
  adFormat: string().optional(),
  adType: string(),
  additionalCreativeTracker: urlLike.optional(),
  additionalViewableTracker: string().optional(),
  adspaceEnd: dateLike.optional(),
  adspaceId: string().optional(),
  adspaceKey: string().optional(),
  adspaceStart: dateLike.optional(),
  advertiserId: string().optional(),
  altText: string().optional(),
  auctionable: booleanLike.optional(),
  body: isJsonOrHtmlOptionalString,
  clickTag: urlLike.optional(),
  comment: string().optional(),
  creativeName: string().optional(),
  deliveryGroupId: string().optional(),
  deliveryMultiples: string().optional(),
  ext: string().optional(),
  extension: object({
    mediaType: string(),
    prebid: unknown().optional(),
  }).optional(),
  height: numberLike.optional(),
  id: string().optional(),
  impressionCounter: urlLike.optional(),
  additonalTracker: urlLike.optional(),
  libId: string().optional(),
  orderId: string().optional(),
  orderName: string().optional(),
  orderProperty: string().optional(),
  origin: union([literal('JERLICIA'), literal('DALE')]),
  originData: unknown().optional(),
  originInstance: string().optional(),
  poolPath: urlLike.optional(),
  preview: booleanLike.optional(),
  priority: numberLike.optional(),
  sfSrc: urlLike.optional(),
  share: string().optional(),
  // eslint-disable-next-line ts/naming-convention
  slotID: string(),
  slotName: string(),
  swfSrc: urlLike.optional(),
  tag: isJsonOrHtmlOptionalString,
  tagUrl: urlLike.optional(),
  timeStamp: dateLike.optional(),
  trackedImpressionCounter: urlLike.optional(),
  tracker: urlLike.optional(),
  trackingUrl: urlLike.optional(),
  url: urlLike.optional(),
  viewableImpressionCounter: urlLike.optional(),
  width: numberLike.optional(),
  widthLarge: cssValueLike.optional(),
});

export const jerliciaSchema = object({
  origin: literal('JERLICIA'),
  tag: isJsonOrHtmlString,
}).passthrough();

export const daleSchema = object({
  origin: literal('DALE'),
  body: isJsonOrHtmlString,
}).passthrough().transform(({ body, ...data }) => ({
  ...data,
  tag: body,
}));

export type AdResponse = (TypeOf<typeof baseSchema> & {
  additionalCreatives?: ReadonlyArray<AdResponse> | string;
});

const adResponseSchema: ZodType<AdResponse> = baseSchema.extend({
  additionalCreatives: lazy(() => union([adResponseSchema.array(), string()]).optional()),
}) as ZodType<AdResponse>;

export type PreParsedAd = TypeOf<typeof adResponseSchema> & {
  additionalCreatives?: ReadonlyArray<PreParsedAd> | string;
};

export type AdheseAd<T = string | Record<string, unknown> | ReadonlyArray<unknown>> = Omit<PreParsedAd, 'tag'> & {
  tag: T | string;
};

export const adSchema: ZodType<PreParsedAd> = adResponseSchema.transform(({
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

export function parseResponse(response: unknown): ReadonlyArray<AdheseAd> {
  const schemaMap = {
    /* eslint-disable ts/naming-convention */
    JERLICIA: jerliciaSchema,
    DALE: daleSchema,
    /* eslint-enable ts/naming-convention */
  };

  const preParsed = adResponseSchema.array().parse(response);

  return preParsed.map((item) => {
    const schema = schemaMap[item.origin];

    if (!schema)
      return adSchema.parse(item);

    return schema.parse(item);
  }) as ReadonlyArray<AdheseAd>;
}
