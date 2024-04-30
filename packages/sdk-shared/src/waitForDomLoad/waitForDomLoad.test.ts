import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { waitForDomLoad } from './waitForDomLoad';

describe('waitForDomLoad', () => {
  let addEventListener: MockInstance;
  let removeEventListener: MockInstance;

  beforeEach(() => {
    addEventListener = vi.spyOn(window, 'addEventListener').mockImplementation((event, callback) => {
      if (event === 'DOMContentLoaded' && typeof callback === 'function')
        callback(new Event('DOMContentLoaded'));
    });
    removeEventListener = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should wait for the DOM to load', async () => {
    vi.stubGlobal('document', {
      readyState: 'loading',
      addEventListener,
      removeEventListener,
    });

    await waitForDomLoad();

    expect(window.addEventListener).toHaveBeenCalled();
  });

  it('should immediately resolve if the DOM is already loaded', async () => {
    vi.stubGlobal('document', {
      readyState: 'complete',
      addEventListener,
      removeEventListener,
    });

    await waitForDomLoad();

    expect(addEventListener).not.toHaveBeenCalled();
  });
});
