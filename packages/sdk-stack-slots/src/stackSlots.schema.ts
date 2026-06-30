import { array, object, optional, type output, string, unknown, urlLike } from '@adhese/sdk-shared/validators';

export const stackSlotsSchema = object({
  ads: array(object({
    type: string(),
    native: object({
      impressionCounter: optional(urlLike),
      assets: optional(array(unknown())),
      link: optional(object({
        fallback: urlLike,
        url: urlLike,
      })),
      viewableImpressionCounter: optional(urlLike),
      ver: string(),
    }),
  })),
});

export type AdheseStackSchema = output<typeof stackSlotsSchema>;
