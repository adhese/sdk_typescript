import { afterEach, describe, expect, it, vi } from 'vitest';
import { type Ad, createSlot } from '@core';

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

  it('should create a slot', async () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    const slot = createSlot({
      location: 'foo',
      format: 'leaderboard',
      containingElement: 'leaderboard',
    });

    expect(slot).toEqual({
      location: 'foo',
      format: 'leaderboard',
      render: expect.any(Function) as () => Promise<HTMLElement | null>,
      getElement: expect.any(Function) as () => HTMLElement | null,
      getSlotName: expect.any(Function) as () => string,
      getAd: expect.any(Function) as () => Ad | null,
    } satisfies typeof slot);

    expect(slot.getElement()).toBeNull();
    await slot.render({
      tag: '<div>foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
    });
    expect(slot.getElement()).toBe(element);
  });

  it('should create a slot with the slot option set', async () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.dataset.slot = 'bar';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    const slot = createSlot({
      location: 'foo',
      format: 'leaderboard',
      containingElement: 'leaderboard',
      slot: 'bar',
    });

    expect(slot).toEqual({
      location: 'foo',
      format: 'leaderboard',
      slot: 'bar',
      render: expect.any(Function) as () => Promise<HTMLElement | null>,
      getElement: expect.any(Function) as () => HTMLElement | null,
      getSlotName: expect.any(Function) as () => string,
      getAd: expect.any(Function) as () => Ad | null,
    } satisfies typeof slot);

    expect(slot.getElement()).toBeNull();
    await slot.render({
      tag: '<div>foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
    });
    expect(slot.getElement()).toBe(element);
    expect(slot.getAd()).toBeDefined();
  });

  it('should log an error when no element is found', async () => {
    const slot = createSlot({
      location: location.pathname,
      format: 'leaderboard',
      containingElement: 'leaderboard',
    });

    try {
      await slot.render({
        tag: '<div>foo</div>',
        // eslint-disable-next-line ts/naming-convention
        slotID: 'bar',
        slotName: 'baz',
        adType: 'foo',
      });
    }
    catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should create a slot with an element passed instead of an element id', () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.dataset.slot = 'bar';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    const slot = createSlot({

      location: 'foo',
      format: 'leaderboard',
      containingElement: element,
    });

    expect(slot.getElement()).toBe(element);
  });

  it('should be able to render a slot', async () => {
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

    await slot.render({
      tag: '<div>foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
    });

    expect(slot.getElement()).toBe(element);
  });

  it('should be able generate a slot name', async () => {
    expect(createSlot({
      location: 'foo',
      format: 'bar',
    }).getSlotName()).toBe('foo-bar');

    expect(createSlot({
      location: 'foo',
      format: 'bar',
      slot: 'baz',
    }).getSlotName()).toBe('foobaz-bar');
  });
});
