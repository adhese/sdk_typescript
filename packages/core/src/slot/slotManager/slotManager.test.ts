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
      addSlot: expect.any(Function) as (slot: SlotOptions) => Readonly<Slot>,
      getSlots: expect.any(Function) as () => ReadonlyArray<Slot>,
      findDomSlots: expect.any(Function) as () => ReadonlyArray<Slot>,
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
    expect(slotManager.getSlots().length).toBe(1);
  });

  it('should be able to add a slot', () => {
    const slotManager = createSlotManager({
      location: location.pathname,
      initialSlots: [],
    });
    slotManager.addSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      location: location.pathname,
    });
    expect(slotManager.getSlots().length).toBe(1);
  });

  it('should be able to find all slots in the DOM', () => {
    document.body.innerHTML = `
      <div class="adunit" data-format="leaderboard" id="leaderboard"></div>
      <div class="adunit" data-format="billboard" id="billboard"></div>
    `;
    const slotManager = createSlotManager({
      location: location.pathname,
      initialSlots: [],
    });
    const slots = slotManager.findDomSlots();
    expect(slots.length).toBe(2);
    expect(slotManager.getSlots().length).toBe(2);
  });
});
