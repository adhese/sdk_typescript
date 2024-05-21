import type { AdheseAd, AdhesePlugin } from '@adhese/sdk';
import { uniqueId, useLogger } from '@adhese/sdk-shared';
import { name, version } from '../package.json';

export const stackSlotsPlugin: AdhesePlugin = (context, plugin) => {
  const logger = useLogger({
    scope: `${name}@${version}`,
  }, {
    context,
    plugin,
  });

  plugin.onSlotCreate((slot) => {
    if (slot.type !== 'stacks')
      return slot;

    return ({
      ...slot,
      renderMode: 'inline',
      setup(slotContext, slotHooks): void {
        slot.setup?.(slotContext, slotHooks);

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
              import('./stackSchema').then(module => module.stackSchema),
            ]);

            if (!response.ok)
              throw new Error('Response not OK');

            const { data, error, success } = schema.safeParse(await response.json());

            if (!success)
              throw new Error(String(error), { cause: error });

            logger.value.debug('Fetched stack ads', data);

            const id = uniqueId(6);

            return {
              tag: data.ads,
              id,
              adType: slotContext.value.format,
              origin: 'JERLICIA',
              // eslint-disable-next-line ts/naming-convention
              slotID: id,
              slotName: slotContext.value.name,
              ext: 'stack',
              ...data,
              ...ad,
            } satisfies AdheseAd;
          }
          catch (error) {
            logger.value.error('Failed to fetch stack ads. Returning rendering to regular flow.', error);

            return ad;
          }
        });
      },
    });
  });
};
