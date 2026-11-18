export type AdRequestOptions = {
  account: string;
  host?: string;
  location: string;
  slots: ReadonlyArray<{ format: string }>;
  parameters?: Record<string, ReadonlyArray<string> | string>;
};

/**
 * Same character rules as `@adhese/sdk`: anything but letters, numbers and `_` becomes `_`, lowercased.
 */
export function filterSpecialChars(value: string): string {
  return value.replaceAll(/[^\p{L}\p{N}_]/gu, '_').toLowerCase();
}

/**
 * Build the Adhese GET ad request: `<host>/json/sl<location>-<format>/<key><value>[;<value>]`.
 * Slot names follow `generateName` of `@adhese/sdk-shared`. Keys that are not exactly 2 characters are dropped.
 *
 * TODO: move to `@adhese/sdk-shared` and use it from `@adhese/sdk` so both produce identical requests.
 */
export function buildAdRequestUrl({ account, host, location, slots, parameters = {} }: AdRequestOptions): string {
  const base = (host ?? `https://ads-${account}.adhese.com`).replace(/\/+$/, '');
  const slotPart = slots.map(({ format }) => `/sl${location}-${format}`).join('');
  const parameterPart = Object.entries(parameters)
    .filter(([key]) => key.length === 2)
    .map(([key, value]) => `/${key}${(typeof value === 'string' ? [value] : value).map(filterSpecialChars).join(';')}`)
    .join('');

  return `${base}/json${slotPart}${parameterPart}`;
}

/**
 * Device type with the SDK's default breakpoints (phone, tablet, desktop), sent as both `dt` and `br`.
 */
export function deviceParams(win: Window = window): Record<string, string> {
  let device = 'desktop';
  if (win.matchMedia('(max-width: 768px)').matches)
    device = 'phone';
  else if (win.matchMedia('(max-width: 1024px)').matches)
    device = 'tablet';

  return { dt: device, br: device };
}
