import { type TypeOf, array, object, string, unknown, urlLike } from '@adhese/sdk-shared/validators';

export const stackSlotsSchema = object({
  ads: array(object({
    type: string(),
    native: object({
      impressionCounter: urlLike.optional(),
      assets: array(unknown()).optional(),
      link: object({
        fallback: urlLike,
        url: urlLike,
      }).optional(),
      viewableImpressionCounter: urlLike.optional(),
      ver: string(),
    }),
  })),
});

export type AdheseStackSchema = TypeOf<typeof stackSlotsSchema>;
