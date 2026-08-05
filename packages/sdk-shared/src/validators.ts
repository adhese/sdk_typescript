import { coerce, literal, NEVER, number, string, union, ZodIssueCode } from 'zod';

function hasHtmlLikeMarkup(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

export const numberLike = union([coerce.string().regex(/^\d+$/), literal(''), coerce.number()]).transform(value => value === '' ? undefined : Number(value));
export const booleanLike = union([coerce.boolean(), literal('')]);
export const urlLike = union([coerce.string(), literal('')]).transform((value) => {
  try {
    return new URL(value);
  }
  catch {
    return undefined;
  }
});
export const dateLike = union([coerce.string(), literal(''), coerce.date()]).transform((value) => {
  if (value === '')
    return undefined;

  const date = new Date(numberLike.safeParse(value).success ? Number(value) : value);

  if (Number.isNaN(date.getTime()))
    return undefined;

  return date;
});
export const cssValueLike
  = union([coerce.string(), literal(''), number()]).transform<string | undefined>((value) => {
    if (value === '' || value === 0 || value === '0')
      return undefined;

    if (numberLike.parse(value))
      return `${numberLike.parse(value)}px`;

    return String(value);
  });
export const isJson = string().transform((value, { addIssue }) => {
  try {
    return JSON.parse(value.replaceAll('\\\'', '&#39;').replaceAll('\'', '"').replaceAll('&#39;', '\'')) as Record<string, unknown> | ReadonlyArray<unknown>;
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
  try {
    // DOMParser is not available in server runtimes (e.g. Next.js RSC / Node.js).
    if (typeof DOMParser === 'undefined') {
      if (!hasHtmlLikeMarkup(value))
        throw new Error('Invalid HTML');

      return value;
    }

    const html = new DOMParser().parseFromString(value, 'text/html');

    if (html.body?.children.length === 0 && !hasHtmlLikeMarkup(value))
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
export const isJsonOrHtmlOptionalString = union([isJsonOrHtmlString, coerce.string()]).transform((value) => {
  if (value === '')
    return undefined;

  return value;
}).optional();

export * from 'zod';
