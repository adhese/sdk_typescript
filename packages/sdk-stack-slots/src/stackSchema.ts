import { type TypeOf, array, object, unknown } from 'zod';

export const stackSchema = object({
  ads: array(unknown()),
});

export type AdheseStackSchema = TypeOf<typeof stackSchema>;
