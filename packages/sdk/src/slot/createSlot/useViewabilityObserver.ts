import { type ComputedRef, type Ref, computed, ref, watch } from '@vue/runtime-core';
import { round } from 'remeda';
import type { AdheseAd, AdheseContext } from '@adhese/sdk';
import { addTrackingPixel } from '../../impressionTracking/impressionTracking';
import { logger } from '../../logger/logger';

export function useViewabilityObserver(
  { context, ad, name, element }: {
    context: AdheseContext;
    ad: Ref<AdheseAd | null>;
    name: ComputedRef<string>;
    element: ComputedRef<HTMLElement | null>;
  },
): [
    ComputedRef,
    IntersectionObserver['disconnect'],
  ] {
  let timeoutId: number | null = null;
  const {
    threshold,
    duration,
    rootMargin,
  } = {
    threshold: 0.2,
    duration: 1000,
    rootMargin: '0px',
    ...context.options.viewabilityTrackingOptions,
  } satisfies Required<typeof context.options.viewabilityTrackingOptions>;

  const trackingPixel = ref<HTMLImageElement | null>(null);

  const isTracked = computed(() => Boolean(trackingPixel.value));

  const viewabilityObserver = new IntersectionObserver(([entry]) => {
    if (context.options.viewabilityTracking && !trackingPixel.value && ad) {
      const ratio = round(entry.intersectionRatio, 1);

      if (ratio >= threshold && !timeoutId) {
        // @ts-expect-error The is misfiring to the Node type
        timeoutId = setTimeout(() => {
          timeoutId = null;

          if (ad.value?.viewableImpressionCounter) {
            trackingPixel.value = addTrackingPixel(ad.value.viewableImpressionCounter);

            logger.debug(`Viewability tracking pixel fired for ${name.value}`);
          }
        }, duration);
      }
      else if (ratio < threshold && timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }
  }, {
    rootMargin,
    threshold: Array.from({ length: 11 }, (_, i) => i * 0.1),
  });

  function observe(newElement: HTMLElement | null, oldElement?: HTMLElement | null): () => void {
    if (oldElement)
      viewabilityObserver.unobserve(oldElement);

    if (newElement && context.options.viewabilityTracking)
      viewabilityObserver.observe(newElement);

    return () => {
      if (newElement)
        viewabilityObserver.unobserve(newElement);
    };
  }

  watch(element, observe);
  observe(element.value);

  return [isTracked, (): void => {
    trackingPixel.value?.remove();
    viewabilityObserver.disconnect();
  }];
}
