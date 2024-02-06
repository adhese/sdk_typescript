import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type Ad, type AdheseContext, createSlot } from '@core';

vi.mock('../logger/logger', () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('slot', () => {
  let context: AdheseContext;

  beforeEach(() => {
    context = {
      location: 'foo',
      consent: false,
    };
  });

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
      format: 'leaderboard',
      containingElement: 'leaderboard',
      context,
    });

    expect(slot).toEqual({
      location: 'foo',
      format: 'leaderboard',
      render: expect.any(Function) as () => Promise<HTMLElement>,
      getElement: expect.any(Function) as () => HTMLElement | null,
      getName: expect.any(Function) as () => string,
      getAd: expect.any(Function) as () => Ad | null,
      parameters: expect.any(Map) as Map<string, string>,
      dispose: expect.any(Function) as () => void,
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
      format: 'leaderboard',
      containingElement: 'leaderboard',
      slot: 'bar',
      context,
    });

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

  it('should create a slot with parameters', async () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    const slot = createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      parameters: {
        foo: 'bar',
      },
      context,
    });

    expect(slot.parameters.has('foo')).toBe(true);
    expect(slot.parameters.get('foo')).toBe('bar');

    slot.parameters.set('foo', 'baz');

    expect(slot.parameters.get('foo')).toBe('baz');
  });

  it('should log an error when no element is found', async () => {
    const slot = createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      context,
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
      format: 'leaderboard',
      containingElement: element,
      context,
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
      format: 'leaderboard',
      containingElement: 'leaderboard',
      context,
    });

    await slot.render({
      tag: '<div>foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
      impressionCounter: new URL('https://foo.bar'),
    });

    expect(slot.getElement()).toBe(element);
  });

  it('should be able generate a slot name', async () => {
    expect(createSlot({
      format: 'bar',
      context,
    }).getName()).toBe('foo-bar');

    expect(createSlot({
      format: 'bar',
      slot: 'baz',
      context,
    }).getName()).toBe('foobaz-bar');
  });

  it('should be able to dispose a slot', async () => {
    const element = document.createElement('div');

    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';
    element.id = 'leaderboard';

    document.body.appendChild(element);

    const slot = createSlot({
      format: 'leaderboard',
      containingElement: 'leaderboard',
      context,
    });

    await slot.render({
      tag: '<div>foo</div>',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      adType: 'foo',
      impressionCounter: new URL('https://foo.bar'),
    });

    slot.dispose();

    expect(slot.getElement()).toBeNull();
  });
});
