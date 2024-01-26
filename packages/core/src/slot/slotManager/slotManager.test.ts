import { describe, expect, it } from 'vitest';
import type { Slot, SlotOptions } from '@core';
import { createSlotManager } from './slotManager';

describe('slotManager', () => {
  it('should create a slot manager', () => {
    const slotManager = createSlotManager({
      location: location.pathname,
      initialSlots: [],
    });

    expect(slotManager).toEqual({
      add: expect.any(Function) as (slot: SlotOptions) => Readonly<Slot>,
      getAll: expect.any(Function) as () => ReadonlyArray<Slot>,
      findDomSlots: expect.any(Function) as () => Promise<ReadonlyArray<Slot>>,
      get: expect.any(Function) as (name: string) => Slot | undefined,
    } satisfies typeof slotManager);
  });

  it('should be able to get all slots', () => {
    const slotManager = createSlotManager({
      location: location.pathname,
      initialSlots: [{
        format: 'leaderboard',
        containingElement: 'leaderboard',
      }],
    });
    expect(slotManager.getAll().length).toBe(1);
  });

  it('should be able to add a slot', () => {
    const slotManager = createSlotManager({
      location: location.pathname,
      initialSlots: [],
    });
    slotManager.add({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      location: location.pathname,
    });
    expect(slotManager.getAll().length).toBe(1);
  });

  it('should be able to find all slots in the DOM', async () => {
    document.body.innerHTML = `
      <div class="adunit" data-format="leaderboard" id="leaderboard"></div>
      <div class="adunit" data-format="billboard" id="billboard"></div>
    `;
    const slotManager = createSlotManager({
      location: location.pathname,
      initialSlots: [],
    });
    const slots = await slotManager.findDomSlots();
    expect(slots.length).toBe(2);
    expect(slotManager.getAll().length).toBe(2);
  });

  it('should be able to get a slot by name', () => {
    const slotManager = createSlotManager({
      location: 'foo',
      initialSlots: [{
        format: 'leaderboard',
        containingElement: 'leaderboard',
      }],
    });
    const slot = slotManager.get('foo-leaderboard');
    expect(slot).toBeDefined();
  });
});
