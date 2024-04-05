import { createEventManager } from '@utils';
import { type AdheseSlot, type AdheseSlotOptions, logger, requestAd, requestAds } from '@core';
import { createDevtools } from '@adhese/sdk-devtools';
import { effectScope, reactive, watch } from '@vue/runtime-core';
import { createSlotManager } from './slot/slotManager/slotManager';
import { onTcfConsentChange } from './consent/tcfConsent';
import { createQueryDetector } from './queryDetector/queryDetector';
import { createParameters, isPreviewMode, setupLogging } from './main.utils';
import type { Adhese, AdheseContext, AdheseOptions, MergedOptions } from './main.types';
import { onInit, runOnInit } from './hooks/onInit';

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
export function createAdhese(options: AdheseOptions): Readonly<Adhese> {
  const scope = effectScope();

  return scope.run(() => {
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

    const context = reactive({
      location: mergedOptions.location,
      consent: mergedOptions.consent,
      debug: mergedOptions.debug,
      getAll,
      get,
      options: mergedOptions,
      logger,
    }) as AdheseContext;

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

    watch(
      context.parameters,
      onParametersChange,
      {
        deep: true,
        immediate: true,
      },
    );

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

    const slotManager = createSlotManager({
      initialSlots: mergedOptions.initialSlots,
      context,
    });
    function getAll(): ReadonlyArray<AdheseSlot> {
      return slotManager.getAll() ?? [];
    }

    function get(name: string): AdheseSlot | undefined {
      return slotManager.get(name);
    }

    async function addSlot(slotOptions: AdheseSlotOptions): Promise<Readonly<AdheseSlot>> {
      if (!slotManager)
        throw new Error('Slot manager not initialized');

      const slot = slotManager.add(slotOptions);

      if (!slot.lazyLoading) {
        slot.ad.value = await requestAd({
          slot,
          context,
        });
      }

      return slot;
    }

    async function findDomSlots(): Promise<ReadonlyArray<AdheseSlot>> {
      const domSlots = (await slotManager.findDomSlots() ?? []).filter(slot => !slot.lazyLoading);

      if (domSlots.length <= 0)
        return [];

      const ads = await requestAds({
        slots: domSlots,
        context,
      });

      for (const ad of ads) {
        const slot = slotManager.get(ad.slotName);

        if (slot)
          slot.ad.value = ad;
      }

      return domSlots;
    }

    let unmountDevtools: (() => void) | undefined;

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
      const slots = (slotManager.getAll() ?? []).filter(slot => !slot.lazyLoading);

      if (slots.length === 0)
        return;

      const ads = await requestAds({
        slots,
        context,
      });

      for (const ad of ads) {
        const slot = slotManager.get(ad.slotName);

        if (slot)
          slot.ad.value = ad;
      }
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
      unmountDevtools?.();
      queryDetector.dispose();
      slotManager.dispose();
      queryDetector.dispose();
      disposeOnTcfConsentChange();
      context.parameters?.clear();
      logger.resetLogs();
      context.events?.dispose();
      logger.info('Adhese instance disposed');

      scope.stop();
    }

    onInit(async () => {
      if ((slotManager.getAll().length ?? 0) > 0)
        await fetchAndRenderAllSlots().catch(logger.error);

      if (mergedOptions.findDomSlotsOnLoad)
        await findDomSlots();

      if (mergedOptions.debug || window.location.search.includes('adhese_debug=true') || isPreviewMode()) {
        unmountDevtools = await createDevtools(context);

        context.events?.debugChange.dispatch(true);
      }

      if (!scope.active)
        dispose();
    });

    runOnInit();

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
    } satisfies Adhese;
  })!;
}
