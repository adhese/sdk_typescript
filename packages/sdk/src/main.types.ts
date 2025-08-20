/* v8 ignore start */
import type { EventManager, Merge } from '@adhese/sdk-shared';
import type { createGlobalHooks } from './hooks';
import type { logger } from './logger/logger';
import type { AdMultiRequestOptions } from './requestAds/requestAds';
import type { AdheseAd } from './requestAds/requestAds.schema';
import type { AdheseSlot, AdheseSlotOptions } from './slot/slot.types';

import type { SlotManagerOptions } from './slotManager/slotManager';

export type AdhesePluginInformation = {
  index: number;
  version: string;
  hooks: ReturnType<typeof createGlobalHooks>;
};

export type AdhesePlugin<
  T extends { name: string } & Record<string, unknown> = {
    name: string;
  } & Record<string, unknown>,
> = (context: AdheseContext, plugin: AdhesePluginInformation) => T;

type BaseOptions = {
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
  host?: string;
  /**
   * The url that is used to connect to the Adhese pool server. Pass a custom URL if you want to use your own domain for
   * the connection.
   *
   * @default 'https://pool-{{account}}.adhese.com'
   */
  poolHost?: string;
  /**
   * The url that is used to connect to the Adhese preview server. Pass a custom URL if you want to use your own domain for
   * the connection.
   *
   * @default 'https://{{account}}-preview.adhese.org'
   */
  previewHost?: string;
  /**
   * The page location. This is used to determine the current page location identifier.
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
   * If `true`, ads will be refreshed when a new device Type is detected when resizing your window
   *
   * @default true
   */
    refreshOnResize?: boolean;
  /**
   * The query detector options for the Adhese instance.
   */
  queries?: Record<string, string>;
} & (
  | {
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
  }
  | {
    viewabilityTracking?: false;
    viewabilityTrackingOptions?: never;
  }
) &
Pick<SlotManagerOptions, 'initialSlots'>;

export type AdheseOptions<T extends ReadonlyArray<AdhesePlugin> = []> =
  BaseOptions & {
    /**
     * The plugins that are used for the Adhese instance.
     */
    plugins?: T['length'] extends 0 ? ReadonlyArray<AdhesePlugin> : T;
  };

export type MergedOptions = Merge<
  BaseOptions,
  Required<
    Pick<
      BaseOptions,
      | 'host'
      | 'poolHost'
      | 'previewHost'
      | 'location'
      | 'requestType'
      | 'debug'
      | 'initialSlots'
      | 'findDomSlotsOnLoad'
      | 'consent'
      | 'logUrl'
      | 'logReferrer'
      | 'eagerRendering'
      | 'viewabilityTracking'
    >
  >
>;

type AdheseEvents = {
  locationChange: string;
  consentChange: boolean;
  addSlot: AdheseSlot;
  removeSlot: AdheseSlot;
  responseReceived: ReadonlyArray<AdheseAd>;
  requestAd: AdMultiRequestOptions;
  requestError: Error;
  previewReceived: ReadonlyArray<AdheseAd>;
  parametersChange: Map<string, ReadonlyArray<string> | string>;
  debugChange: boolean;
};

type BaseAdhese = {
  /**
   * The slots that are in the Adhese instance.
   */
  slots: Map<string, AdheseSlot>;
  /**
   * The page location. This is used to determine the current page location identifier.
   */
  location: string;
  /**
   * The consent type to use for the Adhese API requests. This can be either `true` or `false`. `false` is the default and
   * will send all consent data to the Adhese API. `false` will send no consent data to the Adhese API.
   */
  consent: boolean;
  /**
   * String that is generated by either the binary consent passed with `consent` property or the value passed by the TCF
   * API. If consent is `true` the string will be `all` otherwise it will be `none`. If the consent is coming from TCF
   * the string will be the TCF string.
   */
  consentString?: string;
  /**
   * The logger instance that is used for multi level console logging
   */
  logger: typeof logger;
  /**
   * Debug mode of the Adhese instance. When set to true will log verbose logs to the console and will load the Devtools.
   */
  debug: boolean;
  /**
   * The parameters that are used for all ads.
   */
  parameters: Map<string, ReadonlyArray<string> | string>;
  /**
   * The event manager for the Adhese instance.
   */
  events: EventManager<AdheseEvents>;
  /**
   * Options passed to the Adhese instance.
   */
  options: Readonly<MergedOptions>;
  /**
   * Is the instance disposed
   */
  isDisposed: boolean;
  /**
   * Active media query device
   */
  device: string;
  /**
   * Get a slot by name.
   * @param name The name of the slot.
   */
  get(name: string): AdheseSlot | undefined;
  /**
   * Get all slots in the Adhese instance.
   */
  getAll(): ReadonlyArray<AdheseSlot>;
  /**
   * Adds a new slot to the Adhese instance and renders it.
   */
  addSlot(
    slot: Omit<AdheseSlotOptions, 'location' | 'context'>
  ): Readonly<AdheseSlot>;
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
};

type ExtractFromTupleWithNameKey<
  T extends string,
  U extends Record<string, unknown>,
> = U extends { name: T } ? U : never;
type Plugins<
  T extends ReadonlyArray<AdhesePlugin> = [],
  U extends { name: string } = ReturnType<
    Required<AdheseOptions<T>>['plugins'][number]
  >,
> = {
  [K in U['name']]: Omit<ExtractFromTupleWithNameKey<K, U>, 'name'>;
};

type ReadonlyProps =
  | 'options'
  | 'isDisposed'
  | 'logger'
  | 'events'
  | 'get'
  | 'getAll'
  | 'addSlot'
  | 'findDomSlots'
  | 'dispose'
  | 'slots'
  | 'device'
  | 'consentString';
export type Adhese<T extends ReadonlyArray<AdhesePlugin> = []> = Omit<
  BaseAdhese,
  ReadonlyProps
> &
Readonly<Pick<BaseAdhese, ReadonlyProps>> & {
  plugins: Plugins<T>;
};

export type AdheseContextState = Omit<BaseAdhese, 'options'> & {
  readonly options: MergedOptions;
  hooks: ReturnType<typeof createGlobalHooks>;
};
export type AdheseContextStateWithPlugins<
  T extends ReadonlyArray<AdhesePlugin> = [],
> = AdheseContextState & {
  plugins: Partial<Plugins<T>>;
};

type NonPartialProps =
  | 'options'
  | 'logger'
  | 'events'
  | 'isDisposed'
  | 'location'
  | 'consent'
  | 'debug'
  | 'parameters'
  | 'slots'
  | 'hooks';
export type AdheseContext = Omit<Partial<AdheseContextState>, NonPartialProps> &
  Pick<AdheseContextState, NonPartialProps>;
export type AdheseContextWithPlugins<
  T extends ReadonlyArray<AdhesePlugin> = [],
> = AdheseContext & {
  plugins?: Plugins<T>;
};
