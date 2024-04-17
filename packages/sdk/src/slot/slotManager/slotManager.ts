import type { Merge } from '@utils';
import { effectScope, shallowReactive, watch, watchEffect } from '@vue/runtime-core';
import { findDomSlots as extFindDomSlots } from '../findDomSlots/findDomSlots';
import type { AdheseSlot, AdheseSlotOptions } from '../createSlot/createSlot.types';
import type { AdheseContext } from '../../main.types';
import { createSlot } from '../createSlot/createSlot';
import { logger } from '../../logger/logger';

export type SlotManager = {
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

export function createSlotManager({
  initialSlots = [],
  context,
}: SlotManagerOptions): Readonly<SlotManager> {
  const scope = effectScope();

  return scope.run(() => {
    const slots = shallowReactive<Map<string, AdheseSlot>>(new Map<string, AdheseSlot>());

    watchEffect(() => {
      context.events?.changeSlots.dispatch(Array.from(slots.values()));
    });

    function getAll(): ReadonlyArray<AdheseSlot> {
      return Array.from(slots).map(([, slot]) => slot);
    }

    function add(options: Omit<AdheseSlotOptions, 'context' | 'onDispose' | 'onNameChange'>): Readonly<AdheseSlot> {
      const slot = createSlot({
        ...options as AdheseSlotOptions,
        onDispose,
        context,
      });

      function onDispose(): void {
        slots.delete(slot.name.value);
        logger.debug('Slot removed', {
          slot,
          slots: Array.from(slots),
        });
        context.events?.removeSlot.dispatch(slot);
      }

      slots.set(slot.name.value, slot);

      watch(slot.name, (newName, previousName) => {
        slots.set(newName, slot);
        slots.delete(previousName);
      });

      logger.debug('Slot added', {
        slot,
        slots: Array.from(slots.values()),
      });

      context.events?.addSlot.dispatch(slot);

      return slot;
    }

    async function findDomSlots(): Promise<ReadonlyArray<AdheseSlot>> {
      const domSlots = await extFindDomSlots(
        context,
      );

      for (const slot of domSlots)
        slots.set(slot.name.value, slot);

      return domSlots;
    }

    function get(name: string): AdheseSlot | undefined {
      return slots.get(name);
    }

    function dispose(): void {
      for (const slot of slots.values())
        slot.dispose();

      slots.clear();
      scope.stop();
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
  })!;
}
