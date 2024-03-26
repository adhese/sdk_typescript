import { createEventManager } from '@utils';
import { type AdheseSlot, type AdheseSlotOptions, logger, requestAd, requestAds } from '@core';
import { createDevtools } from '@adhese/sdk-devtools';
import { createSlotManager } from './slot/slotManager/slotManager';
import { onTcfConsentChange } from './consent/tcfConsent';
import { createQueryDetector } from './queryDetector/queryDetector';
import { createParameters, isPreviewMode, setupLogging } from './main.utils';
import type { Adhese, AdheseContext, AdheseOptions, MergedOptions } from './main.types';

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

  const context = new Proxy<AdheseContext>({
    location: mergedOptions.location,
    consent: mergedOptions.consent,
    debug: mergedOptions.debug,
    getAll,
    get,
    options: mergedOptions,
    logger,
  }, {});

  context.events = createEventManager();

  function getLocation(): typeof context.location {
    return context.location;
  }

  function setLocation(newLocation: string): void {
    context.location = newLocation;
    context.events?.locationChange.dispatch(newLocation);
  }

  const queryDetector = createQueryDetector({
    onChange: onQueryChange,
    queries: mergedOptions.queries,
  });

  context.parameters = createParameters(mergedOptions, queryDetector);
  context.parameters.addEventListener(onParametersChange);

  let unmountDevtools: (() => void) | undefined;
  if (mergedOptions.debug || window.location.search.includes('adhese_debug=true') || isPreviewMode()) {
    unmountDevtools = await createDevtools(context);
    context.events?.debugChange.dispatch(true);
  }

  function onParametersChange(): void {
    if (context.parameters)
      context.events?.parametersChange.dispatch(context.parameters);
  }

  async function onQueryChange(): Promise<void> {
    const query = queryDetector.getQuery();
    context.parameters?.set('dt', query);
    context.parameters?.set('br', query);

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

  const slotManager = await createSlotManager({
    initialSlots: mergedOptions.initialSlots,
    context,
  });

  function getAll(): ReadonlyArray<AdheseSlot> {
    return slotManager.getAll();
  }

  function get(name: string): AdheseSlot | undefined {
    return slotManager.get(name);
  }

  async function addSlot(slotOptions: AdheseSlotOptions): Promise<Readonly<AdheseSlot>> {
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

  async function findDomSlots(): Promise<ReadonlyArray<AdheseSlot>> {
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

  async function toggleDebug(): Promise<boolean> {
    context.debug = !context.debug;

    if (context.debug && !unmountDevtools) {
      // eslint-disable-next-line require-atomic-updates
      unmountDevtools = await createDevtools(context);
      logger.setMinLogLevelThreshold('debug');
      logger.debug('Debug mode enabled');
      context.events?.debugChange.dispatch(true);
    }
    else {
      logger.debug('Debug mode disabled');
      unmountDevtools?.();
      unmountDevtools = undefined;
      logger.setMinLogLevelThreshold('info');
      context.events?.debugChange.dispatch(false);
    }

    return context.debug;
  }

  async function fetchAndRenderAllSlots(): Promise<void> {
    const slots = slotManager.getAll().filter(slot => !slot.lazyLoading);

    if (slots.length === 0)
      return;

    const ads = await requestAds({
      host: mergedOptions.host,
      slots,
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

  if (slotManager.getAll().length > 0)
    await fetchAndRenderAllSlots().catch(logger.error);

  function dispose(): void {
    queryDetector.dispose();
    slotManager.dispose();
    queryDetector.dispose();
    disposeOnTcfConsentChange();
    context.parameters?.dispose();
    context.parameters?.clear();
    logger.resetLogs();
    context.events?.dispose();
    unmountDevtools?.();
    logger.info('Adhese instance disposed');
  }

  if (mergedOptions.findDomSlotsOnLoad)
    await slotManager.findDomSlots();

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
    toggleDebug,
    context,
  };
}
