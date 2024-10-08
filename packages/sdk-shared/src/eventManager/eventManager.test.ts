import { describe, expect, it, vi } from 'vitest';
import { createEventManager } from './eventManager';

describe('eventManager', () => {
  it('should create an event manager', () => {
    const eventManager = createEventManager<{
      event1: string;
    }>();

    const listener = vi.fn();
    eventManager.event1.addListener(listener);

    expect(eventManager).toBeDefined();
    expect(eventManager).toEqual({

      event1: {
        listeners: new Set([listener]),
        dispatch: expect.any(Function),
        dispatchAsync: expect.any(Function),
        addListener: expect.any(Function),
        removeListener: expect.any(Function),
      },
      dispose: expect.any(Function),

    } satisfies typeof eventManager);
  });

  it('should dispatch an event', () => {
    const eventManager = createEventManager<{
      event1: string;
    }>();
    const listener = vi.fn();
    eventManager.event1.addListener(listener);

    eventManager.event1.dispatch('data');

    expect(listener).toHaveBeenCalledWith('data');
  });

  it('should dispatch an event asynchronously', async () => {
    const eventManager = createEventManager<{
      event1: string;
    }>();
    const listener = vi.fn();
    eventManager.event1.addListener(listener);

    await eventManager.event1.dispatchAsync('data');

    expect(listener).toHaveBeenCalledWith('data');
  });

  it('should add and remove a listener', () => {
    const eventManager = createEventManager<{
      event1: string;
    }>();
    const listener = vi.fn();
    eventManager.event1.addListener(listener);
    eventManager.event1.removeListener(listener);

    eventManager.event1.dispatch('data');

    expect(listener).not.toHaveBeenCalled();
  });

  it('should dispose of all listeners', () => {
    const eventManager = createEventManager<{
      event1: string;
    }>();
    const listener = vi.fn();
    eventManager.event1.addListener(listener);
    eventManager.dispose();

    eventManager.event1.dispatch('data');

    expect(listener).not.toHaveBeenCalled();
  });
});
