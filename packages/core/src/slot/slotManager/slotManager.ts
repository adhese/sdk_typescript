import type { Merge } from '@utils';
import { type Slot, type SlotOptions, createSlot, logger } from '@core';
import { findDomSlots as extFindDomSlots } from '../findDomSlots/findDomSlots';

export type SlotManager = {
  /**
   * Returns all slots that are currently registered and rendered.
   */
  getAll(): ReadonlyArray<Slot>;
  /**
   * Adds a new slot to the Adhese instance and renders it.
   */
  add(slot: SlotOptions): Readonly<Slot>;
  /**
   * Finds all slots in the DOM and adds them to the Adhese instance.
   */
  findDomSlots(
    newLocation?: string,
  ): Promise<ReadonlyArray<Slot>>;
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
   * The location of the slot. This is the location that is used to determine the current page URL.
   */
  location: string;
  /**
   * List of initial slots to add to the slot manager.
   */
  initialSlots?: ReadonlyArray<Merge<Omit<SlotOptions, 'location' | 'containingElement'>, {
    containingElement: string;
  }>>;
};

export function createSlotManager({
  location,
  initialSlots = [],
}: SlotManagerOptions): Readonly<SlotManager> {
  const slots = new Map<string, Slot>(initialSlots.map(slot => createSlot({
    ...slot,
    location,
  })).map(slot => [slot.getName(), slot]));

  function getAll(): ReadonlyArray<Slot> {
    const slotList = Array.from(slots).map(([, slot]) => slot);
    logger.debug('Getting slots', {
      slots: slotList,
    });
    return slotList;
  }

  function add(options: SlotOptions): Readonly<Slot> {
    const slot = createSlot(options);

    slots.set(slot.getName(), slot);

    logger.debug('Slot added', {
      slot,
      slots: Array.from(slots),
    });

    return slot;
  }

  async function findDomSlots(
    newLocation: string = location,
  ): Promise<ReadonlyArray<Slot>> {
    const domSlots = await extFindDomSlots(
      Array.from(slots).map(([, slot]) => slot),
      newLocation,
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
