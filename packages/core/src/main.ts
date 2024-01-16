export type AdheseOptions = {
  /**
   * The Adhese account name.
   */
  account: string;
  /**
   * The Adhese host URL you want to use. Set this to your custom domain if you want to use your own domain for the
   * Adhese scripts.
   *
   * @default 'https://ads.adhese.com'
   */
  hostUrl?: string;
  /**
   * The page location. This is used to determine the current page URL and to determine the current page's domain.
   *
   * @default location
   */
  pageLocation?: Location | URL;
};

export const defaultAdheseOptions: Partial<AdheseOptions> = {
  hostUrl: 'https://ads.adhese.com',
  pageLocation: location,
};

export type AdheseInstance = AdheseOptions & typeof defaultAdheseOptions;

/**
 * Creates an Adhese instance. This instance is your main entry point to the Adhese API.
 * @param options
 */
export function createAdhese(options: AdheseOptions): AdheseInstance {
  const mergedOptions = { ...defaultAdheseOptions, ...options };

  // eslint-disable-next-line no-console
  console.log('Adhese SDK initialized with options:', mergedOptions);

  return mergedOptions;
}
