import { awaitTimeout, createEventManager, effectScope, reactive, watch } from '@adhese/sdk-shared';
import { version } from '../package.json';
import { createSlotManager } from './slotManager/slotManager';
import { useConsent } from './consent/consent';
import { fetchAllUnrenderedSlots, isPreviewMode, setupLogging } from './main.utils';
import type { Adhese, AdheseContextState, AdheseOptions, MergedOptions } from './main.types';
import { logger } from './logger/logger';
import { useMainDebugMode, useMainParameters, useMainQueryDetector } from './main.composables';
import { createGlobalHooks } from './hooks';

import type { AdheseSlot, AdheseSlotOptions } from './slot/slot.types';

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
      eagerRendering: false,
      viewabilityTracking: true,
      plugins: [],
      ...options,
    } satisfies MergedOptions;
    setupLogging(mergedOptions);

    const hooks = createGlobalHooks();

    const context = reactive<AdheseContextState>({
      location: mergedOptions.location,
      consent: mergedOptions.consent,
      debug: mergedOptions.debug,
      options: mergedOptions,
      logger,
      isDisposed: false,
      parameters: new Map(),
      events: createEventManager(),
      slots: new Map(),
      device: 'unknown',
      hooks,
      dispose,
      findDomSlots,
      getAll,
      get,
      addSlot,
    });

    for (const [index, plugin] of mergedOptions.plugins.entries()) {
      plugin(context, {
        index,
        version,
        hooks,
      });
    }

    watch(() => context.location, (newLocation) => {
      context.events?.locationChange.dispatch(newLocation);
    });

    useMainParameters(context, mergedOptions);

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

      await fetchAllUnrenderedSlots(context.getAll());

      return domSlots;
    }
    context.findDomSlots = findDomSlots;

    useMainDebugMode(context);

    useMainQueryDetector(mergedOptions, context);

    useConsent(context);

    function dispose(): void {
      context.isDisposed = true;

      slotManager.dispose();
      context.parameters?.clear();
      context.events?.dispose();

      hooks.runOnDispose();
      hooks.clearAll();

      scope.stop();
    }
    context.dispose = dispose;

    hooks.onInit(async () => {
      await awaitTimeout(0);

      if ((slotManager.getAll().length ?? 0) > 0)
        await fetchAllUnrenderedSlots(context.getAll()).catch(logger.error);

      if (mergedOptions.findDomSlotsOnLoad)
        await context?.findDomSlots();

      if (mergedOptions.debug || window.location.search.includes('adhese_debug=true') || isPreviewMode())
        context.events?.debugChange.dispatch(true);

      if (!scope.active)
        dispose();
    });

    hooks.runOnInit();

    return context;
  })!;
}
