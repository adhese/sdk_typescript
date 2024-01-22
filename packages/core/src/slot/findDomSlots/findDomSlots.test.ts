import { describe, expect, it } from 'vitest';
import { createSlot } from '@core';
import { findDomSlots } from './findDomSlots';

describe('findDomSlots', () => {
  it('should find all slots in the DOM', () => {
    document.body.innerHTML = `
      <div class="adunit" data-format="leaderboard" id="leaderboard"></div>
      <div class="adunit" data-format="billboard" id="billboard"></div>
    `;
    const slots = findDomSlots();
    expect(slots.length).toBe(2);
  });

  it('should ignore slots that are already active', () => {
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

    for (const slot of activeSlots)
      slot.render();

    const slots = findDomSlots(activeSlots);

    expect(slots.length).toBe(1);
  });

  it('should ignore slots that do not have a format', () => {
    document.body.innerHTML = `
      <div class="adunit" id="leaderboard"></div>
      <div class="adunit" data-format="billboard" id="billboard"></div>
    `;
    const slots = findDomSlots();
    expect(slots.length).toBe(1);
  });
});
