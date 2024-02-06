import { beforeEach, describe, expect, it } from 'vitest';
import type { AdheseContext, Slot, SlotOptions } from '@core';
import { createSlotManager } from './slotManager';

describe('slotManager', () => {
  let context: AdheseContext;

  beforeEach(() => {
    context = {
      location: 'foo',
      consent: false,
    };
  });

  it('should create a slot manager', () => {
    const slotManager = createSlotManager({
      initialSlots: [],
      context,
    });

    expect(slotManager).toEqual({
      add: expect.any(Function) as (slot: SlotOptions) => Readonly<Slot>,
      getAll: expect.any(Function) as () => ReadonlyArray<Slot>,
      findDomSlots: expect.any(Function) as () => Promise<ReadonlyArray<Slot>>,
      get: expect.any(Function) as (name: string) => Slot | undefined,
      dispose: expect.any(Function) as () => void,
    } satisfies typeof slotManager);
  });

  it('should be able to get all slots', () => {
    const slotManager = createSlotManager({
      initialSlots: [{
        format: 'leaderboard',
        containingElement: 'leaderboard',
        context,
      }],
      context,
    });
    expect(slotManager.getAll().length).toBe(1);
  });

  it('should be able to add a slot', () => {
    const slotManager = createSlotManager({
      initialSlots: [],
      context,
    });
    slotManager.add({
      format: 'leaderboard',
      containingElement: 'leaderboard',
    });
    expect(slotManager.getAll().length).toBe(1);
  });

  it('should be able to find all slots in the DOM', async () => {
    document.body.innerHTML = `
      <div class="adunit" data-format="leaderboard" id="leaderboard"></div>
      <div class="adunit" data-format="billboard" id="billboard"></div>
    `;
    const slotManager = createSlotManager({
      initialSlots: [],
      context,
    });
    const slots = await slotManager.findDomSlots();
    expect(slots.length).toBe(2);
    expect(slotManager.getAll().length).toBe(2);
  });

  it('should be able to get a slot by name', () => {
    const slotManager = createSlotManager({
      initialSlots: [{
        format: 'leaderboard',
        containingElement: 'leaderboard',
        context,
      }],
      context,
    });
    const slot = slotManager.get('foo-leaderboard');
    expect(slot).toBeDefined();
  });

  it('should be able to dispose of all slots', () => {
    const slotManager = createSlotManager({
      initialSlots: [{
        format: 'leaderboard',
        containingElement: 'leaderboard',
        context,
      }],
      context,
    });
    slotManager.dispose();
    expect(slotManager.getAll().length).toBe(0);
  });
});
