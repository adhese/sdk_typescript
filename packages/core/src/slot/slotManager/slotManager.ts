import type { Merge } from '@utils';
import { type AdheseContext, type AdheseSlot, type AdheseSlotOptions, createSlot, logger } from '@core';
import { findDomSlots as extFindDomSlots } from '../findDomSlots/findDomSlots';

export type SlotManager = {
  /**
   * Returns all slots that are currently registered and rendered.
   */
  getAll(): ReadonlyArray<AdheseSlot>;
  /**
   * Adds a new slot to the Adhese instance and renders it.
   */
  add(slot: Omit<AdheseSlotOptions, 'context'>): Promise<Readonly<AdheseSlot>>;
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

export async function createSlotManager({
  initialSlots = [],
  context,
}: SlotManagerOptions): Promise<Readonly<SlotManager>> {
  const slots = new Map<string, AdheseSlot>();

  await Promise.allSettled(initialSlots.map(async slot => add({
    ...slot,
    lazyLoading: false,
  })));

  function getAll(): ReadonlyArray<AdheseSlot> {
    return Array.from(slots).map(([, slot]) => slot);
  }

  async function add(options: Omit<AdheseSlotOptions, 'context' | 'onDispose' | 'onNameChange'>): Promise<Readonly<AdheseSlot>> {
    const slot = await createSlot({
      ...options as AdheseSlotOptions,
      onDispose,
      onNameChange,
      context,
    });

    function onDispose(): void {
      slots.delete(slot.getName());
      logger.debug('Slot removed', {
        slot,
        slots: Array.from(slots),
      });
      context.events?.removeSlot.dispatch(slot);
      context.events?.changeSlots.dispatch(Array.from(slots.values()));
    }

    slots.set(slot.getName(), slot);

    function onNameChange(newName: string, previousName: string): void {
      slots.set(newName, slot);
      slots.delete(previousName);

      context.events?.changeSlots.dispatch(Array.from(slots.values()));
    }

    logger.debug('Slot added', {
      slot,
      slots: Array.from(slots.values()),
    });

    context.events?.addSlot.dispatch(slot);
    context.events?.changeSlots.dispatch(Array.from(slots.values()));

    return slot;
  }

  async function findDomSlots(): Promise<ReadonlyArray<AdheseSlot>> {
    const domSlots = await extFindDomSlots(
      context,
    );

    for (const slot of domSlots) {
      slots.set(slot.getName(), slot);
      context.events?.changeSlots.dispatch(Array.from(slots.values()));
    }

    return domSlots;
  }

  function get(name: string): AdheseSlot | undefined {
    return slots.get(name);
  }

  function dispose(): void {
    for (const slot of slots.values())
      slot.dispose();

    slots.clear();
    context.events?.changeSlots.dispatch(Array.from(slots.values()));
  }

  return {
    getAll,
    add,
    findDomSlots,
    get,
    dispose,
  };
}
