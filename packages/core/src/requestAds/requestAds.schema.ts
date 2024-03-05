import { type TypeOf, type ZodType, coerce, lazy, literal, object, string, union, unknown } from 'zod';

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
  adspaceEnd: dateLike.optional(),
  adspaceId: string().optional(),
  adspaceKey: string().optional(),
  adspaceStart: dateLike.optional(),
  advertiserId: string().optional(),
  altText: string().optional(),
  auctionable: booleanLike.optional(),
  body: string().optional(),
  clickTag: urlLike.optional(),
  comment: string().optional(),
  creativeName: string().optional(),
  deliveryGroupId: string().optional(),
  deliveryMultiples: string().optional(),
  dm: string().optional(),
  ext: string().optional(),
  extension: object({
    mediaType: string(),
    prebid: unknown().optional(),
  }).optional(),
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
  originData: unknown().optional(),
  poolPath: urlLike.optional(),
  preview: booleanLike.optional(),
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
  timeStamp: dateLike.optional(),
  trackedImpressionCounter: urlLike.optional(),
  tracker: urlLike.optional(),
  trackingUrl: urlLike.optional(),
  url: urlLike.optional(),
  viewableImpressionCounter: urlLike.optional(),
  width: numberLike.optional(),
  width3rd: numberLike.optional(),
  width4th: numberLike.optional(),
  width5th: numberLike.optional(),
  width6th: numberLike.optional(),
  widthLarge: numberLike.optional(),
});
export type AdResponse = TypeOf<typeof baseAdResponseScheme> & {
  additionalCreatives?: ReadonlyArray<AdResponse> | string;
};
const adResponseSchema: ZodType<AdResponse> = baseAdResponseScheme.extend({
  additionalCreatives: lazy(() => union([adResponseSchema.array(), string()]).optional()),
}) as ZodType<AdResponse>;
export type Ad = TypeOf<typeof adResponseSchema> & {
  additionalCreatives?: ReadonlyArray<Ad> | string;
};
export const adSchema: ZodType<Ad> = adResponseSchema.transform(({
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
