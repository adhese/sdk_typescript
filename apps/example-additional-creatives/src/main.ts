import { type AdheseAd, createAdhese } from '@adhese/sdk';
import { devtoolsPlugin } from '@adhese/sdk-devtools';
import { computed, ref, watch } from '@adhese/sdk-shared';
import { debounce, isDeepEqual } from 'remeda';

const adhese = createAdhese({
  account: 'demo',
  debug: true,
  consent: true,
  initialSlots: [
    {
      format: 'leaderboard',
      containingElement: 'leaderboard',
    },
  ],
  location: '_sdk_example_',
  queries: {
    unknown: '(min-width: 0px)',
  },
  plugins: [
    devtoolsPlugin,
    ((_context, plugin): { name: 'additionalCreatives' } => {
      const windowWidth = ref(window.innerWidth);
      const onChange = debounce(() => {
        windowWidth.value = window.innerWidth;
      }, {
        waitMs: 50,
        timing: 'both',
      });
      plugin.hooks.onInit(() => {
        window.addEventListener('resize', onChange.call);
      });
      plugin.hooks.onDispose(() => {
        window.removeEventListener('resize', onChange.call);
      });

      plugin.hooks.onSlotCreate(slot => ({
        ...slot,
        setup(slotContext, slotHooks): void {
          slot.setup?.(slotContext, slotHooks);

          const additionalCreativeAd = computed(() => {
            const ad = slotContext.value?.data ?? null;

            if (
              !ad?.additionalCreatives
              || typeof ad?.additionalCreatives === 'string'
              || ad?.additionalCreatives.length <= 1
            ) {
              return ad;
            }

            return ad.additionalCreatives
              .filter(creative => creative.width)
              .toSorted((a, b) => (b.width ?? 0) - (a.width ?? 0))
              .find(creative => creative.width && creative.width <= windowWidth.value) ?? null;
          });

          watch(additionalCreativeAd, async (newAd, oldAd) => {
            if (!isDeepEqual(newAd, oldAd)) {
              await slotContext.value?.render(newAd as AdheseAd);
            }
          });
        },
      }));

      return ({
        name: 'additionalCreatives',
      });
    }),
  ],
});

window.adhese = adhese;
