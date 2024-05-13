import type { Merge } from '@adhese/sdk-shared';
import { reactive, watch } from '@vue/runtime-core';
import { findDomSlots as extFindDomSlots } from '../findDomSlots/findDomSlots';
import type { AdheseSlot, AdheseSlotOptions } from '../createSlot/createSlot.types';
import type { AdheseContext } from '../../main.types';
import { createSlot } from '../createSlot/createSlot';
import { logger } from '../../logger/logger';

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
  context.slots = reactive<Map<string, AdheseSlot>>(new Map<string, AdheseSlot>());

  function getAll(): ReadonlyArray<AdheseSlot> {
    return Array.from(context.slots).map(([, slot]) => slot);
  }

  function add(options: Omit<AdheseSlotOptions, 'context' | 'onDispose' | 'onNameChange'>): Readonly<AdheseSlot> {
    const slot = createSlot({
      ...options as AdheseSlotOptions,
      onDispose,
      context,
    });

    if (context.slots.has(slot.name)) {
      slot.dispose();

      throw new Error(`Slot with the name: ${slot.name} already exists. Create a new slot with a different format, slot, or the location.`);
    }

    const disposeSlotWatch = watch(() => slot.name, (newName, previousName) => {
      context.slots.set(newName, slot);
      context.slots.delete(previousName);
    });

    function onDispose(): void {
      context.slots.delete(slot.name);
      logger.debug('Slot removed', {
        slot,
        slots: Array.from(context.slots),
      });
      context.events?.removeSlot.dispatch(slot);

      disposeSlotWatch();
    }

    context.slots.set(slot.name, slot);

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
      context.slots.set(slot.name, slot);

    return domSlots;
  }

  function get(name: string): AdheseSlot | undefined {
    return context.slots.get(name);
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
