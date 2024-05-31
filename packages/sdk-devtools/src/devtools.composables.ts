import { type AdheseContext, type AdhesePlugin, type AdheseSlot, createSlot } from '@adhese/sdk';
import { ref, type useLogger, watch } from '@adhese/sdk-shared';
import { omit } from 'remeda';
import type { ModifiedSlotsStore, modifiedSlotsStore } from './modifiedSlots.store';

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

        if (context.isDisposed)
          dispose();
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

        let disposeSub: (() => void) | undefined;

        async function createHijack(): Promise<void> {
          if (context.debug && slotContext.value && slotContext.value.element) {
            hijackSlot.value?.dispose();

            const hijackPair = (state.value ?? store?.getState())?.slots.get(slotContext.value.name);

            if (hijackPair) {
              slotContext.value.renderMode = 'none';

              hijackSlot.value = createSlot({
                context,
                ...omit(slotContext.value.options, ['setup']),
                ...hijackPair.new,
                containingElement: slotContext.value.element,
                lazyLoading: false,
                lazyLoadingOptions: undefined,
              });

              logger.value.debug(`Hijacking slot ${slotContext.value.name} with new slot ${hijackSlot.value.name}`);

              await hijackSlot.value.render();
            }
          }
        }

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
