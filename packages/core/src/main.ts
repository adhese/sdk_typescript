import { type Merge, type UrlString, isUrlString } from '@utils';
import { type Slot, type SlotOptions, logger, requestAd, requestAds } from '@core';

import { type SlotManager, type SlotManagerOptions, createSlotManager } from './slot/slotManager/slotManager';
import { onTcfConsentChange } from './consent/tcfConsent';
import { createDeviceDetector } from './deviceDetector/deviceDetector';

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
   * Base parameters that are used for all ads.
   */
  parameters?: Record<string, ReadonlyArray<string> | string>;
  /**
   * The consent type to use for the Adhese API requests. This can be either `true` or `false`. `false` is the default and
   * will send all consent data to the Adhese API. `false` will send no consent data to the Adhese API.
   *
   * @default false
   */
  consent?: boolean;
} & Pick<SlotManagerOptions, 'initialSlots'>;

export type Adhese = Omit<AdheseOptions, 'location' | 'parameters' | 'consent'> & Merge<SlotManager, {
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
    ...options,
  } satisfies AdheseOptions;
  if (mergedOptions.debug || window.location.search.includes('adhese_debug=true')) {
    logger.setMinLogLevelThreshold('debug');
    logger.debug('Debug logging enabled');
  }

  logger.debug('Created Adhese SDK instance', {
    options,
  });

  if (!isUrlString(mergedOptions.host) || !isUrlString(mergedOptions.poolHost))
    logger.warn('Invalid host or poolHost');

  let { location } = mergedOptions;
  function getLocation(): string {
    return location;
  }
  function setLocation(newLocation: string): void {
    location = newLocation;
  }

  const deviceDetector = createDeviceDetector({
    onChange: onDeviceChange,
  });

  const parameters = new Map(
    [...Object.entries(options.parameters ?? {}), ['tl', mergedOptions.consent ? 'all' : 'none'], ['dt', deviceDetector.getDevice()], ['br', deviceDetector.getDevice()],
    ],
  );

  async function onDeviceChange(): Promise<void> {
    const device = deviceDetector.getDevice();
    parameters.set('dt', device);
    parameters.set('br', device);

    await fetchAndRenderAllSlots();
  }

  let consent = mergedOptions.consent ?? 'none';
  function getConsent(): typeof consent {
    return consent;
  }
  function setConsent(newConsent: boolean): void {
    parameters.set('tl', newConsent ? 'all' : 'none');
    consent = newConsent;
  }

  if (window.location.search.includes('adhesePreviewCreativeId')) {
    logger.warn('Adhese preview mode enabled');

    const disableButton = document.createElement('button');
    disableButton.textContent = 'Disable Adhese preview mode. Click to close';
    disableButton.style.position = 'fixed';
    disableButton.style.insetBlockStart = '10px';
    disableButton.style.insetInlineEnd = '10px';
    disableButton.style.zIndex = '9999';
    disableButton.style.padding = '10px';
    disableButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    disableButton.style.color = 'white';
    disableButton.style.fontFamily = 'sans-serif';
    disableButton.style.border = 'none';
    disableButton.style.cursor = 'pointer';
    disableButton.style.maxInlineSize = '120px';
    disableButton.type = 'button';

    disableButton.addEventListener('click', () => {
      const currentUrl = new URL(window.location.href);

      window.location.replace(`${currentUrl.origin}${currentUrl.pathname === '/' ? '' : currentUrl.pathname}`);
    });

    document.body.appendChild(disableButton);
  }

  const slotManager = createSlotManager({
    location,
    initialSlots: mergedOptions.initialSlots,
  });
  async function addSlot(slotOptions: Omit<SlotOptions, 'location'>): Promise<Readonly<Slot>> {
    const slot = slotManager.add({
      ...slotOptions,
      location,
    } as SlotOptions);

    const ad = await requestAd({
      slot,
      host: mergedOptions.host,
      parameters,
      account: mergedOptions.account,
    });

    await slot.render(ad);

    return slot;
  }

  async function findDomSlots(): Promise<ReadonlyArray<Slot>> {
    const domSlots = await slotManager.findDomSlots(location);

    const ads = await requestAds({
      host: mergedOptions.host,
      slots: domSlots,
      method: mergedOptions.requestType,
      account: mergedOptions.account,
      parameters,
    });

    await Promise.allSettled(ads.map(ad => slotManager.get(ad.slotName)?.render(ad)));

    return domSlots;
  }

  if (mergedOptions.findDomSlotsOnLoad)
    await slotManager.findDomSlots();

  async function fetchAndRenderAllSlots(): Promise<void> {
    const ads = await requestAds({
      host: mergedOptions.host,
      slots: slotManager.getAll(),
      method: mergedOptions.requestType,
      account: mergedOptions.account,
      parameters,
    });

    await Promise.allSettled(ads.map(ad => slotManager.get(ad.slotName)?.render(ad)));
  }

  if (slotManager.getAll().length > 0)
    await fetchAndRenderAllSlots();

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
  }

  return {
    ...mergedOptions,
    ...slotManager,
    parameters,
    getLocation,
    setLocation,
    getConsent,
    setConsent,
    addSlot,
    findDomSlots,
    dispose,
  };
}
