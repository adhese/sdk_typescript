import { type Merge, type UrlString, isUrlString } from '@utils';
import { type Slot, type SlotOptions, createSlot, logger } from '@core';

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
  host?: UrlString;
  /**
   * The url that is used to connect to the Adhese pool server. Pass a custom URL if you want to use your own domain for
   * the connection.
   *
   * @default 'https://pool-{{account}}.adhese.com'
   */
  poolHost?: UrlString;
  /**
   * The page location. This is used to determine the current page URL and to determine the current page's domain.
   *
   * @default location
   */
  pageLocation?: Location | URL | UrlString;
  /**
   * The request type to use for the Adhese API requests. This can be either `GET` or `POST`. `POST` is the default and
   * offers the most options. `GET` is more limited as it needs pass its data as search parameters but can be used in environments where `POST` requests are not allowed.
   *
   * @default 'POST'
   */
  requestType?: 'GET' | 'POST';
  /**
   * Enable debug logging.
   *
   * @default false
   */
  debug?: boolean;
  initialSlots?: ReadonlyArray<Omit<SlotOptions, 'location'>>;
};

export type AdheseInstance = Merge<Omit<AdheseOptions, 'pageLocation'>, {
  getPageLocation(): UrlString;
  setPageLocation(location: Location | URL | UrlString): void;
  getSlots(): ReadonlyArray<SlotOptions>;
}>;

/**
 * Creates an Adhese instance. This instance is your main entry point to the Adhese API.
 */
export function createAdhese({
  account,
  host = `https://ads-${account}.adhese.com`,
  poolHost = `https://pool-${account}.adhese.com`,
  pageLocation = location,
  requestType = 'POST',
  debug = false,
  initialSlots = [],
}: AdheseOptions): Readonly<AdheseInstance> {
  if (debug) {
    logger.setMinLogLevelThreshold('debug');
    logger.debug('Debug logging enabled');
  }

  logger.debug('Created Adhese SDK instance', {
    options: {
      account,
      host,
      poolHost,
      pageLocation: pageLocation.toString(),
      requestType,
      initialSlots,
    },
  });

  if (!isUrlString(host) || !isUrlString(poolHost))
    logger.warn('Invalid host or poolHost');

  let currentLocation = pageLocation.toString() as UrlString;

  const slots = new Set<Slot>(initialSlots.map(slot => createSlot({
    ...slot,
    location: pageLocation.toString() as UrlString,
  })));

  for (const slot of slots)
    slot.render();

  return {
    account,
    host,
    poolHost,
    requestType,
    getPageLocation(): UrlString {
      return currentLocation;
    },
    setPageLocation(location: Location | URL | UrlString): void {
      currentLocation = location.toString() as UrlString;
    },
    getSlots(): ReadonlyArray<SlotOptions> {
      return Array.from(slots);
    },
  };
}
