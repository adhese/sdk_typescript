import type { AdheseSlotHooks } from '@adhese/sdk';
import { type ComputedRef, type Ref, addTrackingPixel, computed, ref, watch } from '@adhese/sdk-shared';
import type { AdheseStackSchema } from './stackSlots.schema';

export function useTracking({
  hooks: { onDispose },
  stackAds,
  isTracked,
  trackingUrlKey,
}: {
  hooks: AdheseSlotHooks;
  stackAds: Ref<AdheseStackSchema | null>;
  isTracked: ComputedRef<boolean>;
  trackingUrlKey: keyof AdheseStackSchema['ads'][number]['native'];
}): ComputedRef<boolean> {
  const trackingPixels = ref<ReadonlyArray<HTMLImageElement>>([]);
  watch([isTracked, stackAds], ([newIsTracked, stacks]) => {
    if (newIsTracked && stacks && trackingPixels.value.length <= 0)
      trackingPixels.value = stacks.ads.map(ad => typeof ad.native[trackingUrlKey] ? addTrackingPixel(ad.native[trackingUrlKey] as URL) : null).filter(Boolean) as ReadonlyArray<HTMLImageElement>;
  }, {
    immediate: true,
  });

  onDispose(() => {
    for (const pixel of trackingPixels.value)
      pixel.remove();
  });

  return computed(() => isTracked.value && trackingPixels.value.length > 0);
}
