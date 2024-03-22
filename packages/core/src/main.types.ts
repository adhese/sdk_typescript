/* v8 ignore start */
import type { EventManager, Merge, UrlString } from '@utils';
import type { SlotManager, SlotManagerOptions } from './slot/slotManager/slotManager';
import type { AdheseSlot, AdheseSlotOptions } from './slot/createSlot/createSlot.types';
import type { Ad } from './requestAds/requestAds.schema';
import type { AdRequestOptions } from './requestAds/requestAds';
import type { MapWithEvents } from './main.utils';
import type { logger } from './logger/logger';

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
   * The requestAds type to use for the Adhese API requests. This can be either `GET` or `POST`. `POST` is the default
   * and offers the most options. `GET` is more limited as it needs pass its data as search parameters but can be used
   * in environments where `POST` requests are not allowed.
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
   * Additional parameters to send with each request. Make sure that the keys of a parameter only contain `2` characters.
   */
  parameters?: Record<string, ReadonlyArray<string> | string>;
  /**
   * The consent type to use for the Adhese API requests. This can be either `true` or `false`. `false` is the default and
   * will send all consent data to the Adhese API. `false` will send no consent data to the Adhese API.
   *
   * @default false
   */
  consent?: boolean;
  /**
   * Will log the `document.referrer` to the Adhese API in a BASE64 string with the `re` parameter.
   *
   * @default true
   */
  logReferrer?: boolean;
  /**
   * Will log the `window.location.href` to the Adhese API in a BASE64 string with the `ur` parameter.
   *
   * @default true
   */
  logUrl?: boolean;
  /**
   * If `true`, ads will be rendered immediately after they are fetched from the API. If `false`, ads will only be
   * rendered when the slot is in the viewport.
   *
   * @default false
   */
  eagerRendering?: boolean;
  /**
   * The query detector options for the Adhese instance.
   */
  queries?: Record<string, string>;
} & ({
  viewabilityTracking?: true;
  /**
   * Options for the viewability tracking of the ads. If `true` or `undefined`, the default viewability tracking options will be used.
   *
   * @default true
   */
  viewabilityTrackingOptions?: {
    /**
     * Fraction of the ad that needs to be in the viewport for the ad to be considered viewable.
     *
     * @default 0.2
     */
    threshold?: number;
    /**
     * The duration the ad needs to be in the viewport for the ad to be considered viewable in milliseconds.
     *
     * @default 1000
     */
    duration?: number;
    /**
     * The margin around the viewport where the ad is considered viewable.
     *
     * @default '0px'
     */
    rootMargin?: string;
  };
} | {
  viewabilityTracking?: false;
  viewabilityTrackingOptions?: never;
}) & Pick<SlotManagerOptions, 'initialSlots'>;

export type MergedOptions = Merge<AdheseOptions, Required<Pick<AdheseOptions, 'host' |
  'poolHost' |
  'location' |
  'requestType' |
  'debug' |
  'initialSlots' |
  'findDomSlotsOnLoad' |
  'consent' |
  'logUrl' |
  'logReferrer' |
  'eagerRendering' |
  'viewabilityTracking'>>>;

type AdheseEvents = {
  locationChange: string;
  consentChange: boolean;
  addSlot: AdheseSlot;
  removeSlot: AdheseSlot;
  changeSlots: ReadonlyArray<AdheseSlot>;
  responseReceived: ReadonlyArray<Ad>;
  requestAd: AdRequestOptions;
  requestError: Error;
  previewReceived: ReadonlyArray<Ad>;
  parametersChange: Map<string, ReadonlyArray<string> | string>;
};

export type Adhese = Omit<AdheseOptions, 'location' | 'parameters' | 'consent'> & Merge<SlotManager, {
  /**
   * The parameters that are used for all ads.
   */
  parameters: MapWithEvents<string, ReadonlyArray<string> | string>;
  /**
   * The event manager for the Adhese instance.
   */
  events: EventManager<AdheseEvents>;
  /**
   * Returns the current page location.
   */
  getLocation(): string;
  /**
   * Sets the current page location.
   */
  setLocation(location: string): void;
  /**
   * Returns the current consent type.
   */
  getConsent(): boolean;
  /**
   * Sets the current consent type.
   */
  setConsent(consent: boolean): void;
  /**
   * Adds a new slot to the Adhese instance and renders it.
   */
  addSlot(slot: Omit<AdheseSlotOptions, 'location' | 'context'>): Promise<Readonly<AdheseSlot>>;
  /**
   * Finds all slots in the DOM and adds them to the Adhese instance.
   */
  findDomSlots(): Promise<ReadonlyArray<AdheseSlot>>;
  /**
   * Removes all slots from the Adhese instance and cleans up the Adhese instance.
   *
   * After calling this method, the Adhese instance is no longer usable.
   */
  dispose(): void;
  /**
   * Toggles the debug mode of the Adhese instance.
   */
  toggleDebug(): Promise<boolean>;
}>;

export type AdheseContext = Partial<Pick<Adhese, 'events' | 'getAll' | 'get' | 'parameters'>> & {
  location: string;
  consent: boolean;
  options: Readonly<MergedOptions>;
  logger: typeof logger;
  debug: boolean;
};