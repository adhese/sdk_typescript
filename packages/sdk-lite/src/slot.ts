import {
  type RenderOptions,
  addTrackingPixel,
  doNothing,
  generateName,
  renderIframe,
  renderInline,
  round,
} from '@adhese/sdk-shared';
import type { AdheseSlotOptions } from '@adhese/sdk';
import type { RenderMode } from '@adhese/sdk/src/slot/slot.types';
import type { AdheseLite } from './main';

export type AdheseLiteSlotOptions = Pick<AdheseSlotOptions, 'renderMode' | 'slot' | 'parameters'> & {
  containingElement: HTMLElement;
  format: string;
  onDispose?(slot: AdheseLiteSlot): void;
  onRender?(slot: AdheseLiteSlot): void;
  onRequest?(slot: AdheseLiteSlot): void;
  onEmpty?(slot: AdheseLiteSlot): void;
};

export type AdheseLiteSlot = {
  options: AdheseLiteSlotOptions;
  name: string;
  data?: AdheseLiteAd;
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
  none: doNothing,
};

export function createSlot(options: AdheseLiteSlotOptions, context: AdheseLite): AdheseLiteSlot {
  context.logger.debug('Creating slot', options);

  const name = generateName(context.location, options.format, options.slot);

  let trackingPixel: HTMLImageElement | undefined;

  const renderIntersectionObserver = new IntersectionObserver(onRenderIntersection, {
    rootMargin: '200px',
    threshold: 0,
  });

  const viewabilityTrackingIntersectionObserver = new IntersectionObserver(onViewabilityIntersection, {
    rootMargin: '0px',
    threshold: Array.from({ length: 11 }, (_, i) => i * 0.1),
  });

  const slotContext: AdheseLiteSlot = {
    options,
    name,
    async render(): Promise<HTMLElement> {
      const data = this.data ?? (await this.request());

      if (!data) {
        options.onEmpty?.(this);
        context.logger.debug(`Slot ${name} is empty`, options);

        return options.containingElement;
      }

      if (typeof data.tag !== 'string')
        throw new Error('Received invalid ad data, tag is not a string');

      renderFunctions[options.renderMode ?? 'iframe'](data, options.containingElement);

      options.onRender?.(this);
      context.logger.debug(`Rendered slot ${name}`, data);

      if (data.impressionCounter && !trackingPixel) {
        trackingPixel = addTrackingPixel(data.impressionCounter);
      }

      if (data.viewableImpressionCounter) {
        viewabilityTrackingIntersectionObserver.observe(options.containingElement);
      }

      return options.containingElement;
    },
    async request(): Promise<AdheseLiteAd | null> {
      context.logger.debug(`Requesting slot ${name}`, options);

      const response = await fetch(`${context.options.host}/json`, {
        method: 'POST',
        body: JSON.stringify({
          slots: [{
            slotname: name,
            parameters: options.parameters,
          }],
          parameters: context.options.parameters,
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

      context.logger.debug('Received response', data);

      options.onRequest?.(this);

      return data;
    },
    dispose(): void {
      options.onDispose?.(this);

      options.containingElement.innerHTML = '';

      trackingPixel?.remove();

      context.logger.debug(`Disposing slot ${name}`, options);

      renderIntersectionObserver?.disconnect();
    },
  };

  function onRenderIntersection([entry]: ReadonlyArray<IntersectionObserverEntry>): void {
    if (entry.isIntersecting) {
      slotContext.render().catch(context.logger.error);
      renderIntersectionObserver?.disconnect();
    }
  }
  renderIntersectionObserver.observe(options.containingElement);

  let timeoutId: number | null = null;
  function onViewabilityIntersection([entry]: ReadonlyArray<IntersectionObserverEntry>): void {
    const ratio = round(entry.intersectionRatio, 1);
    const threshold = 0.2;

    if (ratio >= threshold && !timeoutId) {
      // @ts-expect-error The is misfiring to the Node type
      timeoutId = setTimeout(() => {
        timeoutId = null;
        viewabilityTrackingIntersectionObserver.disconnect();

        if (slotContext.data?.impressionCounter) {
          addTrackingPixel(slotContext.data?.impressionCounter);
        }
      }, 1000);
    }
    else if (ratio < threshold && timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  return slotContext;
}
