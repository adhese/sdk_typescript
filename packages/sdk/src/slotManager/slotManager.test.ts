import type { AdheseContext, AdheseSlot, AdheseSlotOptions } from '@adhese/sdk';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { testContext } from '../testUtils';
import { createSlotManager } from './slotManager';

describe('slotManager', () => {
  let context: AdheseContext;
  let slotManager: ReturnType<typeof createSlotManager> | undefined;

  beforeEach(() => {
    context = testContext;
  });

  afterEach(() => {
    slotManager?.dispose();
  });

  it('should create a slot manager', () => {
    slotManager = createSlotManager({
      initialSlots: [],
      context,
    });

    expect(slotManager).toEqual({
      add: expect.any(Function) as (slot: AdheseSlotOptions) => Readonly<AdheseSlot>,
      getAll: expect.any(Function) as () => ReadonlyArray<AdheseSlot>,
      findDomSlots: expect.any(Function) as () => Promise<ReadonlyArray<AdheseSlot>>,
      get: expect.any(Function) as (name: string) => AdheseSlot | undefined,
      dispose: expect.any(Function) as () => void,
    } satisfies typeof slotManager);
  });

  it('should be able to get all slots', () => {
    slotManager = createSlotManager({
      initialSlots: [{
        format: 'leaderboard',
      }],
      context,
    });
    expect(slotManager.getAll().length).toBe(1);
  });

  it('should be able to add a slot', () => {
    slotManager = createSlotManager({
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
    slotManager = createSlotManager({
      initialSlots: [],
      context,
    });
    const slots = await slotManager.findDomSlots();
    expect(slots.length).toBe(2);
    expect(slotManager.getAll().length).toBe(2);
  });

  it('should be able to get a slot by name', () => {
    slotManager = createSlotManager({
      initialSlots: [{
        format: 'leaderboard',
        containingElement: 'leaderboard',
      }],
      context,
    });
    const slot = slotManager.get('foo-leaderboard');
    expect(slot).toBeDefined();
  });

  it('should be able to dispose of all slots', () => {
    slotManager = createSlotManager({
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
