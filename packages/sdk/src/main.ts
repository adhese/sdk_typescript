import { createEventManager } from '@adhese/sdk-shared';
import { effectScope, reactive, watch } from '@vue/runtime-core';
import { createSafeFrame } from '@safeframe';
import { debounce } from 'remeda';
import packageJson from '../package.json';
import { createSlotManager } from './slot/slotManager/slotManager';
import { onTcfConsentChange } from './consent/tcfConsent';
import { createQueryDetector } from './queryDetector/queryDetector';
import { createParameters, isPreviewMode, setupLogging } from './main.utils';
import type { Adhese, AdheseContextState, AdheseOptions, MergedOptions } from './main.types';
import { onInit, runOnInit } from './hooks/onInit';
import { onDispose, runOnDispose } from './hooks/onDispose';
import { logger } from './logger/logger';
import { requestAd } from './requestAds/requestAds';
import type { AdheseSlot, AdheseSlotOptions } from './slot/createSlot/createSlot.types';
import { clearAllHooks } from './hooks/createHook';
import { onResponse } from './hooks/onResponse';
import { onRender } from './hooks/onRender';
import { onRequest } from './hooks/onRequest';
import { onSlotCreate } from './hooks/onSlotCreate';

/**
 * Creates an Adhese instance. This instance is your main entry point to the Adhese API.
 *
 * @param options {AdheseOptions} The options to create the Adhese instance with. See the {@link AdheseOptions} type for more information.
 *
 * @return Adhese The Adhese instance.
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
      safeFrame: false,
      eagerRendering: false,
      viewabilityTracking: true,
      plugins: [],
      ...options,
    } satisfies MergedOptions;
    setupLogging(mergedOptions);

    const context = reactive<AdheseContextState>({
      location: mergedOptions.location,
      consent: mergedOptions.consent,
      debug: mergedOptions.debug,
      options: mergedOptions,
      logger,
      isDisposed: false,
      parameters: new Map(),
      events: createEventManager(),
      dispose,
      findDomSlots,
      getAll,
      get,
      addSlot,
    });

    for (const [index, plugin] of mergedOptions.plugins.entries()) {
      plugin(context, {
        index,
        version: packageJson.version,
        onInit,
        onDispose,
        onRender,
        onRequest,
        onResponse,
        onSlotCreate,
      });
    }

    context.events = createEventManager();

    context.safeFrame = options.safeFrame
      ? createSafeFrame({
        renderFile: `${mergedOptions.poolHost}/sf/r.html`,
        context,
      })
      : undefined;

    watch(() => context.location, (newLocation) => {
      context.events?.locationChange.dispatch(newLocation);
    });

    const queryDetector = createQueryDetector({
      onChange: onQueryChange,
      queries: mergedOptions.queries,
    });

    context.parameters = createParameters(mergedOptions, queryDetector);

    watch(
      () => context.parameters,
      (newParameters) => {
        context.events?.parametersChange.dispatch(newParameters);
      },
      {
        deep: true,
      },
    );

    const debouncedFetchAllUnrenderedSlots = debounce(fetchAllUnrenderedSlots, {
      waitMs: 100,
      timing: 'both',
    });

    async function onQueryChange(): Promise<void> {
      const query = queryDetector.getQuery();
      context.parameters?.set('dt', query);
      context.parameters?.set('br', query);

      await debouncedFetchAllUnrenderedSlots.call();
    }

    watch(() => context.consent, (newConsent) => {
      context.parameters?.set('tl', newConsent ? 'all' : 'none');

      context.events?.consentChange.dispatch(newConsent);
    }, {
      immediate: true,
    });

    const slotManager = createSlotManager({
      initialSlots: mergedOptions.initialSlots,
      context,
    });

    function getAll(): ReadonlyArray<AdheseSlot> {
      return slotManager.getAll() ?? [];
    }
    context.getAll = getAll;

    function get(name: string): AdheseSlot | undefined {
      return slotManager.get(name);
    }
    context.get = get;

    function addSlot(slotOptions: AdheseSlotOptions): Readonly<AdheseSlot> {
      return slotManager.add(slotOptions);
    }
    context.addSlot = addSlot;

    async function findDomSlots(): Promise<ReadonlyArray<AdheseSlot>> {
      const domSlots = (await slotManager.findDomSlots() ?? []).filter(slot => !slot.lazyLoading);

      if (domSlots.length <= 0)
        return [];

      const ads = await Promise.all(domSlots.map(slot => requestAd({
        slot,
        context,
      })));

      for (const ad of ads) {
        const slot = slotManager.get(ad.slotName);

        if (slot)
          slot.ad.value = ad;
      }

      return domSlots;
    }
    context.findDomSlots = findDomSlots;

    watch(() => context.debug, async (newDebug) => {
      if (newDebug) {
        logger.setMinLogLevelThreshold('debug');
        logger.debug('Debug mode enabled');
        context.events?.debugChange.dispatch(true);
      }
      else {
        logger.debug('Debug mode disabled');
        logger.setMinLogLevelThreshold('info');
        context.events?.debugChange.dispatch(false);
      }
    }, {
      immediate: true,
    });

    async function fetchAllUnrenderedSlots(): Promise<void> {
      const slots = (slotManager.getAll() ?? []).filter(slot => !slot.lazyLoading && !slot.ad.value);

      if (slots.length === 0)
        return;

      const ads = await Promise.all(slots.map(slot => requestAd({
        slot,
        context,
      })));

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

      await debouncedFetchAllUnrenderedSlots.call();
    });

    function dispose(): void {
      context.isDisposed = true;

      queryDetector.dispose();
      slotManager.dispose();
      queryDetector.dispose();
      disposeOnTcfConsentChange();
      context.parameters?.clear();
      logger.resetLogs();
      context.events?.dispose();
      logger.info('Adhese instance disposed');

      runOnDispose();

      clearAllHooks();

      scope.stop();
    }
    context.dispose = dispose;

    onInit(async () => {
      if ((slotManager.getAll().length ?? 0) > 0)
        await fetchAllUnrenderedSlots().catch(logger.error);

      if (mergedOptions.findDomSlotsOnLoad)
        await context?.findDomSlots();

      if (mergedOptions.debug || window.location.search.includes('adhese_debug=true') || isPreviewMode())
        context.events?.debugChange.dispatch(true);

      if (!scope.active)
        dispose();
    });

    runOnInit();

    return context;
  })!;
}
