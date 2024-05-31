import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type { AdheseSlotOptions } from '@adhese/sdk';
import { type StorageValue, persist } from 'zustand/middleware';
import { name as packageName, version } from '../package.json';

type SlotPair = {
  old: Pick<AdheseSlotOptions, 'format' | 'slot'>;
  new: Pick<AdheseSlotOptions, 'format' | 'slot'>;
};

export type ModifiedSlotsStore = {
  slots: Map<string, SlotPair>;
  set(slot: SlotPair, id: string): string;
};

const name = `${packageName}/modifiedSlots`;

export const modifiedSlotsStore = createStore(persist<ModifiedSlotsStore>(
  set => ({
    slots: new Map(),
    set(pair, id): string {
      set((state) => {
        state.slots.set(id, pair);

        return {
          slots: new Map(state.slots),
        };
      });

      return id;
    },
  }),
  {
    name,
    version: Number(version.split('.')[0]),
    storage: {
      getItem(key) {
        const data = JSON.parse(localStorage.getItem(key) ?? '') as StorageValue<ModifiedSlotsStore> | null;

        if (!data) {
          return null;
        }

        return {
          state: {
            ...data.state,
            slots: new Map(data.state.slots),
          },
        };
      },
      setItem(key, newValue) {
        const str = JSON.stringify({
          state: {
            ...newValue.state,
            slots: Array.from(newValue.state.slots.entries()),
          },
        }, null);
        localStorage.setItem(key, str);
      },
      removeItem(key) {
        localStorage.removeItem(key);
      },
    },
  },
));

export const useModifiedSlots = (): ModifiedSlotsStore => useStore(modifiedSlotsStore);
