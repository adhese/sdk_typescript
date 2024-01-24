import { type Merge, type UrlString, isUrlString } from '@utils';
import { type Slot, type SlotOptions, logger, requestAds } from '@core';

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
} & Pick<SlotManagerOptions, 'initialSlots'>;

export type Adhese = Merge<Omit<AdheseOptions, 'location'>, {
  /**
   * Returns the current page location.
   */
  getLocation(): string;
  /**
   * Sets the current page location.
   */
  setLocation(location: string): void;
}> & Merge<SlotManager, {
  /**
   * Adds a new slot to the Adhese instance and renders it.
   */
  addSlot(slot: Omit<SlotOptions, 'location'>): Readonly<Slot>;
  /**
   * Finds all slots in the DOM and adds them to the Adhese instance.
   */
  findDomSlots(): Promise<ReadonlyArray<Slot>>;
}>;

/**
 * Creates an Adhese instance. This instance is your main entry point to the Adhese API.
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

  const slotManager = createSlotManager({
    location,
    initialSlots: mergedOptions.initialSlots,
  });
  if (mergedOptions.findDomSlotsOnLoad)
    await slotManager.findDomSlots();

  if (slotManager.getSlots().length > 0) {
    const ads = await requestAds({
      host: mergedOptions.host,
      slots: slotManager.getSlots(),
    });

    await Promise.allSettled(ads.map(ad => slotManager.getSlot(ad.slotName)?.render(ad.tag)));
  }

  return {
    ...mergedOptions,
    ...slotManager,
    getLocation(): string {
      return location;
    },
    setLocation(newLocation): void {
      location = newLocation;
    },
    addSlot(slot): Readonly<Slot> {
      return slotManager.addSlot({
        ...slot,
        location,
      } as SlotOptions);
    },
    async findDomSlots(): Promise<ReadonlyArray<Slot>> {
      const domSlots = await slotManager.findDomSlots(location);

      const ads = await requestAds({
        host: mergedOptions.host,
        slots: domSlots,
      });

      await Promise.allSettled(ads.map(ad => slotManager.getSlot(ad.slotName)?.render(ad.tag)));

      return domSlots;
    },
  };
}
