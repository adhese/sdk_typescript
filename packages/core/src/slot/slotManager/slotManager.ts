import { type Slot, type SlotOptions, createSlot, logger } from '@core';

export type SlotManager = {
  /**
   * Returns all slots that are currently registered and rendered.
   */
  getSlots(): ReadonlyArray<SlotOptions>;
  /**
   * Adds a new slot to the Adhese instance and renders it.
   */
  addSlot(slot: SlotOptions): Readonly<Slot>;
};
export type SlotManagerOptions = {
  /**
   * The location of the slot. This is the location that is used to determine the current page URL.
   */
  location: string;
  /**
   * List of initial slots to add to the slot manager.
   */
  initialSlots?: ReadonlyArray<Omit<SlotOptions, 'location'>>;
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
  };
}
