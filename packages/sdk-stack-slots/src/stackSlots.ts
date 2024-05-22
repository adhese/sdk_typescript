import type { AdheseAd, AdhesePlugin } from '@adhese/sdk';
import { computed, ref, uniqueId, useLogger } from '@adhese/sdk-shared';
import { name, version } from '../package.json';
import { useTracking } from './stackSlots.composables';
import type { AdheseStackSchema } from './index';

export const stackSlotsPlugin: AdhesePlugin = (context, plugin) => {
  const logger = useLogger({
    scope: `${name}@${version}`,
  }, {
    context,
    plugin,
  });

  logger.value.info('Stack slots plugin initialized', plugin);

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

          const endpoint = new URL(`${context.options.host}/m/stack/sl${slotContext.value?.name}`);
          endpoint.searchParams.set('max_ads', '5');

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
};
