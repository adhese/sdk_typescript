import {
  type RenderOptions,
  addTrackingPixel,
  doNothing,
  generateName,
  renderIframe,
  renderInline,
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
};

export type AdheseLiteSlot = {
  options: AdheseLiteSlotOptions;
  name: string;
  data?: AdheseLiteAd;
  render(): Promise<HTMLElement>;
  request(): Promise<AdheseLiteAd>;
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

  return {
    options,
    name,
    async render(): Promise<HTMLElement> {
      const data = this.data ?? (await this.request());

      if (typeof data.tag !== 'string')
        throw new Error('Received invalid ad data, tag is not a string');

      renderFunctions[options.renderMode ?? 'iframe'](data, options.containingElement);

      options.onRender?.(this);
      context.logger.debug(`Rendered slot ${name}`, data);

      if (data.impressionCounter && !trackingPixel) {
        trackingPixel = addTrackingPixel(data.impressionCounter);
      }

      return options.containingElement;
    },
    async request(): Promise<AdheseLiteAd> {
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
    },
  };
}
