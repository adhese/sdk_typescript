import { coerce, literal, NEVER, number, optional, pipe, regex, string, transform, union } from 'zod/mini';

export const numberLike = pipe(
  union([coerce.string().check(regex(/^\d+$/)), literal(''), coerce.number()]),
  transform((value) => {
    if (value === '')
      return undefined;

    return Number(value);
  }),
);
export const booleanLike = union([coerce.boolean(), literal('')]);
export const urlLike = pipe(
  union([coerce.string(), literal('')]),
  transform((value) => {
    try {
      return new URL(value);
    }
    catch {
      return undefined;
    }
  }),
);
export const dateLike = pipe(
  union([coerce.string(), literal(''), coerce.date()]),
  transform((value) => {
    if (value === '')
      return undefined;

    const parsedNumberLike = numberLike.safeParse(value);
    const date = new Date(parsedNumberLike.success ? Number(value) : value);

    if (Number.isNaN(date.getTime()))
      return undefined;

    return date;
  }),
);
export const cssValueLike
  = pipe(
    union([coerce.string(), literal(''), number()]),
    transform<string | number, string | undefined>((value) => {
      if (value === '' || value === 0 || value === '0')
        return undefined;

      const parsedNumberLike = numberLike.safeParse(value);
      if (parsedNumberLike.success && parsedNumberLike.data !== undefined)
        return `${parsedNumberLike.data}px`;

      return String(value);
    }),
  );
export const isJson = pipe(string(), transform((value, ctx) => {
  try {
    return JSON.parse(value.replaceAll('\\\'', '&#39;').replaceAll('\'', '"').replaceAll('&#39;', '\'')) as Record<string, unknown> | ReadonlyArray<unknown>;
  }
  catch (error) {
    ctx.issues.push({
      code: 'custom',
      input: value,
      message: `Invalid JSON: ${(error as Error).message}`,
    });

    return NEVER;
  }
}));
export const isHtmlString = pipe(string(), transform((value, ctx) => {
  const htmlParser = new DOMParser();

  try {
    const html = htmlParser.parseFromString(value, 'text/html');

    if (html.body?.children.length === 0 && !/<[a-z][\s\S]*>/i.test(value))
      throw new Error('Invalid HTML');

    return value;
  }
  catch (error) {
    ctx.issues.push({
      code: 'custom',
      input: value,
      message: (error as Error).message,
    });

    return NEVER;
  }
}));
export const isJsonOrHtmlString = union([isJson, isHtmlString]);
export const isJsonOrHtmlOptionalString = optional(pipe(
  union([isJsonOrHtmlString, coerce.string()]),
  transform((value) => {
    if (value === '')
      return undefined;

    return value;
  }),
));

export * from 'zod/mini';
