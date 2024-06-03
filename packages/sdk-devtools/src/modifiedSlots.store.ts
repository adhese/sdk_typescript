import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { type StorageValue, persist } from 'zustand/middleware';
import { name as packageName, version } from '../package.json';

type SlotOptions = {
  format: string;
  slot?: string;
};

export type ModifiedSlotsStore = {
  slots: Map<string, SlotOptions>;
  set(name: string, slot: SlotOptions): string;
  remove(id: string): void;
};

const storeName = `${packageName}/modifiedSlots`;

export const modifiedSlotsStore = createStore(persist<ModifiedSlotsStore>(
  set => ({
    slots: new Map(),
    set(name: string, slot: SlotOptions): string {
      set((state) => {
        state.slots.set(name, slot);

        return {
          slots: new Map(state.slots),
        };
      });

      return name;
    },
    remove(id: string): void {
      set((state) => {
        state.slots.delete(id);

        return {
          slots: new Map(state.slots),
        };
      });
    },
  }),
  {
    name: storeName,
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
