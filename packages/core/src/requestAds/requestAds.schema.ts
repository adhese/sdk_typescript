import {
  NEVER,
  type TypeOf,
  ZodIssueCode,
  type ZodType,
  coerce,
  lazy,
  literal,
  object,
  string,
  union,
  unknown,
} from 'zod';

export const numberLike = union([coerce.string().regex(/^\d+$/), literal('')]).transform(value => value === '' ? undefined : Number(value));
export const booleanLike = union([coerce.boolean(), literal('')]);
export const urlLike = union([coerce.string(), literal('')]).transform((value) => {
  try {
    return new URL(value);
  }
  catch {
    return undefined;
  }
});
export const dateLike = union([coerce.string(), literal('')]).transform((value) => {
  if (value === '')
    return undefined;

  const date = new Date(numberLike.safeParse(value).success ? Number(value) : value);

  if (Number.isNaN(date.getTime()))
    return undefined;

  return date;
});

export const isJson = string().transform((value, { addIssue }) => {
  try {
    return JSON.parse(value.replaceAll('\'', '"')) as Record<string, unknown> | ReadonlyArray<unknown>;
  }
  catch (error) {
    addIssue({
      code: ZodIssueCode.custom,
      message: `Invalid JSON: ${(error as Error).message}`,
    });

    return NEVER;
  }
});

export const isHtmlString = string().transform((value, { addIssue }) => {
  const htmlParser = new DOMParser();

  try {
    const html = htmlParser.parseFromString(value, 'text/html');

    if (html.body?.children.length === 0)
      throw new Error('Invalid HTML');

    return value;
  }
  catch (error) {
    addIssue({
      code: ZodIssueCode.custom,
      message: (error as Error).message,
    });

    return NEVER;
  }
});

export const isJsonOrHtmlString = union([isJson, isHtmlString]);

export const isJsonOrHtmlOptionalString = union([coerce.string(), isJsonOrHtmlString]).transform((value) => {
  if (value === '')
    return undefined;

  return value;
}).optional();

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
  widthLarge: numberLike.optional(),
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

export type Ad = Omit<PreParsedAd, 'tag'> & {
  tag: string | Record<string, unknown> | ReadonlyArray<unknown>;
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

export function parseResponse(response: unknown): ReadonlyArray<Ad> {
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
  }) as ReadonlyArray<Ad>;
}
