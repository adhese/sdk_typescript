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
  add(slot: Omit<SlotOptions, 'context'>): Readonly<Slot>;
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
  initialSlots?: ReadonlyArray<Merge<Omit<SlotOptions, 'containingElement' | 'context'>, {
    containingElement: string;
  }>>;
  context: AdheseContext;
};

export function createSlotManager({
  initialSlots = [],
  context,
}: SlotManagerOptions): Readonly<SlotManager> {
  const slots = new Map<string, Slot>();

  for (const slot of initialSlots)
    add(slot);

  function getAll(): ReadonlyArray<Slot> {
    const slotList = Array.from(slots).map(([, slot]) => slot);
    logger.debug('Getting slots', {
      slots: slotList,
    });
    return slotList;
  }

  function add(options: Omit<SlotOptions, 'context'>): Readonly<Slot> {
    const slot = createSlot({
      ...options,
      onDispose,
      context,
    });

    function onDispose(): void {
      slots.delete(slot.getName());
      logger.debug('Slot removed', {
        slot,
        slots: Array.from(slots),
      });
      context.events?.removeSlot.dispatch(slot);
    }

    slots.set(slot.getName(), slot);

    logger.debug('Slot added', {
      slot,
      slots: Array.from(slots),
    });

    context.events?.addSlot.dispatch(slot);

    return slot;
  }

  async function findDomSlots(): Promise<ReadonlyArray<Slot>> {
    const domSlots = await extFindDomSlots(
      context,
    );

    for (const slot of domSlots)
      slots.set(slot.getName(), slot);

    return domSlots;
  }

  function get(name: string): Slot | undefined {
    return slots.get(name);
  }

  function dispose(): void {
    for (const slot of slots.values())
      slot.dispose();

    slots.clear();
  }

  return {
    getAll,
    add,
    findDomSlots,
    get,
    dispose,
  };
}
