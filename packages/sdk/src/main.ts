import type {
  Adhese,
  AdheseOptions,
  AdhesePlugin,
} from './main.types';
import { useConsent } from './consent/consent';
import { createAdheseCore } from './core/createAdhese';
import { findDomSlots } from './findDomSlots/findDomSlots';
import {
  useMainDebugMode,
  useMainParameters,
  useMainQueryDetector,
} from './main.composables';
import { useQueryDetector } from './queryDetector/queryDetector';
import { requestPreviews } from './requestAds/requestAds.preview';
import { createSlot } from './slot/slot';

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
  return createAdheseCore(options, {
    createSlot,
    useConsent,
    useParameters: useMainParameters,
    useDebugMode: useMainDebugMode,
    useDeviceDetection(context, mergedOptions) {
      if (mergedOptions.refreshOnResize) {
        useMainQueryDetector(mergedOptions, context);
      }
      else {
        const [device] = useQueryDetector(context, mergedOptions.queries);
        context.device = device.value;
        context.parameters?.set('dt', device.value);
        context.parameters?.set('br', device.value);
      }
    },
    findDomSlots,
    requestPreviews,
  });
}
