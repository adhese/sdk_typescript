import { watch } from '@adhese/sdk-shared';
import type { AdheseContextState, MergedOptions } from './main.types';
import { useQueryDetector } from './queryDetector/queryDetector';

export function useMainQueryDetector(mergedOptions: MergedOptions, context: AdheseContextState): void {
  const [device] = useQueryDetector(mergedOptions.queries);
  watch(device, async (newDevice) => {
    context.device = newDevice;

    context.parameters?.set('dt', newDevice);
    context.parameters?.set('br', newDevice);

    await Promise.allSettled(context.getAll().map(slot => slot.request()));
  }, { immediate: true });
}
