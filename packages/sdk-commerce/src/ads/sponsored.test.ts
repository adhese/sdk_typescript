/* eslint-disable ts/naming-convention */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { catalogIdFromAd, hideOrganicDuplicates, injectTiles, nativeTile, nativeTilesByCatalogId, type Product, productFromTile, productsBySku, renderProductTile, type StackAd, tileFromHtml, trackClicks } from './sponsored';

const product = (sku: string, path = `/p/${sku}.html`): Product => ({ sku, name: `Name ${sku}`, url: `https://shop.test${path}`, image: 'https://cdn.test/i.jpg', price: { value: 10, currency: 'EUR' } });

function grid(count: number): HTMLElement {
  const ul = document.createElement('ul');
  ul.innerHTML = Array.from({ length: count }, (_, i) => `<li class="item" id="o${i + 1}"><a class="product-item-link" href="/p/o${i + 1}.html">o${i + 1}</a></li>`).join('');

  return ul;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('catalogIdFromAd', () => {
  const ad = (assets: ReadonlyArray<unknown>, fallback?: string): StackAd => ({ native: { assets, link: { url: 'https://c.test', fallback } } });

  it('finds the catalog id in the supported asset shapes', () => {
    expect(catalogIdFromAd(ad([{ catalogId: 'A' }]))).toBe('A');
    expect(catalogIdFromAd(ad([{ catalog_id: 'B' }]))).toBe('B');
    expect(catalogIdFromAd(ad([{ id: 'catalogId', data: { value: 'C' } }]))).toBe('C');
    expect(catalogIdFromAd(ad([{ data: { type: 'catalog_id', value: 'D' } }]))).toBe('D');
    expect(catalogIdFromAd(ad([{ sku: 'E' }]))).toBe('E');
    expect(catalogIdFromAd(ad([{ id: 'sku', data: { value: 'F' } }]))).toBe('F');
  });

  it('falls back to the catalog id query parameter of the landing url', () => {
    expect(catalogIdFromAd(ad([], 'https://shop.test/x?catalogId=G'))).toBe('G');
    expect(catalogIdFromAd(ad([], 'https://shop.test/x?sku=H'))).toBe('H');
  });

  it('returns undefined when there is none', () => {
    expect(catalogIdFromAd(ad([{ foo: 1 }, null, 'x']))).toBeUndefined();
  });
});

describe('nativeTilesByCatalogId', () => {
  it('asks the module once and returns the markup it rendered', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: { A: '<li>a</li>', B: '', C: 5 } })));
    vi.stubGlobal('fetch', fetchMock);

    const tiles = await nativeTilesByCatalogId(['A 1', 'B', 'C'], '/adhese/sponsored/tiles');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toBe('/adhese/sponsored/tiles?ids=A%201%2CB%2CC');
    expect(Array.from(tiles?.entries() ?? [])).toEqual([['A', '<li>a</li>']]);
  });

  it('resolves undefined when the endpoint is unavailable, empty when there is nothing to ask', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 404 })));
    expect(await nativeTilesByCatalogId(['A'], '/t')).toBeUndefined();

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect(await nativeTilesByCatalogId(['A'], '/t')).toBeUndefined();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"nope":1}')));
    expect(await nativeTilesByCatalogId(['A'], '/t')).toBeUndefined();

    const untouched = vi.fn();
    vi.stubGlobal('fetch', untouched);
    expect((await nativeTilesByCatalogId([], '/t'))?.size).toBe(0);
    expect(untouched).not.toHaveBeenCalled();
  });
});

describe('nativeTile', () => {
  const html = '<li class="item product product-item"><div class="product-item-info"><a class="product photo product-item-photo" href="/p/a.html">x</a><div class="product-item-details"><strong class="product-item-name"><a class="product-item-link" href="/p/a.html">A</a></strong></div></div></li>';

  it('keeps the theme markup and adds the sponsored label, rel and sku', () => {
    const tile = nativeTile(html, 'A', 'Gesponsord') as HTMLElement;

    expect(tile.classList.contains('product-item')).toBe(true);
    expect(tile.classList.contains('adhese-sponsored-tile')).toBe(true);
    expect(tile.dataset.adheseSku).toBe('A');
    expect(tile.querySelector('.product-item-details > .adhese-label')?.textContent).toBe('Gesponsord');
    expect(Array.from(tile.querySelectorAll('a')).every(a => a.rel === 'sponsored')).toBe(true);
    expect(productFromTile(tile, 'A')?.url).toContain('/p/a.html');
  });

  it('returns nothing for markup without an element', () => {
    expect(nativeTile('   ', 'A')).toBeUndefined();
  });
});

describe('productsBySku', () => {
  it('makes one call, drops out-of-stock and unknown products', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: { products: { items: [
        { sku: 'A', name: 'A', canonical_url: '/a.html', stock_status: 'IN_STOCK', small_image: { url: 'https://cdn.test/a.jpg' }, price_range: { minimum_price: { final_price: { value: 5, currency: 'EUR' } } } },
        { sku: 'B', name: 'B', canonical_url: '/b.html', stock_status: 'OUT_OF_STOCK' },
        { sku: 'C', name: 'C', canonical_url: null, stock_status: 'IN_STOCK' },
        null,
      ] } },
    })));
    vi.stubGlobal('fetch', fetchMock);

    const products = await productsBySku(['A', 'B', 'C', 'D']);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(decodeURIComponent(String(fetchMock.mock.calls[0][0]))).toContain('["A","B","C","D"]');
    expect(products.map(p => p.sku)).toEqual(['A']);
    expect(products[0].price).toEqual({ value: 5, currency: 'EUR' });
  });

  it('does not call the network without skus and returns nothing on errors', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 500 }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await productsBySku([])).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await productsBySku(['A'])).toEqual([]);
  });
});

describe('renderProductTile', () => {
  it('labels the tile as sponsored and escapes values', () => {
    const tile = tileFromHtml(renderProductTile({ ...product('X'), name: '<b>x</b>' }));

    expect(tile.classList.contains('adhese-sponsored-tile')).toBe(true);
    expect(tile.querySelector('.adhese-label')?.textContent).toBe('Sponsored');
    expect(tile.querySelector('.product-item-link')?.textContent).toBe('<b>x</b>');
    expect(tile.querySelector('b')).toBeNull();
    expect(tile.querySelector('.price')?.textContent).toContain('10');
  });
});

describe('injectTiles', () => {
  it('puts tiles at the 1-based positions', () => {
    const el = grid(6);
    const tiles = ['s1', 's2', 's3'].map((id) => {
      const li = document.createElement('li');
      li.id = id;

      return li;
    });
    injectTiles(el, tiles, [1, 2, 5]);

    expect(Array.from(el.children).map(c => c.id)).toEqual(['s1', 's2', 'o1', 'o2', 's3', 'o3', 'o4', 'o5', 'o6']);
  });

  it('appends when the grid is shorter than the position or positions run out', () => {
    const el = grid(1);
    const a = document.createElement('li');
    const b = document.createElement('li');
    a.id = 'a';
    b.id = 'b';
    injectTiles(el, [a, b], [9]);

    expect(Array.from(el.children).map(c => c.id)).toEqual(['o1', 'a', 'b']);
  });
});

describe('hideOrganicDuplicates', () => {
  it('hides the organic copy only', () => {
    const el = grid(3);
    const tile = tileFromHtml(renderProductTile(product('o2', '/p/o2.html')));
    el.append(tile);

    expect(hideOrganicDuplicates(el, [product('o2', '/p/o2.html')])).toBe(1);
    expect((el.querySelector('#o2') as HTMLElement).hidden).toBe(true);
    expect((el.querySelector('#o1') as HTMLElement).hidden).toBe(false);
    expect(tile.hidden).toBe(false);
  });
});

describe('trackClicks', () => {
  it('fires the click tracker on click', () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(''));
    vi.stubGlobal('fetch', fetchMock);
    const tile = document.createElement('li');
    trackClicks(tile, 'https://click.adhese.test/1');
    tile.click();

    expect(fetchMock).toHaveBeenCalledWith('https://click.adhese.test/1', { mode: 'no-cors', keepalive: true, credentials: 'omit' });
  });

  it('ignores missing or non-https trackers', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const tile = document.createElement('li');
    trackClicks(tile, undefined);
    trackClicks(tile, 'http://x');
    tile.click();

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
