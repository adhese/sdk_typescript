import { beforeEach, describe, expect, it } from 'vitest';
import type { AdheseContext, AdheseSlot, AdheseSlotOptions } from '@core';
import { testContext } from '../../testUtils';
import { createSlotManager } from './slotManager';

describe('slotManager', () => {
  let context: AdheseContext;

  beforeEach(() => {
    context = testContext;
  });

  it('should create a slot manager', async () => {
    const slotManager = await createSlotManager({
      initialSlots: [],
      context,
    });

    expect(slotManager).toEqual({
      add: expect.any(Function) as (slot: AdheseSlotOptions) => Promise<Readonly<AdheseSlot>>,
      getAll: expect.any(Function) as () => ReadonlyArray<AdheseSlot>,
      findDomSlots: expect.any(Function) as () => Promise<ReadonlyArray<AdheseSlot>>,
      get: expect.any(Function) as (name: string) => AdheseSlot | undefined,
      dispose: expect.any(Function) as () => void,
    } satisfies typeof slotManager);
  });

  it('should be able to get all slots', async () => {
    const slotManager = await createSlotManager({
      initialSlots: [{
        format: 'leaderboard',
        containingElement: 'leaderboard',
      }],
      context,
    });
    expect(slotManager.getAll().length).toBe(1);
  });

  it('should be able to add a slot', async () => {
    const slotManager = await createSlotManager({
      initialSlots: [],
      context,
    });
    await slotManager.add({
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
    const slotManager = await createSlotManager({
      initialSlots: [],
      context,
    });
    const slots = await slotManager.findDomSlots();
    expect(slots.length).toBe(2);
    expect(slotManager.getAll().length).toBe(2);
  });

  it('should be able to get a slot by name', async () => {
    const slotManager = await createSlotManager({
      initialSlots: [{
        format: 'leaderboard',
        containingElement: 'leaderboard',
      }],
      context,
    });
    const slot = slotManager.get('foo-leaderboard');
    expect(slot).toBeDefined();
  });

  it('should be able to dispose of all slots', async () => {
    const slotManager = await createSlotManager({
      initialSlots: [{
        format: 'leaderboard',
        containingElement: 'leaderboard',
      }],
      context,
    });
    slotManager.dispose();
    expect(slotManager.getAll().length).toBe(0);
  });
});
