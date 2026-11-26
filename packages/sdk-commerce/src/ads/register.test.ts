/* eslint-disable ts/explicit-function-return-type */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applySlotSpec, createSlotRegistry, parseSlotSpec, slotQueueName } from './register';

function fakeHost() {
  const added: Array<Record<string, unknown>> = [];
  const stacked: Array<Record<string, unknown>> = [];

  return {
    added,
    stacked,
    host: {
      addSlot: (slot: Record<string, unknown>) => added.push(slot),
      plugins: { stackSlots: { addSlot: (slot: Record<string, unknown>) => stacked.push(slot) } },
    },
  };
}

function mount(html: string): void {
  document.body.innerHTML = html;
}

describe('parseSlotSpec', () => {
  it('accepts a minimal spec', () => {
    expect(parseSlotSpec({ selector: '#hero', type: 'display', format: 'billboard' })).toEqual({ selector: '#hero', type: 'display', format: 'billboard' });
  });

  it('accepts device formats as an array or as JSON', () => {
    const formats = [{ format: 'leader', query: '(max-width: 768px)' }];

    expect(parseSlotSpec({ selector: '#a', type: 'display', formats })?.formats).toEqual(formats);
    expect(parseSlotSpec({ selector: '#a', type: 'display', formats: JSON.stringify(formats) })?.formats).toEqual(formats);
  });

  it('keeps only valid optional fields', () => {
    const spec = parseSlotSpec({
      selector: '.grid',
      type: 'sponsored',
      format: 'sponsored',
      slot: '_top',
      renderMode: 'inline',
      lazy: false,
      maxAds: '6',
      grid: '.products',
      layout: 'carousel',
      reservedHeight: '250.4',
      unknown: 'dropped',
    });

    expect(spec).toEqual({ selector: '.grid', type: 'sponsored', format: 'sponsored', slot: '_top', renderMode: 'inline', lazy: false, maxAds: 6, grid: '.products', layout: 'carousel', reservedHeight: 250 });

    const lenient = parseSlotSpec({ selector: '.a', type: 'native', format: 'x', renderMode: 'script', lazy: 'maybe', maxAds: 99, layout: 'wall', reservedHeight: -5 });

    expect(lenient).toEqual({ selector: '.a', type: 'native', format: 'x' });
  });

  it('rejects unusable specs', () => {
    expect(parseSlotSpec(null)).toBeNull();
    expect(parseSlotSpec('#hero')).toBeNull();
    expect(parseSlotSpec({ type: 'display', format: 'x' })).toBeNull();
    expect(parseSlotSpec({ selector: '', type: 'display', format: 'x' })).toBeNull();
    expect(parseSlotSpec({ selector: 'x'.repeat(501), type: 'display', format: 'x' })).toBeNull();
    expect(parseSlotSpec({ selector: '#a', type: 'video', format: 'x' })).toBeNull();
    expect(parseSlotSpec({ selector: '#a', type: 'display' })).toBeNull();
    expect(parseSlotSpec({ selector: '#a', type: 'display', formats: '{bad' })).toBeNull();
    expect(parseSlotSpec({ selector: '#a', type: 'display', formats: [{ format: 1 }] })).toBeNull();
  });
});

describe('applySlotSpec', () => {
  it('writes the same attributes the markup route reads', () => {
    const element = document.createElement('div');
    applySlotSpec(element, { selector: '#a', type: 'sponsored', format: 'sponsored', slot: '_s', lazy: false, maxAds: 3, grid: '.g', layout: 'carousel', reservedHeight: 300 });

    expect(element.className).toBe('adhese-slot');
    expect(element.dataset).toMatchObject({ adheseType: 'sponsored', format: 'sponsored', slot: '_s', lazy: 'false', maxAds: '3', grid: '.g', layout: 'carousel' });
    expect(element.style.minHeight).toBe('300px');
  });

  it('replaces attributes the page already had', () => {
    const element = document.createElement('div');
    element.dataset.format = 'old';
    element.dataset.slot = 'old';
    applySlotSpec(element, { selector: '#a', type: 'display', format: 'new' });

    expect(element.dataset.format).toBe('new');
    expect(element.dataset.slot).toBeUndefined();
  });
});

describe('slot registry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
    delete (window as unknown as Record<string, unknown>)[slotQueueName];
  });

  it('holds specs until the SDK is attached, then registers them', () => {
    mount('<div id="hero"></div>');
    const registry = createSlotRegistry();
    const { host, added } = fakeHost();

    expect(registry.register({ selector: '#hero', type: 'display', format: 'billboard', slot: '_top' })).toBe(true);
    expect(added).toHaveLength(0);

    registry.attach(host);

    expect(added).toHaveLength(1);
    expect(added[0]).toMatchObject({ format: 'billboard', slot: '_top', renderMode: 'iframe', containingElement: document.querySelector('#hero') });
  });

  it('registers immediately once attached, and routes by type', () => {
    mount('<div id="n"></div><div id="s"></div><div id="g" class="grid"></div>');
    const registry = createSlotRegistry();
    const { host, added, stacked } = fakeHost();
    registry.attach(host);

    registry.register({ selector: '#n', type: 'native', format: 'tile' });
    registry.register({ selector: '#s', type: 'sponsored', format: 'sponsored', maxAds: 2, grid: '#g' });

    expect(added).toHaveLength(1);
    expect(added[0]).toMatchObject({ format: 'tile', renderMode: 'inline' });
    expect(stacked).toHaveLength(1);
    expect(stacked[0]).toMatchObject({ format: 'sponsored', maxAds: 2 });
  });

  it('rejects invalid specs without throwing', () => {
    const registry = createSlotRegistry();

    expect(registry.register({ type: 'display' })).toBe(false);
    expect(registry.register(undefined)).toBe(false);
  });

  it('registers an element only once', () => {
    mount('<div id="hero"></div>');
    const registry = createSlotRegistry();
    const { host, added } = fakeHost();
    registry.attach(host);

    registry.register({ selector: '#hero', type: 'display', format: 'billboard' });
    registry.register({ selector: '#hero', type: 'display', format: 'other' });

    expect(added).toHaveLength(1);
    expect((document.querySelector('#hero') as HTMLElement).dataset.format).toBe('billboard');
  });

  it('uses the first match of a selector', () => {
    mount('<div class="ad"></div><div class="ad"></div>');
    const registry = createSlotRegistry();
    const { host, added } = fakeHost();
    registry.attach(host);

    registry.register({ selector: '.ad', type: 'display', format: 'billboard' });

    expect(added).toHaveLength(1);
    expect(added[0].containingElement).toBe(document.querySelectorAll('.ad')[0]);
  });

  it('survives an invalid selector', () => {
    const registry = createSlotRegistry();
    const { host, added } = fakeHost();
    registry.attach(host);

    expect(registry.register({ selector: '#a[', type: 'display', format: 'billboard' })).toBe(true);
    expect(added).toHaveLength(0);
  });

  it('waits for an element that appears later', async () => {
    const registry = createSlotRegistry(document, 5000);
    const { host, added } = fakeHost();
    registry.attach(host);

    registry.register({ selector: '#late', type: 'display', format: 'billboard' });
    expect(added).toHaveLength(0);

    const element = document.createElement('div');
    element.id = 'late';
    document.body.append(element);
    await vi.advanceTimersByTimeAsync(0);
    // jsdom delivers mutation records in a microtask
    await Promise.resolve();

    expect(added).toHaveLength(1);
  });

  it('gives up after the wait time', async () => {
    const registry = createSlotRegistry(document, 1000);
    const { host, added } = fakeHost();
    registry.attach(host);

    registry.register({ selector: '#late', type: 'display', format: 'billboard' });
    await vi.advanceTimersByTimeAsync(1500);

    const element = document.createElement('div');
    element.id = 'late';
    document.body.append(element);
    await vi.advanceTimersByTimeAsync(0);
    await Promise.resolve();

    expect(added).toHaveLength(0);
  });
});

describe('slot queue', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    delete (window as unknown as Record<string, unknown>)[slotQueueName];
  });

  it('takes over specs pushed before the bundle loaded and the ones pushed after', () => {
    mount('<div id="a"></div><div id="b"></div>');
    (window as unknown as Record<string, unknown>)[slotQueueName] = [{ selector: '#a', type: 'display', format: 'billboard' }];
    const registry = createSlotRegistry();
    const { host, added } = fakeHost();

    registry.consume();
    registry.attach(host);
    expect(added).toHaveLength(1);

    const queue = (window as unknown as Record<string, Array<unknown>>)[slotQueueName];
    queue.push({ selector: '#b', type: 'display', format: 'leaderboard' }, { nonsense: true });

    expect(added).toHaveLength(2);
    expect(added[1]).toMatchObject({ format: 'leaderboard' });
  });

  it('creates the queue when the tag manager did not', () => {
    const registry = createSlotRegistry();
    registry.consume();

    expect(Array.isArray((window as unknown as Record<string, unknown>)[slotQueueName])).toBe(true);
  });
});
