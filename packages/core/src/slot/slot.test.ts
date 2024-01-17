import { afterEach, describe, expect, it, vi } from 'vitest';
import type { UrlString } from '@utils';
import { logger } from '../logger/logger';
import { createSlot } from './slot';

vi.mock('../logger/logger', () => ({
  logger: {
    error: vi.fn(),
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
      location: location.toString() as UrlString,
      format: 'leaderboard',
      containingElementId: 'leaderboard',
    });

    expect(slot).toEqual({
      location: location.toString(),
      format: 'leaderboard',
      containingElementId: 'leaderboard',
      element,
    });
  });

  it('should log an error when no element is found', () => {
    const spy = vi.spyOn(logger, 'error');

    createSlot({
      location: location.toString() as UrlString,
      format: 'leaderboard',
      containingElementId: 'leaderboard',
    });

    expect(spy).toHaveBeenCalled();
  });
});
