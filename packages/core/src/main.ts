import { type Merge, type UrlString, isUrlString } from '@utils';
import { type Slot, type SlotOptions, logger } from '@core';

import { type SlotManager, createSlotManager } from './slot/slotManager/slotManager';

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
   * The page location. This is used to determine the current page location identifier.
   *
   * @default location.pathname
   */
  pageLocation?: string;
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
  /**
   * Returns the current page location.
   */
  getPageLocation(): string;
  /**
   * Sets the current page location.
   */
  setPageLocation(location: string): void;
}> & Merge<SlotManager, {
  /**
   * Adds a new slot to the Adhese instance and renders it.
   */
  addSlot(slot: Omit<SlotOptions, 'location'>): Readonly<Slot>;
}>;

/**
 * Creates an Adhese instance. This instance is your main entry point to the Adhese API.
 */
export function createAdhese({
  account,
  host = `https://ads-${account}.adhese.com`,
  poolHost = `https://pool-${account}.adhese.com`,
  pageLocation = location.pathname,
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

  let currentLocation = pageLocation;

  const {
    addSlot,
    ...slotManager
  } = createSlotManager({
    location: currentLocation,
    initialSlots,
  });

  return {
    account,
    host,
    poolHost,
    requestType,
    getPageLocation(): string {
      return currentLocation;
    },
    setPageLocation(location: string): void {
      currentLocation = location;
    },
    addSlot(slot: Omit<SlotOptions, 'location'>): Readonly<Slot> {
      return addSlot({
        ...slot,
        location: currentLocation,
      });
    },
    ...slotManager,
  };
}
