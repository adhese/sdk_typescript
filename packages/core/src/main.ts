import type { Merge } from '@utils';

export type AdheseOptions = {
  /**
   * The Adhese account name.
   */
  account: string;
  /**
   * The url that is used to connect to the Adhese ad server. Pass a custom URL if you want to use your own domain for
   * the connection.
   *
   * @default 'https://ads-{{account}}.adhese.com'
   */
  adUrl?: string;
  /**
   * The url that is used to connect to the Adhese pool server. Pass a custom URL if you want to use your own domain for
   * the connection.
   *
   * @default 'https://pool-{{account}}.adhese.com'
   */
  poolUrl?: string;
  /**
   * The page location. This is used to determine the current page URL and to determine the current page's domain.
   *
   * @default location
   */
  pageLocation?: Location | URL;
};

export type AdheseInstance = Merge<AdheseOptions, {
  pageLocation: URL;
}>;

/**
 * Creates an Adhese instance. This instance is your main entry point to the Adhese API.
 *
 * @param options The options to use for the Adhese instance. See {@link AdheseOptions} for more information.
 */
export function createAdhese(options: AdheseOptions): Readonly<AdheseInstance> {
  const mergedOptions = {
    adUrl: `https://ads-${options.account}.adhese.com`,
    poolUrl: `https://pool-${options.account}.adhese.com`,
    pageLocation: location,
    ...options,
  } satisfies Required<AdheseOptions>;

  // eslint-disable-next-line no-console
  console.log('Adhese SDK initialized with options:', mergedOptions);

  return {
    ...mergedOptions,
    pageLocation: new URL(mergedOptions.pageLocation.toString()),
  };
}
