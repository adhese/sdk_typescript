import type { AdheseSlotHooks } from '@adhese/sdk';
import type { AdheseStackSchema } from './stackSlots.schema';
import { addTrackingPixel, computed, type ComputedRef, type Ref, ref, watchEffect } from '@adhese/sdk-shared';

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
  watchEffect(() => {
    if (isTracked.value && stackAds.value && trackingPixels.value.length <= 0)
      trackingPixels.value = stackAds.value.ads.map(ad => typeof ad.native[trackingUrlKey] ? addTrackingPixel(ad.native[trackingUrlKey] as URL) : null).filter(Boolean) as ReadonlyArray<HTMLImageElement>;
  });

  onDispose(() => {
    for (const pixel of trackingPixels.value)
      pixel.remove();
  });

  return computed(() => isTracked.value && trackingPixels.value.length > 0);
}
