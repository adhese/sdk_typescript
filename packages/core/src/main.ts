import { type EventManager, type Merge, type UrlString, createEventManager } from '@utils';
import { type Ad, type AdRequestOptions, type Slot, type SlotOptions, logger, requestAd, requestAds } from '@core';
import { type SlotManager, type SlotManagerOptions, createSlotManager } from './slot/slotManager/slotManager';
import { onTcfConsentChange } from './consent/tcfConsent';
import { createDeviceDetector } from './deviceDetector/deviceDetector';
import { createParameters, createPreviewUi, setupLogging } from './main.utils';

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

type MergedOptions = Merge<AdheseOptions, Required<Pick<AdheseOptions, 'host' |
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
  addSlot: Slot;
  removeSlot: Slot;
  requestAd: {
    request: AdRequestOptions;
    response: ReadonlyArray<Ad>;
  };
};

export type Adhese = Omit<AdheseOptions, 'location' | 'parameters' | 'consent'> & Merge<SlotManager, {
  /**
   * The parameters that are used for all ads.
   */
  parameters: Map<string, ReadonlyArray<string> | string>;
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
  addSlot(slot: Omit<SlotOptions, 'location' | 'context'>): Promise<Readonly<Slot>>;
  /**
   * Finds all slots in the DOM and adds them to the Adhese instance.
   */
  findDomSlots(): Promise<ReadonlyArray<Slot>>;
  /**
   * Removes all slots from the Adhese instance and cleans up the Adhese instance.
   *
   * After calling this method, the Adhese instance is no longer usable.
   */
  dispose(): void;
}>;

export type AdheseContext = Partial<Pick<Adhese, 'events' | 'getAll' | 'get' | 'parameters'>> & {
  location: string;
  consent: boolean;
  options: Readonly<MergedOptions>;
};

/**
 * Creates an Adhese instance. This instance is your main entry point to the Adhese API.
 *
 * @param options
 * @param options.account The Adhese account name.
 * @param options.host The url that is used to connect to the Adhese ad server. Pass a custom URL if you want to use
 * your own domain for the connection.
 * @param options.poolHost The url that is used to connect to the Adhese pool server. Pass a custom URL if you want to
 * use your own domain for the connection.
 * @param options.location The page location. This is used to determine the current page location identifier.
 * @param options.requestType The requestAds type to use for the Adhese API requests. This can be either `GET` or
 * `POST`. `POST` is the default and offers the most options. `GET` is more limited as it needs pass its data as search
 * parameters but can be used in environments where `POST` requests are not allowed.
 * @param options.debug Enable debug logging.
 * @param options.initialSlots The initial slots to add to the Adhese instance.
 * @param options.findDomSlotsOnLoad Find all slots in the DOM and add them to the Adhese instance during
 * initialization.
 * @param options.parameters Base parameters that are used for all ads.
 * @param options.consent The consent type to use for the Adhese API requests. This can be either `all` or `none`.
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
    consent: false,
    logReferrer: true,
    logUrl: true,
    eagerRendering: false,
    viewabilityTracking: true,
    ...options,
  } satisfies MergedOptions;
  setupLogging(mergedOptions);

  const {
    revoke: revokeContext,
    proxy: context,
  } = Proxy.revocable<AdheseContext>({
    location: mergedOptions.location,
    consent: mergedOptions.consent,
    getAll,
    get,
    options: mergedOptions,
  }, {});

  context.events = createEventManager<AdheseEvents>([
    'locationChange',
    'consentChange',
    'addSlot',
    'removeSlot',
    'requestAd',
  ]);

  function getLocation(): typeof context.location {
    return context.location;
  }

  function setLocation(newLocation: string): void {
    context.location = newLocation;
    context.events?.locationChange.dispatch(newLocation);
  }

  const deviceDetector = createDeviceDetector({
    onChange: onDeviceChange,
  });

  context.parameters = createParameters(mergedOptions, deviceDetector);

  async function onDeviceChange(): Promise<void> {
    const device = deviceDetector.getDevice();
    context.parameters?.set('dt', device);
    context.parameters?.set('br', device);

    await fetchAndRenderAllSlots();
  }

  function getConsent(): typeof context.consent {
    return context.consent;
  }

  function setConsent(newConsent: boolean): void {
    context.parameters?.set('tl', newConsent ? 'all' : 'none');
    context.consent = newConsent;

    context.events?.consentChange.dispatch(newConsent);
  }

  createPreviewUi();

  const slotManager = await createSlotManager({
    initialSlots: mergedOptions.initialSlots,
    context,
  });

  function getAll(): ReadonlyArray<Slot> {
    return slotManager.getAll();
  }

  function get(name: string): Slot | undefined {
    return slotManager.get(name);
  }

  async function addSlot(slotOptions: SlotOptions): Promise<Readonly<Slot>> {
    const slot = await slotManager.add(slotOptions);

    if (!slot.lazyLoading) {
      const ad = await requestAd({
        slot,
        host: mergedOptions.host,
        parameters: context.parameters,
        account: mergedOptions.account,
        context,
      });

      await slot.setAd(ad);
    }

    return slot;
  }

  async function findDomSlots(): Promise<ReadonlyArray<Slot>> {
    const domSlots = (await slotManager.findDomSlots()).filter(slot => !slot.lazyLoading);

    const ads = await requestAds({
      host: mergedOptions.host,
      slots: domSlots,
      method: mergedOptions.requestType,
      account: mergedOptions.account,
      parameters: context.parameters,
      context,
    });

    await Promise.allSettled(ads.map(ad => slotManager.get(ad.slotName)?.setAd(ad)));

    return domSlots;
  }

  async function fetchAndRenderAllSlots(): Promise<void> {
    const ads = await requestAds({
      host: mergedOptions.host,
      slots: slotManager.getAll().filter(slot => !slot.lazyLoading),
      method: mergedOptions.requestType,
      account: mergedOptions.account,
      parameters: context.parameters,
      context,
    });

    await Promise.allSettled(ads.map(ad => slotManager.get(ad.slotName)?.setAd(ad)));
  }

  const disposeOnTcfConsentChange = onTcfConsentChange(async (data) => {
    if (!data.tcString)
      return;

    logger.debug('TCF v2 consent data received', {
      data,
    });

    context.parameters?.set('xt', data.tcString);
    context.parameters?.delete('tl');

    await fetchAndRenderAllSlots();
  });

  function dispose(): void {
    deviceDetector.dispose();
    slotManager.dispose();
    deviceDetector.dispose();
    disposeOnTcfConsentChange();
    context.parameters?.clear();
    logger.resetLogs();
    context.events?.dispose();
    revokeContext();
  }

  if (mergedOptions.findDomSlotsOnLoad)
    await slotManager.findDomSlots();

  if (slotManager.getAll().length > 0)
    await fetchAndRenderAllSlots();

  return {
    ...mergedOptions,
    ...slotManager,
    parameters: context.parameters,
    events: context.events,
    getLocation,
    setLocation,
    getConsent,
    setConsent,
    addSlot,
    findDomSlots,
    dispose,
  };
}
