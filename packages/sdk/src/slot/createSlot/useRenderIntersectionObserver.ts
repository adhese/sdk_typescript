import { type Ref, ref, watch } from '@adhese/sdk-shared';
import type { AdheseSlotOptions } from '@adhese/sdk';

export function useRenderIntersectionObserver({ options, element }: {
  options: AdheseSlotOptions;
  element: Ref<HTMLElement | null>;
}): [
    Ref<boolean>,
    () => void,
  ] {
  const isInViewport = ref(false);

  const renderIntersectionObserver = new IntersectionObserver((entries) => {
    isInViewport.value = entries.some(entry => entry.isIntersecting);
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
