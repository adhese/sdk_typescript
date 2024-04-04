import { type Ref, ref, watch } from '@vue/runtime-core';
import { type Ad, type AdheseSlotOptions, logger } from '@core';

export function useRenderIntersectionObserver({ ad, options, element, render }: {
  ad: Ref<Ad | null>;
  options: AdheseSlotOptions;
  element: Ref<HTMLElement | null>;
  render(adToRender?: Ad): Promise<HTMLElement>;
}): [
    Ref<boolean>,
    () => void,
  ] {
  const isInViewport = ref(false);

  const renderIntersectionObserver = new IntersectionObserver((entries) => {
    isInViewport.value = entries.some(entry => entry.isIntersecting);

    if (isInViewport.value) {
      (async (): Promise<void> => {
        if (!ad.value && options.lazyLoading)
          await render();

        await render(ad.value ?? undefined);
      })().catch(logger.error);
    }
  }, {
    rootMargin: options.lazyLoadingOptions?.rootMargin ?? '200px',
    threshold: 0,
  });

  function observe(newElement: HTMLElement | null, oldElement?: HTMLElement | null): () => void {
    if (oldElement)
      renderIntersectionObserver.unobserve(oldElement);

    if (newElement)
      renderIntersectionObserver.observe(newElement);

    return () => {
      if (newElement)
        renderIntersectionObserver.unobserve(newElement);
    };
  }

  watch(element, observe);
  observe(element.value);

  return [isInViewport, (): void => {
    renderIntersectionObserver.disconnect();
  }];
}
