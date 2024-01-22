import { type Slot, type SlotOptions, createSlot, logger } from '@core';
import type { Merge } from '@utils';
import { findDomSlots } from '../findDomSlots/findDomSlots';

export type SlotManager = {
  /**
   * Returns all slots that are currently registered and rendered.
   */
  getSlots(): ReadonlyArray<SlotOptions>;
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
  const slots = new Set<Slot>(initialSlots.map(slot => createSlot({
    ...slot,
    location,
  })));

  for (const slot of slots)
    slot.render();

  return {
    getSlots(): ReadonlyArray<SlotOptions> {
      const slotList = Array.from(slots);
      logger.debug('Getting slots', {
        slots: slotList,
      });
      return slotList;
    },
    addSlot(options: SlotOptions): Readonly<Slot> {
      const slot = createSlot(options);

      slots.add(slot);
      slot.render();

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
        Array.from(slots),
        newLocation,
      );

      for (const slot of domSlots)
        slots.add(slot);

      return domSlots;
    },
  };
}
