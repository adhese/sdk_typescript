import type { Merge } from '@utils';
import { type Slot, type SlotOptions, createSlot, logger } from '@core';
import { findDomSlots as extFindDomSlots } from '../findDomSlots/findDomSlots';
import type { AdheseContext } from '../../main';

export type SlotManager = {
  /**
   * Returns all slots that are currently registered and rendered.
   */
  getAll(): ReadonlyArray<Slot>;
  /**
   * Adds a new slot to the Adhese instance and renders it.
   */
  add(slot: Omit<SlotOptions, 'context'>): Promise<Readonly<Slot>>;
  /**
   * Finds all slots in the DOM and adds them to the Adhese instance.
   */
  findDomSlots(): Promise<ReadonlyArray<Slot>>;
  /**
   * Returns the slot with the given name.
   */
  get(name: string): Slot | undefined;
  /**
   * Removes all slots from the Adhese instance and cleans up the slot manager.
   */
  dispose(): void;
};

export type SlotManagerOptions = {
  /**
   * List of initial slots to add to the slot manager.
   */
  initialSlots?: ReadonlyArray<Merge<Omit<SlotOptions, 'containingElement' | 'context' | 'lazy'>, {
    containingElement: string;
  }>>;
  context: AdheseContext;
};

export async function createSlotManager({
  initialSlots = [],
  context,
}: SlotManagerOptions): Promise<Readonly<SlotManager>> {
  const slots = new Map<string, Slot>();

  await Promise.allSettled(initialSlots.map(async slot => add({
    ...slot,
    lazyLoading: false,
  })));

  function getAll(): ReadonlyArray<Slot> {
    return Array.from(slots).map(([, slot]) => slot);
  }

  async function add(options: Omit<SlotOptions, 'context' | 'onDispose'>): Promise<Readonly<Slot>> {
    const slot = await createSlot({
      ...options,
      onDispose,
      context,
    } as SlotOptions);

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

    logger.debug('Slot added', {
      slot,
      slots: Array.from(slots.values()),
    });

    context.events?.addSlot.dispatch(slot);
    context.events?.changeSlots.dispatch(Array.from(slots.values()));

    return slot;
  }

  async function findDomSlots(): Promise<ReadonlyArray<Slot>> {
    const domSlots = await extFindDomSlots(
      context,
    );

    for (const slot of domSlots) {
      slots.set(slot.getName(), slot);
      context.events?.changeSlots.dispatch(Array.from(slots.values()));
    }

    return domSlots;
  }

  function get(name: string): Slot | undefined {
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
