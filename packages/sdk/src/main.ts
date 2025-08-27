import type {
  Adhese,
  AdheseContextStateWithPlugins,
  AdheseOptions,
  AdhesePlugin,
  MergedOptions,
} from './main.types';
import type { AdheseSlot, AdheseSlotOptions } from './slot/slot.types';
import {
  awaitTimeout,
  createEventManager,
  effectScope,
  omit,
  reactive,
  watch,
} from '@adhese/sdk-shared';
import { version } from '../package.json';
import { useConsent } from './consent/consent';
import { createGlobalHooks } from './hooks';
import { logger } from './logger/logger';
import {
  useMainDebugMode,
  useMainParameters,
  useMainQueryDetector,
} from './main.composables';
import { fetchAllUnrenderedSlots } from './main.utils';

import { createSlotManager } from './slotManager/slotManager';

/**
 * Creates an Adhese instance. This instance is your main entry point to the Adhese API.
 *
 * @param options {AdheseOptions} The options to create the Adhese instance with. See the {@link AdheseOptions} type for more information.
 *
 * @return Adhese The Adhese instance.
 */
export function createAdhese<T extends ReadonlyArray<AdhesePlugin>>(
  options: AdheseOptions<T>,
): Adhese<T> {
  const scope = effectScope();

  return scope.run(() => {
    const mergedOptions: MergedOptions = {
      host: `https://ads-${options.account}.adhese.com`,
      poolHost: `https://pool-${options.account}.adhese.com`,
      previewHost: `https://${options.account}-preview.adhese.org`,
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
      refreshOnResize: true,
      ...options,
    };

    import('./requestAds/requestAds.schema').catch(logger.error);

    const hooks = createGlobalHooks();

    const context = reactive<AdheseContextStateWithPlugins<T>>({
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
      plugins: {},
      dispose,
      findDomSlots,
      getAll,
      get,
      addSlot,
    });

    for (const [index, plugin] of options.plugins?.entries() ?? []) {
      const data = plugin(context, {
        index,
        version,
        hooks,
      });

      const name = data.name as keyof typeof context.plugins;
      context.plugins[name] = omit(data, [
        'name',
      ]) as (typeof context.plugins)[typeof name];
    }

    watch(
      () => context.location,
      (newLocation) => {
        context.events?.locationChange.dispatch(newLocation);
      },
    );

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
      const domSlots = ((await slotManager.findDomSlots()) ?? []).filter(
        slot => !slot.lazyLoading,
      );

      if (domSlots.length <= 0)
        return [];

      await fetchAllUnrenderedSlots(context.getAll());

      return domSlots;
    }
    context.findDomSlots = findDomSlots;

    useMainDebugMode(context);
    if (mergedOptions.refreshOnResize)
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

      if (mergedOptions.findDomSlotsOnLoad)
        await context?.findDomSlots();

      logger.debug('Created Adhese SDK instance', {
        mergedOptions,
      });

      if (!scope.active)
        dispose();
    });

    hooks.runOnInit();

    return context as Adhese<T>;
  })!;
}
