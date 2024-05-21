import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { testContext } from '../testUtils';
import { createSlot } from '../slot/slot';
import type { AdheseContext } from '../main.types';
import { findDomSlots } from './findDomSlots';

describe('findDomSlots', () => {
  let context: AdheseContext;

  beforeEach(() => {
    context = testContext;

    const mockedSlot = createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      context,
    });

    context.getAll = vi.fn(() => [mockedSlot]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should find all slots in the DOM', async () => {
    document.body.innerHTML = `
      <div class="adunit" data-format="leaderboard" id="leaderboard"></div>
      <div class="adunit" data-format="billboard" id="billboard"></div>
    `;
    context.getAll = vi.fn(() => []);

    const slots = await findDomSlots(context);
    expect(slots.length).toBe(2);
  });

  it('should ignore slots that are already active', async () => {
    document.body.innerHTML = `
      <div class="adunit" data-format="leaderboard" id="leaderboard"></div>
      <div class="adunit" data-format="billboard" id="billboard"></div>
    `;

    const slots = await findDomSlots(context);

    expect(slots.length).toBe(1);
  });

  it('should ignore slots that do not have a format', async () => {
    document.body.innerHTML = `
      <div class="adunit" id="leaderboard"></div>
      <div class="adunit" data-format="billboard" id="billboard"></div>
    `;
    const slots = await findDomSlots(context);
    expect(slots.length).toBe(1);
  });
});
