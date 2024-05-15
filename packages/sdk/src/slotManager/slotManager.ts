import type { Merge } from '@adhese/sdk-shared';
import { findDomSlots as extFindDomSlots } from '../findDomSlots/findDomSlots';
import type { AdheseContext } from '../main.types';
import { type AdheseSlot, type AdheseSlotOptions, createSlot } from '../slot/singleSlot';
import { logger } from '../logger/logger';

export type AdheseSlotManager = {
  /**
   * Returns all slots that are currently registered and rendered.
   */
  getAll(): ReadonlyArray<AdheseSlot>;
  /**
   * Adds a new slot to the Adhese instance and renders it.
   */
  add(slot: Omit<AdheseSlotOptions, 'context'>): Readonly<AdheseSlot>;
  /**
   * Finds all slots in the DOM and adds them to the Adhese instance.
   */
  findDomSlots(): Promise<ReadonlyArray<AdheseSlot>>;
  /**
   * Returns the slot with the given name.
   */
  get(name: string): AdheseSlot | undefined;
  /**
   * Removes all slots from the Adhese instance and cleans up the slot manager.
   */
  dispose(): void;
};

export type SlotManagerOptions = {
  /**
   * List of initial slots to add to the slot manager.
   */
  initialSlots?: ReadonlyArray<Merge<Omit<AdheseSlotOptions, 'containingElement' | 'context' | 'lazy'>, {
    containingElement: string;
  }>>;
  context: AdheseContext;
};

/**
 * Creates a new slot manager instance. This slot manager instance can be used to manage all slots in the Adhese
 * instance. It will automatically add all slots that are passed in the `initialSlots` array.
 */
export function createSlotManager({
  initialSlots = [],
  context,
}: SlotManagerOptions): AdheseSlotManager {
  context.slots = new Map<string, AdheseSlot>();

  function getAll(): ReadonlyArray<AdheseSlot> {
    return Array.from(context.slots).map(([, slot]) => slot);
  }

  function add(options: Omit<AdheseSlotOptions, 'context' | 'onDispose'>): Readonly<AdheseSlot> {
    const slot = createSlot({
      ...options as AdheseSlotOptions,
      context,
      setup(slotContext, slotPlugin) {
        options.setup?.(slotContext, slotPlugin);

        slotPlugin.onDispose(() => {
          context.slots.delete(slot.id);
          logger.debug('Slot removed', {
            slot,
          });
          context.events?.removeSlot.dispatch(slot);
        });
      },
    });

    if (get(slot.name)) {
      slot.dispose();

      throw new Error(`Slot with the name: ${slot.name} already exists. Create a new slot with a different format, slot, or the location.`);
    }

    context.slots.set(slot.id, slot);

    logger.debug('Slot added', {
      slot,
      slots: Array.from(context.slots.values()),
    });

    context.events?.addSlot.dispatch(slot);

    return slot;
  }

  async function findDomSlots(): Promise<ReadonlyArray<AdheseSlot>> {
    const domSlots = await extFindDomSlots(
      context,
    );

    for (const slot of domSlots)
      context.slots.set(slot.id, slot);

    return domSlots;
  }

  function get(name: string): AdheseSlot | undefined {
    return getAll().find(slot => slot.name === name);
  }

  function dispose(): void {
    for (const slot of context.slots.values())
      slot.dispose();

    context.slots.clear();
  }

  for (const options of initialSlots) {
    add({
      ...options,
      lazyLoading: false,
    });
  }

  return {
    getAll,
    add,
    findDomSlots,
    get,
    dispose,
  };
}
