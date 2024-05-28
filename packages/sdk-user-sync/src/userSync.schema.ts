import { boolean, dateLike, number, object, optional, string } from '@adhese/sdk-shared/validators';

export const userSyncSchema = object({
  ok: boolean(),
});

export const userSyncErrorSchema = object({
  timestamp: dateLike,
  status: number(),
  error: string(),
  path: optional(string()),
});
