import type { AdheseAd, AdhesePlugin, AdheseSlot, AdheseSlotOptions } from '@adhese/sdk';
import type { AdheseStackSchema } from './stackSlots.schema';
import { computed, type ComputedRef, ref, uniqueId, useLogger } from '@adhese/sdk-shared';
import { name, version } from '../package.json';
import { useTracking } from './stackSlots.composables';

export type AdheseStackSlotsSlotOptions = {
  /**
   * The maximum number of ads to request within a stack
   */
  maxAds?: number;
};

export const stackSlotsPlugin: AdhesePlugin<{
  name: 'stackSlots';
  /**
   * Slots that are stack slots
   */
  slots: ComputedRef<ReadonlyArray<AdheseSlot>>;
  /**
   * Add a stack slot
   */
  addSlot(slot: Omit<AdheseSlotOptions, 'location' | 'context' | 'type' | 'renderMode' | 'pluginOptions' | 'width' | 'height'> & { maxAds: number }): Readonly<AdheseSlot>;
}> = (context, plugin) => {
  const logger = useLogger({
    scope: `${name}@${version}`,
  }, {
    context,
    plugin,
  });

  plugin.hooks.onSlotCreate((slot) => {
    if (slot.type !== 'stack')
      return slot;

    return ({
      ...slot,
      renderMode: 'inline',
      setup(slotContext, slotHooks): void {
        slot.setup?.(slotContext, slotHooks);

        const stackAds = ref<AdheseStackSchema | null>(null);

        slotHooks.onBeforeRequest(async (ad) => {
          if (!slotContext.value)
            return ad;

          const stackSlotsOptions = slotContext.value.pluginOptions?.stackSlots as Partial<{
            maxAds: number;
          }> | undefined;

          const parameterString = [...context.parameters.entries(), ...slotContext.value.parameters].map(([key, value]) => `${key}${value.toString()}`).join('/');
          const endpoint = new URL(`${context.options.host}/m/stack/sl${slotContext.value?.name}/${parameterString}`);

          if (stackSlotsOptions?.maxAds)
            endpoint.searchParams.set('max_ads', stackSlotsOptions.maxAds.toString());

          try {
            const [response, schema] = await Promise.all([
              fetch(endpoint.toString(), {
                method: 'GET',
                headers: {
                  accept: 'application/json',
                },
              }),
              import('./stackSlots.schema').then(module => module.stackSlotsSchema),
            ]);

            if (!response.ok)
              throw new Error('Response not OK');

            const { data, error, success } = schema.safeParse(await response.json());

            if (!success)
              throw new Error(String(error), { cause: error });

            logger.value.debug('Fetched stack ads', data);

            const id = uniqueId(6);

            stackAds.value = data;

            return {
              tag: data.ads,
              id,
              adType: slotContext.value.format,
              origin: 'JERLICIA',
              // eslint-disable-next-line ts/naming-convention
              slotID: id,
              slotName: slotContext.value.name,
              ext: 'stack',
              ...ad,
            } satisfies AdheseAd;
          }
          catch (error) {
            logger.value.error('Failed to fetch stack ads. Returning rendering to regular flow.', error);

            return ad;
          }
        });

        useTracking({
          hooks: slotHooks,
          stackAds,
          isTracked: computed(() => slotContext.value?.isViewabilityTracked ?? false),
          trackingUrlKey: 'viewableImpressionCounter',
        });

        useTracking({
          hooks: slotHooks,
          stackAds,
          isTracked: computed(() => slotContext.value?.isImpressionTracked ?? false),
          trackingUrlKey: 'impressionCounter',
        });
      },
    });
  });

  function addSlot({
    maxAds,
    ...slot
  }: Omit<AdheseSlotOptions, 'location' | 'context' | 'type' | 'renderMode' | 'pluginOptions'> & AdheseStackSlotsSlotOptions): Readonly<AdheseSlot> {
    if (!context.addSlot)
      throw new Error('Slot manager not found');

    return context.addSlot({
      ...slot,
      type: 'stack',
      pluginOptions: {
        stackSlots: {
          maxAds,
        } satisfies AdheseStackSlotsSlotOptions,
      },
    });
  }

  return {
    name: 'stackSlots',
    slots: computed(() => Array.from(context.slots.values()).filter(slot => slot.type === 'stack')),
    addSlot,
  };
};

export type { AdheseStackSchema } from './stackSlots.schema';

export type AdheseStackAd = AdheseAd<AdheseStackSchema['ads']>;
