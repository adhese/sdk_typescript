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
} & Pick<SlotManagerOptions, 'initialSlots'>;

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
  addSlot(slot: Omit<SlotOptions, 'location'>): Promise<Readonly<Slot>>;
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

export type AdheseContext = Partial<Pick<Adhese, 'events' | 'getAll' | 'get'>> & {
  location: string;
  consent: boolean;
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
    ...options,
  } satisfies AdheseOptions;
  setupLogging(mergedOptions);

  const {
    revoke: revokeContext,
    proxy: context,
  } = Proxy.revocable<AdheseContext>({
    location: mergedOptions.location,
    consent: mergedOptions.consent,
    getAll,
    get,
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

  const parameters = createParameters(mergedOptions, deviceDetector);

  async function onDeviceChange(): Promise<void> {
    const device = deviceDetector.getDevice();
    parameters.set('dt', device);
    parameters.set('br', device);

    await fetchAndRenderAllSlots();
  }

  function getConsent(): typeof context.consent {
    return context.consent;
  }

  function setConsent(newConsent: boolean): void {
    parameters.set('tl', newConsent ? 'all' : 'none');
    context.consent = newConsent;

    context.events?.consentChange.dispatch(newConsent);
  }

  createPreviewUi();

  const slotManager = createSlotManager({
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
    const slot = slotManager.add(slotOptions);

    const ad = await requestAd({
      slot,
      host: mergedOptions.host,
      parameters,
      account: mergedOptions.account,
      context,
    });

    await slot.render(ad);

    return slot;
  }

  async function findDomSlots(): Promise<ReadonlyArray<Slot>> {
    const domSlots = await slotManager.findDomSlots();

    const ads = await requestAds({
      host: mergedOptions.host,
      slots: domSlots,
      method: mergedOptions.requestType,
      account: mergedOptions.account,
      parameters,
      context,
    });

    await Promise.allSettled(ads.map(ad => slotManager.get(ad.slotName)?.render(ad)));

    return domSlots;
  }

  async function fetchAndRenderAllSlots(): Promise<void> {
    const ads = await requestAds({
      host: mergedOptions.host,
      slots: slotManager.getAll(),
      method: mergedOptions.requestType,
      account: mergedOptions.account,
      parameters,
      context,
    });

    await Promise.allSettled(ads.map(ad => slotManager.get(ad.slotName)?.render(ad)));
  }

  const disposeOnTcfConsentChange = onTcfConsentChange(async (data) => {
    if (!data.tcString)
      return;

    logger.debug('TCF v2 consent data received', {
      data,
    });

    parameters.set('xt', data.tcString);
    parameters.delete('tl');

    await fetchAndRenderAllSlots();
  });

  function dispose(): void {
    deviceDetector.dispose();
    slotManager.dispose();
    deviceDetector.dispose();
    disposeOnTcfConsentChange();
    parameters.clear();
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
    parameters,
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
