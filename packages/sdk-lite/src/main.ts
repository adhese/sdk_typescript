import { type DefaultLogLevels, type Logger, createLogger } from '@adhese/sdk-shared';
import type { AdheseOptions } from '@adhese/sdk';
import { name as packageName, version } from '../package.json';
import { type AdheseLiteSlot, type AdheseLiteSlotOptions, createSlot } from './slot';

export type AdheseLiteOptions = Pick<AdheseOptions, 'account' | 'host' | 'poolHost' | 'location' | 'parameters' | 'debug'> & {
  initialSlots?: ReadonlyArray<AdheseLiteSlotOptions>;
};

export type AdheseLite = {
  options: Required<AdheseLiteOptions>;
  logger: Logger<DefaultLogLevels>;
  location: string;
  slots: ReadonlyMap<string, AdheseLiteSlot>;
  addSlot(options: AdheseLiteSlotOptions): AdheseLiteSlot;
  dispose(): void;
};

export function createAdheseLite(options: AdheseLiteOptions): AdheseLite {
  const mergedOptions: Required<AdheseLiteOptions> = {
    host: `https://ads-${options.account}.adhese.com`,
    poolHost: `https://pool-${options.account}.adhese.com`,
    location: 'homepage',
    debug: false,
    parameters: {},
    initialSlots: [],
    ...options,
  };

  const logger = createLogger({
    scope: `${packageName}@${version}`,
    minLogLevelThreshold: mergedOptions.debug ? 'debug' : 'info',
  });

  const slots = new Map<string, AdheseLiteSlot>();

  logger.debug('Adhese Lite SDK created', mergedOptions);

  const context = {
    options: mergedOptions,
    location: mergedOptions.location,
    logger,
    slots,
    addSlot(slotOptions): AdheseLiteSlot {
      const newSlot = createSlot({
        ...slotOptions,
        onDispose(slot) {
          slots.delete(slot.name);
        },
      }, this);

      slots.set(newSlot.name, newSlot);

      return newSlot;
    },
    dispose(): void {
      for (const slot of slots.values()) {
        slot.dispose();
      }

      slots.clear();
    },
  } satisfies AdheseLite;

  for (const slot of mergedOptions.initialSlots) {
    context.addSlot(slot);
  }

  Promise.allSettled(Array.from(slots.values()).map(slot => slot.render())).then((results) => {
    const errors = results.filter(result => result.status === 'rejected');

    if (errors.length > 0) {
      logger.error('Failed to render some slots', errors);
    }
  }).catch(logger.error);

  return context;
}
