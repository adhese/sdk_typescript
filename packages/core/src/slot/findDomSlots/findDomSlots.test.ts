import { describe, expect, it } from 'vitest';
import { createSlot } from '@core';
import { findDomSlots } from './findDomSlots';

describe('findDomSlots', () => {
  it('should find all slots in the DOM', async () => {
    document.body.innerHTML = `
      <div class="adunit" data-format="leaderboard" id="leaderboard"></div>
      <div class="adunit" data-format="billboard" id="billboard"></div>
    `;
    const slots = await findDomSlots();
    expect(slots.length).toBe(2);
  });

  it('should ignore slots that are already active', async () => {
    document.body.innerHTML = `
      <div class="adunit" data-format="leaderboard" id="leaderboard"></div>
      <div class="adunit" data-format="billboard" id="billboard"></div>
    `;
    const activeSlots = [
      createSlot({
        format: 'leaderboard',
        containingElement: 'leaderboard',
        location: location.pathname,
      }),
    ];

    const slots = await findDomSlots(activeSlots);

    expect(slots.length).toBe(1);
  });

  it('should ignore slots that do not have a format', async () => {
    document.body.innerHTML = `
      <div class="adunit" id="leaderboard"></div>
      <div class="adunit" data-format="billboard" id="billboard"></div>
    `;
    const slots = await findDomSlots();
    expect(slots.length).toBe(1);
  });
});
