import { type Merge, type UrlString, isUrlString } from '@utils';
import { type Slot, type SlotOptions, logger, requestAd, requestAds } from '@core';

import { type SlotManager, type SlotManagerOptions, createSlotManager } from './slot/slotManager/slotManager';

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
  location?: string;
  /**
   * The requestAds type to use for the Adhese API requests. This can be either `GET` or `POST`. `POST` is the default and
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
  /**
   * Find all slots in the DOM and add them to the Adhese instance during initialization.
   *
   * @default false
   */
  findDomSlotsOnLoad?: boolean;
  /**
   * Base parameters that are used for all ads.
   */
  parameters?: Record<string, ReadonlyArray<string> | string>;
} & Pick<SlotManagerOptions, 'initialSlots'>;

export type Adhese = Omit<AdheseOptions, 'location' | 'parameters'> & Merge<SlotManager, {
  /**
   * The parameters that are used for all ads.
   */
  parameters: Map<string, ReadonlyArray<string> | string>;
  /**
   * Returns the current page location.
   */
  getLocation(): string;
  /**
   * Sets the current page location.
   */
  setLocation(location: string): void;
  /**
   * Adds a new slot to the Adhese instance and renders it.
   */
  addSlot(slot: Omit<SlotOptions, 'location'>): Promise<Readonly<Slot>>;
  /**
   * Finds all slots in the DOM and adds them to the Adhese instance.
   */
  findDomSlots(): Promise<ReadonlyArray<Slot>>;
}>;

/**
 * Creates an Adhese instance. This instance is your main entry point to the Adhese API.
 *
 * @param options
 * @param options.account The Adhese account name.
 * @param options.host The url that is used to connect to the Adhese ad server. Pass a custom URL if you want to use your own domain for the connection.
 * @param options.poolHost The url that is used to connect to the Adhese pool server. Pass a custom URL if you want to use your own domain for the connection.
 * @param options.location The page location. This is used to determine the current page location identifier.
 * @param options.requestType The requestAds type to use for the Adhese API requests. This can be either `GET` or `POST`. `POST` is the default and offers the most options. `GET` is more limited as it needs pass its data as search parameters but can be used in environments where `POST` requests are not allowed.
 * @param options.debug Enable debug logging.
 * @param options.initialSlots The initial slots to add to the Adhese instance.
 * @param options.findDomSlotsOnLoad Find all slots in the DOM and add them to the Adhese instance during initialization.
 * @param options.parameters Base parameters that are used for all ads.
 *
 * @return Promise<Adhese> The Adhese instance.
 */
export async function createAdhese(options: AdheseOptions): Promise<Readonly<Adhese>> {
  const mergedOptions = {
    host: `https://ads-${options.account}.adhese.com`,
    poolHost: `https://pool-${options.account}.adhese.com`,
    location: 'homepage',
    requestType: 'POST',
    debug: false,
    initialSlots: [],
    findDomSlotsOnLoad: false,
    ...options,
  } satisfies AdheseOptions;
  if (mergedOptions.debug) {
    logger.setMinLogLevelThreshold('debug');
    logger.debug('Debug logging enabled');
  }

  logger.debug('Created Adhese SDK instance', {
    options,
  });

  if (!isUrlString(mergedOptions.host) || !isUrlString(mergedOptions.poolHost))
    logger.warn('Invalid host or poolHost');

  let { location } = mergedOptions;
  const parameters = new Map(Object.entries(options.parameters ?? {}));

  const slotManager = createSlotManager({
    location,
    initialSlots: mergedOptions.initialSlots,
  });
  if (mergedOptions.findDomSlotsOnLoad)
    await slotManager.findDomSlots();

  if (slotManager.getAll().length > 0) {
    const ads = await requestAds({
      host: mergedOptions.host,
      slots: slotManager.getAll(),
      method: mergedOptions.requestType,
      parameters,
    });

    await Promise.allSettled(ads.map(ad => slotManager.get(ad.slotName)?.render(ad)));
  }

  return {
    ...mergedOptions,
    ...slotManager,
    parameters,
    getLocation(): string {
      return location;
    },
    setLocation(newLocation): void {
      location = newLocation;
    },
    async addSlot(slotOptions): Promise<Readonly<Slot>> {
      const slot = slotManager.add({
        ...slotOptions,
        location,
      } as SlotOptions);

      const ad = await requestAd({
        slot,
        host: mergedOptions.host,
      });

      await slot.render(ad);

      return slot;
    },
    async findDomSlots(): Promise<ReadonlyArray<Slot>> {
      const domSlots = await slotManager.findDomSlots(location);

      const ads = await requestAds({
        host: mergedOptions.host,
        slots: domSlots,
        method: mergedOptions.requestType,
        parameters,
      });

      await Promise.allSettled(ads.map(ad => slotManager.get(ad.slotName)?.render(ad)));

      return domSlots;
    },
  };
}
