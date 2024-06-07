import {
  type RenderOptions,
  addTrackingPixel,
  generateName,
  renderIframe,
  renderInline,
  round,
  uniqueId,
} from '@adhese/sdk-shared';

type RenderMode = 'iframe' | 'inline';

export type AdheseLiteSlotOptions = {
  containingElement?: HTMLElement;
  format: string;
  account: string;
  location: string;
  host?: string;
  renderMode?: RenderMode;
  parameters?: Record<string, string | ReadonlyArray<string>>;
  slot?: string;
  consent?: boolean | string;
  clickTrackerUrl?: string | URL;
  onDispose?(slot: AdheseLiteSlot): void;
  onRender?(slot: AdheseLiteSlot): void;
  onRequest?(slot: AdheseLiteSlot): void;
  onEmpty?(slot: AdheseLiteSlot): void;
};

export type AdheseLiteSlot = {
  options: AdheseLiteSlotOptions;
  name: string;
  data?: AdheseLiteAd;
  parameters: Record<string, string | ReadonlyArray<string>>;
  element: HTMLElement;
  render(): Promise<HTMLElement>;
  request(): Promise<AdheseLiteAd | null>;
  dispose(): void;
};

export type AdheseLiteAd = {
  tag: string;
  width?: string;
  height?: string;
  impressionCounter?: string;
  viewableImpressionCounter?: string;
};

const renderFunctions: Record<RenderMode, (ad: RenderOptions, element: HTMLElement) => void> = {
  iframe: renderIframe,
  inline: renderInline,
};

export function createSlot(options: AdheseLiteSlotOptions): AdheseLiteSlot {
  const name = generateName(options.location, options.format, options.slot);

  const trackingPixels = new Set<HTMLImageElement>();

  const renderIntersectionObserver = new IntersectionObserver(onRenderIntersection, {
    rootMargin: '200px',
    threshold: 0,
  });

  const viewabilityTrackingIntersectionObserver = new IntersectionObserver(onViewabilityIntersection, {
    rootMargin: '0px',
    threshold: Array.from({ length: 11 }, (_, i) => i * 0.1),
  });

  const consentParameters: {
    tl: 'all' | 'none';
  } | {
    xt: string;
  } = typeof options.consent === 'string'
    ? {
        xt: options.consent,
      }
    : {
        tl: options.consent ? 'all' : 'none',
      };

  const parameters = {
    ...options.parameters,
    ...consentParameters,
  };

  let isImpressionTracked = false;

  const element = options.containingElement ?? document.createElement('div');

  if (!options.containingElement) {
    element.id = `${name}:${uniqueId(3)}`;
    element.classList.add('adunit');
    element.dataset.format = options.format;
    element.dataset.slot = options.format;
    element.dataset.location = options.location;

    document.currentScript?.insertAdjacentElement('beforebegin', element);
  }

  const context: AdheseLiteSlot = {
    options,
    name,
    parameters,
    element,
    async request(): Promise<AdheseLiteAd | null> {
      const response = await fetch(`${options.host ?? `https://ads-${options.account}.adhese.com`}/json`, {
        method: 'POST',
        body: JSON.stringify({
          slots: [{
            slotname: name,
          }],
          parameters,
        }),
        headers: {
          // eslint-disable-next-line ts/naming-convention
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok)
        throw new Error(`Failed to request ad for slot ${name}. Status: ${response.status}`);

      const [data] = await response.json() as ReadonlyArray<AdheseLiteAd>;

      this.data = data;

      options.onRequest?.(this);

      return data;
    },
    async render(): Promise<HTMLElement> {
      const data = this.data ?? (await this.request());
      element.removeEventListener('click', onClick);

      if (!data) {
        options.onEmpty?.(this);

        return element;
      }

      if (typeof data.tag !== 'string')
        throw new Error('Received invalid ad data, tag is not a string');

      renderFunctions[options.renderMode ?? 'iframe'](data, element);

      options.onRender?.(this);

      if (data.impressionCounter && !isImpressionTracked) {
        trackingPixels.add(addTrackingPixel(data.impressionCounter));
        isImpressionTracked = true;
      }

      if (data.viewableImpressionCounter) {
        viewabilityTrackingIntersectionObserver.observe(element);
      }

      element.addEventListener('click', onClick);

      return element;
    },
    dispose(): void {
      options.onDispose?.(this);

      element.innerHTML = '';

      for (const pixel of trackingPixels) {
        pixel.remove();
      }
      trackingPixels.clear();

      renderIntersectionObserver?.disconnect();
      viewabilityTrackingIntersectionObserver.disconnect();

      element.removeEventListener('click', onClick);
    },
  };

  let isClickTracked = false;
  function onClick(): void {
    if (options.clickTrackerUrl && !isClickTracked) {
      trackingPixels.add(addTrackingPixel(options.clickTrackerUrl));
      isClickTracked = true;
    }
  }

  let timeoutId: number | null = null;
  function onViewabilityIntersection([entry]: ReadonlyArray<IntersectionObserverEntry>): void {
    const ratio = round(entry.intersectionRatio, 1);
    const threshold = 0.2;

    if (ratio >= threshold && !timeoutId) {
      // @ts-expect-error The is misfiring to the Node type
      timeoutId = setTimeout(() => {
        timeoutId = null;
        viewabilityTrackingIntersectionObserver.disconnect();

        if (context.data?.viewableImpressionCounter) {
          trackingPixels.add(addTrackingPixel(context.data?.viewableImpressionCounter));
        }
      }, 1000);
    }
    else if (ratio < threshold && timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  function onRenderIntersection([entry]: ReadonlyArray<IntersectionObserverEntry>): void {
    if (entry.isIntersecting) {
      context.render().catch(console.error);
      renderIntersectionObserver?.disconnect();
    }
  }
  renderIntersectionObserver.observe(element);
  return context;
}

export { version } from '../package.json';
