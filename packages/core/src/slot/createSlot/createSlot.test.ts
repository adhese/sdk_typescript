import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSlot, logger } from '@core';

vi.mock('../logger/logger', () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('slot', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('should create a slot', () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    const slot = createSlot({
      location: location.pathname,
      format: 'leaderboard',
      containingElement: 'leaderboard',
    });

    expect(slot).toEqual({
      location: location.pathname,
      format: 'leaderboard',
      render: expect.any(Function) as () => HTMLElement | null,
      getElement: expect.any(Function) as () => HTMLElement | null,
    } satisfies typeof slot);

    expect(slot.getElement()).toBeNull();

    slot.render();

    expect(slot.getElement()).toBe(element);
  });

  it('should log an error when no element is found', () => {
    const spy = vi.spyOn(logger, 'error');

    const slot = createSlot({
      location: location.pathname,
      format: 'leaderboard',
      containingElement: 'leaderboard',
    });

    slot.render();

    expect(spy).toHaveBeenCalled();
  });
});
