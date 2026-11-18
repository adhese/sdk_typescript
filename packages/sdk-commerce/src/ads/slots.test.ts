/* eslint-disable ts/naming-convention, ts/explicit-function-return-type, style/max-statements-per-line, ts/member-ordering */
import { describe, expect, it, vi } from 'vitest';
import { addDisplaySlot, addNativeSlot, addSponsoredSlot, formatsFrom, registerSlots } from './slots';

type Setup = (context: unknown, hooks: Record<string, (callback: (value?: never) => unknown) => void>) => void;

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

function runSetup(slot: Record<string, unknown>): { empty(): void; render(ad: unknown): Promise<unknown> } {
  let onEmpty: () => void = () => {};
  let onBeforeRender: (ad: unknown) => unknown = ad => ad;
  (slot.setup as Setup)({}, {
    onEmpty: (callback) => {
      onEmpty = callback as () => void;
    },
    onBeforeRender: (callback) => {
      onBeforeRender = callback as (ad: unknown) => unknown;
    },
  });

  return { empty: () => { onEmpty(); }, render: async ad => onBeforeRender(ad) };
}

function slotEl(attributes: Record<string, string>): HTMLElement {
  const el = document.createElement('div');
  el.className = 'adhese-slot';
  for (const [key, value] of Object.entries(attributes))
    el.setAttribute(key, value);
  document.body.append(el);

  return el;
}

describe('formatsFrom', () => {
  it('reads a single format or device formats', () => {
    expect(formatsFrom(slotEl({ 'data-format': 'billboard' }))).toBe('billboard');
    expect(formatsFrom(slotEl({ 'data-formats': '[{"format":"leader","query":"(max-width: 768px)"}]' }))).toEqual([{ format: 'leader', query: '(max-width: 768px)' }]);
  });

  it('rejects invalid formats', () => {
    expect(formatsFrom(slotEl({ 'data-formats': '{bad' }))).toBeNull();
    expect(formatsFrom(slotEl({ 'data-formats': '[{"format":1}]' }))).toBeNull();
    expect(formatsFrom(slotEl({}))).toBeNull();
  });
});

describe('display slots', () => {
  it('uses iframe + lazy loading and collapses when empty', () => {
    const { host, added } = fakeHost();
    const el = slotEl({ 'data-adhese-type': 'display', 'data-format': 'billboard', 'data-slot': '_top' });
    addDisplaySlot(host, el);

    expect(added[0]).toMatchObject({ format: 'billboard', slot: '_top', renderMode: 'iframe', lazyLoading: true, lazyLoadingOptions: { rootMargin: '200px' }, containingElement: el });
    runSetup(added[0]).empty();
    expect(el.hidden).toBe(true);
  });

  it('supports inline house creatives and eager loading', () => {
    const { host, added } = fakeHost();
    addDisplaySlot(host, slotEl({ 'data-format': 'x', 'data-render-mode': 'inline', 'data-lazy': 'false' }));

    expect(added[0]).toMatchObject({ renderMode: 'inline', lazyLoading: false });
  });

  it('ignores slots without a format', () => {
    const { host, added } = fakeHost();
    addDisplaySlot(host, slotEl({}));

    expect(added).toHaveLength(0);
  });
});

describe('native slots', () => {
  const setup = (): { el: HTMLElement; render(ad: unknown): Promise<unknown> } => {
    const { host, added } = fakeHost();
    const el = slotEl({ 'data-format': 'native_tile' });
    addNativeSlot(host, el);

    return { el, render: runSetup(added[0]).render };
  };

  it('renders a valid payload with the click tracker', async () => {
    const { render } = setup();
    const result = (await render({ tag: { ver: '1', title: 'Hi', url: 'https://a.test' }, clickTag: new URL('https://click.test/1') })) as { tag: string };

    expect(result.tag).toContain('href="https://click.test/1"');
    expect(result.tag).toContain('Hi');
  });

  it('leaves HTML creatives to the SDK', async () => {
    const ad = { tag: '<div>html</div>' };

    expect(await setup().render(ad)).toBe(ad);
  });

  it('treats an invalid payload as empty and collapses', async () => {
    const { el, render } = setup();

    expect(await render({ tag: { ver: '9' } })).toBeNull();
    expect(el.hidden).toBe(true);
  });
});

describe('sponsored slots', () => {
  function setup(options: { hydrate(): Promise<ReadonlyArray<{ sku: string; name: string; url: string }>>; ads: unknown; layout?: string }): { el: HTMLElement; grid: HTMLElement; render: Promise<unknown> } {
    const { host, stacked } = fakeHost();
    const grid = document.createElement('ul');
    grid.className = 'sp-grid';
    grid.innerHTML = '<li id="o1"><a class="product-item-link" href="/p/b.html">b</a></li><li id="o2"><a class="product-item-link" href="/p/other.html">o</a></li>';
    document.body.append(grid);
    const el = slotEl({ 'data-format': 'sponsored_grid', 'data-max-ads': '3', 'data-grid': '.sp-grid', ...(options.layout ? { 'data-layout': options.layout } : {}) });
    addSponsoredSlot(host, el, { positions: [1, 2] }, options.hydrate as never);

    return { el, grid, render: runSetup(stacked[0]).render({ tag: options.ads }) };
  }

  const ads = [
    { native: { assets: [{ sku: 'A' }], link: { url: 'https://click.test/a' } } },
    { native: { assets: [{ sku: 'B' }], link: { url: 'https://click.test/b' } } },
    { native: { assets: [{ sku: 'GONE' }] } },
  ];
  const products = [{ sku: 'B', name: 'B', url: 'https://shop.test/p/b.html' }, { sku: 'A', name: 'A', url: 'https://shop.test/p/a.html' }];

  it('requests maxAds, keeps auction order and drops unknown skus', async () => {
    const { host, stacked } = fakeHost();
    addSponsoredSlot(host, slotEl({ 'data-format': 'sponsored_grid', 'data-max-ads': '3' }));

    expect(stacked[0]).toMatchObject({ format: 'sponsored_grid', maxAds: 3 });

    const hydrate = vi.fn().mockResolvedValue(products);
    const { grid, render } = setup({ hydrate, ads });
    await render;

    expect(hydrate).toHaveBeenCalledWith(['A', 'B', 'GONE']);
    expect(Array.from(grid.children).map(c => c.getAttribute('data-adhese-sku') ?? c.id)).toEqual(['A', 'B', 'o1', 'o2']);
    // organic copy of B is hidden
    expect((grid.querySelector('#o1') as HTMLElement).hidden).toBe(true);
  });

  it('returns null (we rendered) and marks the slot filled', async () => {
    const { el, render } = setup({ hydrate: async () => products, ads });

    expect(await render).toBeNull();
    expect(el.classList.contains('adhese-slot--filled')).toBe(true);
  });

  it('collapses when nothing can be shown, and survives hydration errors', async () => {
    const empty = setup({ hydrate: async () => [], ads });
    await empty.render;
    expect(empty.el.hidden).toBe(true);

    const failing = setup({ hydrate: async () => { throw new Error('boom'); }, ads });
    await failing.render;
    expect(failing.el.hidden).toBe(true);
  });
});

describe('sponsored slots with storefront rendered tiles', () => {
  const li = (sku: string) => `<li class="item product product-item"><div class="product-item-info"><div class="product-item-details"><a class="product-item-link" href="https://shop.test/p/${sku.toLowerCase()}.html">${sku}</a></div></div></li>`;

  function setup(fetchTiles: () => Promise<ReadonlyMap<string, string> | undefined>, hydrate: () => Promise<ReadonlyArray<{ sku: string; name: string; url: string }>>) {
    document.body.innerHTML = '';
    const { host, stacked } = fakeHost();
    const grid = document.createElement('ul');
    grid.className = 'sp-grid';
    grid.innerHTML = '<li id="o1"><a class="product-item-link" href="/p/b.html">b</a></li><li id="o2"><a class="product-item-link" href="/p/other.html">o</a></li>';
    document.body.append(grid);
    const el = slotEl({ 'data-format': 'sponsored_grid', 'data-max-ads': '3', 'data-grid': '.sp-grid' });
    addSponsoredSlot(host, el, { positions: [1, 2], tilesUrl: '/adhese/sponsored/tiles' }, hydrate as never, undefined, fetchTiles as never);

    return { el, grid, render: runSetup(stacked[0]).render({ tag: [
      { native: { assets: [{ catalogId: 'A' }], link: { url: 'https://click.test/a' } } },
      { native: { assets: [{ catalogId: 'B' }] } },
      { native: { assets: [{ catalogId: 'GONE' }] } },
    ] }) };
  }

  it('injects the markup the storefront rendered, in auction order, and hides the organic copy', async () => {
    const hydrate = vi.fn();
    const { grid, render } = setup(async () => new Map([['A', li('A')], ['B', li('B')]]), hydrate);

    expect(await render).toBeNull();
    expect(hydrate).not.toHaveBeenCalled();
    expect(Array.from(grid.children).map(c => c.getAttribute('data-adhese-sku') ?? c.id)).toEqual(['A', 'B', 'o1', 'o2']);
    expect(grid.querySelector('[data-adhese-sku="A"] .adhese-label')).not.toBeNull();
    expect((grid.querySelector('#o1') as HTMLElement).hidden).toBe(true);
  });

  it('lets Magento initialise the widgets of injected tiles', async () => {
    const trigger = vi.fn();
    const jQuery = vi.fn(() => ({ trigger }));
    vi.stubGlobal('jQuery', jQuery);
    const { render } = setup(async () => new Map([['A', li('A')]]), vi.fn());
    await render;
    vi.unstubAllGlobals();

    expect(jQuery).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveBeenCalledWith('contentUpdated');
  });

  it('falls back to the graphql tile when the endpoint is unavailable', async () => {
    const hydrate = vi.fn().mockResolvedValue([{ sku: 'A', name: 'A', url: 'https://shop.test/p/a.html' }]);
    const { grid, render } = setup(async () => undefined, hydrate);
    await render;

    expect(hydrate).toHaveBeenCalledWith(['A', 'B', 'GONE']);
    expect(Array.from(grid.children).map(c => c.getAttribute('data-adhese-sku') ?? c.id)).toEqual(['A', 'o1', 'o2']);
  });

  it('collapses when the storefront returns none of the products', async () => {
    const { el, render } = setup(async () => new Map(), vi.fn());
    await render;

    expect(el.hidden).toBe(true);
  });
});

describe('registerSlots', () => {
  it('registers each element once by type', () => {
    document.body.innerHTML = '';
    const { host, added, stacked } = fakeHost();
    slotEl({ 'data-adhese-type': 'display', 'data-format': 'a' });
    slotEl({ 'data-adhese-type': 'native', 'data-format': 'b' });
    slotEl({ 'data-adhese-type': 'sponsored', 'data-format': 'c' });

    expect(registerSlots(host, document)).toBe(3);
    expect(registerSlots(host, document)).toBe(0);
    expect(added).toHaveLength(2);
    expect(stacked).toHaveLength(1);
  });
});
