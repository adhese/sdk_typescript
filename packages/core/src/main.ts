import { type Merge, type UrlString, isUrlString } from '@utils';
import { logger } from './logger/logger';

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
};

export type AdheseInstance = Merge<AdheseOptions, {
  pageLocation: URL;
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
    },
  });

  if (!isUrlString(host) || !isUrlString(poolHost))
    logger.warn('Invalid host or poolHost');

  return {
    account,
    host,
    poolHost,
    requestType,
    pageLocation: new URL(pageLocation.toString()),
  };
}
