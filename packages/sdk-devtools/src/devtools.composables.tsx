import type { AdheseContext, AdhesePlugin, AdheseSlot } from '@adhese/sdk';
import type { ModifiedSlotsStore, modifiedSlotsStore } from './modifiedSlots.store';
import { computed, omit, type Ref, ref, type useLogger, watch, watchEffect } from '@adhese/sdk-shared';

export type DevtoolsSlotPluginOptions = {
  hijackedSlot?: string;
};

export function useDevtoolsUi(context: AdheseContext, { onInit, onDispose }: Parameters<AdhesePlugin>[1]['hooks']): void {
  const wrapperElement = document.createElement('div');
  let unmount: (() => void) | undefined;

  async function initDevtools(): Promise<void> {
    const main = await import('./main');

    if (!unmount) {
      document.body.appendChild(wrapperElement);

      unmount = main.createAdheseDevtools(wrapperElement, context);
    }
  }

  onInit(() => {
    watch(() => [context.debug, context.isDisposed], async ([debug, isDisposed]) => {
      if (debug && !isDisposed) {
        await initDevtools();
      }
      else {
        dispose();
      }
    }, {
      immediate: true,
    });
  });

  function dispose(): void {
    unmount?.();
    unmount = undefined;
    if (wrapperElement.parentElement)
      wrapperElement.outerHTML = '';
  }

  onDispose(dispose);
}

export function useModifiedSlotsHijack(
  context: AdheseContext,
  { onSlotCreate }: Parameters<AdhesePlugin>[1]['hooks'],
  logger: ReturnType<typeof useLogger>,
): void {
  async function initStore(): Promise<typeof modifiedSlotsStore> {
    const { modifiedSlotsStore: store } = await import('./modifiedSlots.store');

    return store;
  }

  onSlotCreate(slot =>
    ({
      ...slot,
      setup(slotContext, slotHooks): void {
        slot.setup?.(slotContext, slotHooks);

        let store: typeof modifiedSlotsStore | undefined;
        const state = ref<ModifiedSlotsStore | null>(null);
        const hijackSlot = ref<AdheseSlot | null>(null);

        const hijackSlotOptions = computed(() => (state.value ?? store?.getState())?.slots.get(slotContext.value?.name ?? ''));

        let disposeSub: (() => void) | undefined;

        async function createHijack(): Promise<void> {
          if (context.debug && slotContext.value && slotContext.value.element) {
            hijackSlot.value?.dispose();

            if (hijackSlotOptions.value) {
              slotContext.value.renderMode = 'none';

              hijackSlot.value = context.addSlot?.({
                ...omit(slotContext.value.options, ['setup']),
                ...hijackSlotOptions.value,
                containingElement: slotContext.value.element,
                lazyLoading: false,
                lazyLoadingOptions: undefined,
                pluginOptions: {
                  devtools: {
                    hijackedSlot: slotContext.value.name,
                  } satisfies DevtoolsSlotPluginOptions,
                },
              }) ?? null;

              logger.value.debug(`Hijacking slot ${slotContext.value.name} with new slot ${hijackSlot.value?.name}`);

              await hijackSlot.value?.render();
            }
            else {
              slotContext.value.renderMode = slotContext.value.options.renderMode ?? 'iframe';

              hijackSlot.value?.dispose();
              hijackSlot.value = null;

              await slotContext.value.render();
            }
          }
        }

        watchEffect(() => {
          if (context.debug && slotContext.value?.element) {
            slotContext.value.element.style.position = 'relative';
          }
          else {
            slotContext.value?.element?.style.removeProperty('position');
          }
        });

        slotHooks.onInit(async () => {
          if (context.debug && slotContext.value) {
            store = await initStore();

            disposeSub = store.subscribe((newState) => {
              state.value = newState;
            });

            state.value = store.getState();

            await createHijack();
          }
        });

        slotHooks.onRender(async () => {
          if (hijackSlot.value) {
            await hijackSlot.value.render();
          }
        });

        watch(state, async () => {
          await createHijack();
        }, { immediate: true });

        watch(() => context.debug, async (debug) => {
          if (!debug)
            hijackSlot.value?.dispose();
        });

        slotHooks.onDispose(() => {
          disposeSub?.();
          hijackSlot.value?.dispose();
        });
      },
    }),
  );
}

export function useSlotBadge(
  context: AdheseContext,
  hooks: Parameters<AdhesePlugin>[1]['hooks'],
): void {
  const modifiedSlots = useModifiedSlots(context, hooks);

  const sortedSlots = computed(() => Array.from(context.slots.values()).toSorted((a, b) => {
    const offsetA = a.element?.getBoundingClientRect().top ?? 0;
    const offsetB = b.element?.getBoundingClientRect().top ?? 0;

    return offsetA - offsetB;
  }));

  hooks.onSlotCreate(slot => ({
    ...slot,
    setup(slotContext, slotHooks): void {
      slot.setup?.(slotContext, slotHooks);

      const element = ref<HTMLElement | null>(null);

      async function renderBadges(): Promise<void> {
        if (!slotContext.value || slotContext.value.renderMode === 'none' || !context.debug || !slotContext.value.isVisible)
          return;

        const [
          { renderToStaticMarkup },
          // eslint-disable-next-line ts/naming-convention
          { Badge },
          { slotIndexBadgeClasses },
          { cn },
        ] = await Promise.all([
          import('react-dom/server'),
          import('./components/badge'),
          import('./components/slotsTable'),
          import('./utils'),
        ]);

        const slotIndex = sortedSlots.value
          .filter(({ name }) => !modifiedSlots.value?.slots.has(name))
          .findIndex(({ name }) => name === slotContext.value?.name,
          );

        const template = renderToStaticMarkup(
          <div className="absolute top-0 flex gap-1 flex-col pointer-events-none adhese-devtools">
            <Badge
              className={cn('w-fit', slotIndexBadgeClasses[slotIndex % slotIndexBadgeClasses.length])}
            >
              {slotContext.value?.name}
            </Badge>
            {modifiedSlots.value?.slots.has((slotContext.value.pluginOptions?.devtools as DevtoolsSlotPluginOptions)?.hijackedSlot ?? '') && <Badge className="bg-red-500 w-fit">EDITED IN DEVTOOLS</Badge>}
          </div>,
        );

        element.value?.remove();
        element.value = document.createElement('div');
        slotContext.value.element?.appendChild(element.value);

        element.value.innerHTML = template;
      }

      slotHooks.onRender(async () => {
        await renderBadges();
      });

      watch(() => context.slots, async () => {
        await renderBadges();
      }, { immediate: false, deep: true });

      watch(() => context.debug, async (debug) => {
        if (debug) {
          await renderBadges();
        }
        else {
          element.value?.remove();
        }
      }, { immediate: true });
    },
  }));
}

function useModifiedSlots(context: AdheseContext, { onInit, onDispose }: Parameters<AdhesePlugin>[1]['hooks']): Ref<ModifiedSlotsStore | null> {
  let disposeSub: (() => void) | undefined;
  const state = ref<ModifiedSlotsStore | null>(null);
  async function initStore(): Promise<typeof modifiedSlotsStore> {
    const { modifiedSlotsStore: store } = await import('./modifiedSlots.store');

    disposeSub = store.subscribe((newState) => {
      state.value = newState;
    });

    state.value = store.getState();

    return store;
  }

  onInit(async () => {
    await initStore();
  });

  watch(() => context.debug, async (debug) => {
    if (debug) {
      await initStore();
    }
  }, { immediate: true });

  onDispose(() => {
    disposeSub?.();
  });

  return state;
}
