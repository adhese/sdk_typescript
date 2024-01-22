import type { Merge } from '@utils';
import { type Slot, type SlotOptions, createSlot, logger } from '@core';
import { findDomSlots } from '../findDomSlots/findDomSlots';

export type SlotManager = {
  /**
   * Returns all slots that are currently registered and rendered.
   */
  getSlots(): ReadonlyArray<Slot>;
  /**
   * Adds a new slot to the Adhese instance and renders it.
   */
  addSlot(slot: SlotOptions): Readonly<Slot>;
  /**
   * Finds all slots in the DOM and adds them to the Adhese instance.
   */
  findDomSlots(
    newLocation?: string,
  ): ReadonlyArray<Slot>;
  /**
   * Returns the slot with the given name.
   */
  getSlot(name: string): Slot | undefined;
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
  })).map(slot => [slot.getSlotName(), slot]));

  return {
    getSlots(): ReadonlyArray<Slot> {
      const slotList = Array.from(slots).map(([, slot]) => slot);
      logger.debug('Getting slots', {
        slots: slotList,
      });
      return slotList;
    },
    addSlot(options: SlotOptions): Readonly<Slot> {
      const slot = createSlot(options);

      slots.set(slot.getSlotName(), slot);

      logger.debug('Slot added', {
        slot,
        slots: Array.from(slots),
      });

      return slot;
    },
    findDomSlots(
      newLocation: string = location,
    ): ReadonlyArray<Slot> {
      const domSlots = findDomSlots(
        Array.from(slots).map(([, slot]) => slot),
        newLocation,
      );

      for (const slot of domSlots)
        slots.set(slot.getSlotName(), slot);

      return domSlots;
    },
    getSlot(name: string): Slot | undefined {
      return slots.get(name);
    },
  };
}
