import {
  type DefaultLogLevels,
  type Logger,
  type RenderOptions,
  addTrackingPixel,
  createLogger,
  generateName,
  renderIframe,
  renderInline,
  round,
} from '@adhese/sdk-shared';
import { name as packageName, version } from '../package.json';

type RenderMode = 'iframe' | 'inline';

export type AdheseLiteSlotOptions = {
  containingElement: HTMLElement;
  format: string;
  account: string;
  location: string;
  host?: string;
  debug?: boolean;
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
  logger: Logger<DefaultLogLevels>;
  parameters: Record<string, string | ReadonlyArray<string>>;
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
  const logger = createLogger({
    scope: `${packageName}@${version}`,
    minLogLevelThreshold: options.debug ? 'debug' : 'info',
  });

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

  const context: AdheseLiteSlot = {
    options,
    name,
    logger,
    parameters,
    async request(): Promise<AdheseLiteAd | null> {
      logger.debug(`Requesting ad for slot ${name}`, this);

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

      logger.debug(`Received ad data for slot ${name}`, this);
      options.onRequest?.(this);

      return data;
    },
    async render(): Promise<HTMLElement> {
      const data = this.data ?? (await this.request());
      options.containingElement.removeEventListener('click', onClick);

      if (!data) {
        options.onEmpty?.(this);
        logger.debug(`Slot ${name} is empty`, this);

        return options.containingElement;
      }

      if (typeof data.tag !== 'string')
        throw new Error('Received invalid ad data, tag is not a string');

      renderFunctions[options.renderMode ?? 'iframe'](data, options.containingElement);

      options.onRender?.(this);
      logger.debug(`Rendered slot ${name}`, this);

      if (data.impressionCounter && !isImpressionTracked) {
        trackingPixels.add(addTrackingPixel(data.impressionCounter));
        isImpressionTracked = true;
      }

      if (data.viewableImpressionCounter) {
        viewabilityTrackingIntersectionObserver.observe(options.containingElement);
      }

      options.containingElement.addEventListener('click', onClick);

      return options.containingElement;
    },
    dispose(): void {
      options.onDispose?.(this);

      options.containingElement.innerHTML = '';

      for (const pixel of trackingPixels) {
        pixel.remove();
      }
      trackingPixels.clear();

      renderIntersectionObserver?.disconnect();
      viewabilityTrackingIntersectionObserver.disconnect();

      options.containingElement.removeEventListener('click', onClick);

      logger.debug(`Disposing slot ${name}`, this);

      logger.resetLogs();
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
      context.render().catch(logger.error);
      renderIntersectionObserver?.disconnect();
    }
  }
  renderIntersectionObserver.observe(options.containingElement);
  return context;
}
