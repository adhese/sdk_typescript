import { type DefaultLogLevels, type Logger, createLogger } from '@adhese/sdk-shared';
import type { AdheseOptions, AdheseSlotOptions } from '@adhese/sdk';
import { name, version } from '../package.json';

export type AdheseLiteOptions = Pick<AdheseOptions, 'account' | 'host' | 'poolHost' | 'location' | 'parameters'> & {
  initialSlots?: ReadonlyArray<AdheseLiteSlotOptions>;
};

export type AdheseLiteSlotOptions = Pick<AdheseSlotOptions, 'format' | 'renderMode' | 'slot' | 'parameters'> & {
  containingElement: HTMLElement;
};

export type AdheseLiteSlot = {
  options: AdheseLiteSlotOptions;
  render(): Promise<HTMLElement>;
  dispose(): void;
};

export type AdheseLite = {
  options: Required<AdheseLiteOptions>;
  logger: Logger<DefaultLogLevels>;
  addSlot(options: AdheseLiteSlotOptions): AdheseLiteSlot;
  dispose(): void;
};

export function createAdheseLite(options: AdheseLiteOptions): AdheseLite {
  const mergedOptions: Required<AdheseLiteOptions> = {
    host: `https://${options.account}.adhese.com`,
    poolHost: `https://pool-${options.account}.adhese.com`,
    location: 'homepage',
    parameters: {},
    initialSlots: [],
    ...options,
  };

  const logger = createLogger({
    scope: `${name}@${version}`,
  });

  logger.debug('Adhese Lite SDK loaded', mergedOptions);

  const slots = new Map<string, AdheseLiteSlot>();

  return {
    options: mergedOptions,
    logger,
    addSlot(slotOptions): AdheseLiteSlot {
      return createSlot(slotOptions, this);
    },
    dispose(): void {
      slots.clear();
    },
  };
}

function createSlot(options: AdheseLiteSlotOptions, context: AdheseLite): AdheseLiteSlot {
  return {
    options,
    async render(): Promise<HTMLElement> {
      context.logger.debug('Rendering slot', options);
      return document.createElement('div');
    },
    dispose(): void {
    },
  };
}
