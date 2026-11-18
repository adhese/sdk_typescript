/* eslint-disable ts/naming-convention */
import type { SponsoredConfig } from '../shared/config';
import { escapeHtml, httpsUrl } from './native';

export type StackAd = {
  type?: string;
  native: {
    impressionCounter?: string;
    viewableImpressionCounter?: string;
    assets?: ReadonlyArray<unknown>;
    link?: { url: string; fallback?: string };
    ver?: string;
  };
};

export type Product = {
  sku: string;
  name: string;
  url: string;
  image?: string;
  price?: { value: number; currency: string };
};

export const defaultSponsored: SponsoredConfig = {
  positions: [1, 2, 5],
  hideOrganic: true,
  gridSelector: '.products.wrapper .product-items, .products-grid .product-items',
};

const catalogIdKeys = ['catalogId', 'catalog_id', 'sku'];

/**
 * The ad payload carries the catalog ID of the product (the Commerce SKU) and nothing else. We look for it in the
 * native assets (`{ catalogId }`, `{ id: 'catalogId', data: { value } }` or `{ data: { type: 'catalogId', value } }`, also
 * as `catalog_id` or `sku`) and fall back to the same names as query parameters of the landing URL.
 */
export function catalogIdFromAd(ad: StackAd): string | undefined {
  for (const asset of ad.native.assets ?? []) {
    if (typeof asset !== 'object' || asset === null)
      continue;
    const entry = asset as Record<string, unknown> & { id?: unknown; data?: { type?: unknown; value?: unknown } };

    for (const key of catalogIdKeys) {
      if (typeof entry[key] === 'string' && entry[key])
        return entry[key] as string;
    }
    if (typeof entry.data?.value === 'string' && entry.data.value && catalogIdKeys.some(key => key === entry.id || key === entry.data?.type))
      return entry.data.value;
  }

  try {
    const { searchParams } = new URL(ad.native.link?.fallback ?? '');

    return catalogIdKeys.map(key => searchParams.get(key)).find(Boolean) ?? undefined;
  }
  catch {
    return undefined;
  }
}

type GraphqlProducts = {
  data?: {
    products?: {
      items?: ReadonlyArray<{
        sku: string;
        name: string;
        canonical_url?: string | null;
        stock_status?: string;
        small_image?: { url?: string | null } | null;
        price_range?: { minimum_price?: { final_price?: { value: number; currency: string } } };
      } | null>;
    };
  };
};

const query = 'query($skus:[String]!){products(filter:{sku:{in:$skus}}){items{sku name canonical_url stock_status small_image{url} price_range{minimum_price{final_price{value currency}}}}}}';

/**
 * One call for all SKUs through Magento's core GraphQL (shopper's customer group prices apply). Out-of-stock and
 * invisible SKUs are not returned, so callers can treat missing SKUs as empty.
 */
export async function productsBySku(skus: ReadonlyArray<string>, endpoint = '/graphql'): Promise<ReadonlyArray<Product>> {
  if (skus.length === 0)
    return [];

  const response = await fetch(`${endpoint}?query=${encodeURIComponent(query)}&variables=${encodeURIComponent(JSON.stringify({ skus }))}`, {
    headers: { accept: 'application/json' },
    credentials: 'same-origin',
  });
  if (!response.ok)
    return [];

  const json = (await response.json()) as GraphqlProducts;
  const products: Array<Product> = [];

  for (const item of json.data?.products?.items ?? []) {
    if (!item || item.stock_status === 'OUT_OF_STOCK')
      continue;
    const url = item.canonical_url ? new URL(item.canonical_url, window.location.origin).href : undefined;
    if (!url)
      continue;
    products.push({
      sku: item.sku,
      name: item.name,
      url,
      image: httpsUrl(item.small_image?.url ?? undefined),
      price: item.price_range?.minimum_price?.final_price,
    });
  }

  return products;
}

/**
 * Product markup rendered by the storefront itself (theme templates, prices, swatches, add to cart), keyed by catalog ID.
 * Catalog IDs the shop does not return (out of stock, not visible) are absent. Resolves to `undefined` when the endpoint
 * is not available so callers can fall back.
 */
export async function nativeTilesByCatalogId(ids: ReadonlyArray<string>, endpoint: string): Promise<ReadonlyMap<string, string> | undefined> {
  if (ids.length === 0)
    return new Map();

  try {
    const response = await fetch(`${endpoint}${endpoint.includes('?') ? '&' : '?'}ids=${encodeURIComponent(ids.join(','))}`, {
      headers: { accept: 'application/json' },
      credentials: 'same-origin',
    });
    if (!response.ok)
      return undefined;

    const json = (await response.json()) as { items?: Record<string, unknown> };
    if (typeof json.items !== 'object' || json.items === null)
      return undefined;

    return new Map(Object.entries(json.items).filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1] !== ''));
  }
  catch {
    return undefined;
  }
}

/**
 * Wrap the storefront's own product item as a sponsored tile: adds the "Sponsored" label and the sponsored link rel.
 */
export function nativeTile(html: string, sku: string, sponsoredLabel = 'Sponsored'): HTMLElement | undefined {
  const tile = tileFromHtml(html);
  if (!tile)
    return undefined;

  tile.classList.add('adhese-sponsored-tile');
  tile.dataset.adheseSku = sku;
  for (const link of Array.from(tile.querySelectorAll('a')))
    link.rel = 'sponsored';

  const label = document.createElement('span');
  label.className = 'adhese-label';
  label.textContent = sponsoredLabel;
  (tile.querySelector('.product-item-details') ?? tile.querySelector('.product-item-info') ?? tile).prepend(label);

  return tile;
}

/**
 * The product URL of a rendered tile, used to hide the organic duplicate.
 */
export function productFromTile(tile: HTMLElement, sku: string): Product | undefined {
  const href = tile.querySelector<HTMLAnchorElement>('a.product-item-link, a.product-item-photo, a[href]')?.href;

  return href ? { sku, name: '', url: href } : undefined;
}

function formatPrice(price: Product['price']): string {
  if (!price)
    return '';
  try {
    return new Intl.NumberFormat(document.documentElement.lang || undefined, { style: 'currency', currency: price.currency }).format(price.value);
  }
  catch {
    return `${price.value} ${price.currency}`;
  }
}

/**
 * Product tile with the theme's own item classes plus the "Sponsored" label required for ad transparency.
 */
export function renderProductTile(product: Product, sponsoredLabel = 'Sponsored'): string {
  return `<li class="item product product-item adhese-sponsored-tile" data-adhese-sku="${escapeHtml(product.sku)}">`
    + `<div class="product-item-info">`
    + `<a class="product photo product-item-photo" href="${escapeHtml(product.url)}" rel="sponsored">${
      product.image ? `<img class="product-image-photo" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">` : ''
    }</a><div class="product details product-item-details">`
    + `<span class="adhese-label">${escapeHtml(sponsoredLabel)}</span>`
    + `<strong class="product name product-item-name"><a class="product-item-link" href="${escapeHtml(product.url)}" rel="sponsored">${escapeHtml(product.name)}</a></strong>`
    + `<span class="price">${escapeHtml(formatPrice(product.price))}</span>`
    + `</div></div></li>`;
}

/**
 * Insert tiles at the configured 1-based positions of a grid; extra tiles are appended. Returns the inserted elements.
 */
export function injectTiles(grid: Element, tiles: ReadonlyArray<HTMLElement>, positions: ReadonlyArray<number>): ReadonlyArray<HTMLElement> {
  const inserted: Array<HTMLElement> = [];

  for (const [index, tile] of tiles.entries()) {
    const position = positions[index];
    const reference = position === undefined ? null : (Array.from(grid.children)[position - 1] ?? null);

    if (reference)
      reference.before(tile);
    else
      grid.append(tile);
    inserted.push(tile);
  }

  return inserted;
}

/**
 * Hide the organic copy of sponsored SKUs on the same page, matched by product URL path.
 */
export function hideOrganicDuplicates(grid: Element, products: ReadonlyArray<Product>): number {
  const paths = new Set(products.map(product => new URL(product.url).pathname));
  let hidden = 0;

  for (const link of Array.from(grid.querySelectorAll<HTMLAnchorElement>('li:not(.adhese-sponsored-tile) a.product-item-link'))) {
    if (paths.has(new URL(link.href, window.location.origin).pathname)) {
      const item = link.closest('li');
      if (item instanceof HTMLElement) {
        item.hidden = true;
        item.dataset.adheseHidden = 'true';
        hidden++;
      }
    }
  }

  return hidden;
}

/**
 * Fire the ad's click tracker before the shopper navigates to the normal product URL.
 */
export function trackClicks(tile: HTMLElement, trackerUrl: string | undefined): void {
  const url = httpsUrl(trackerUrl);
  if (!url)
    return;

  tile.addEventListener('click', () => {
    fetch(url, { mode: 'no-cors', keepalive: true, credentials: 'omit' }).catch(() => {});
  });
}

export function tileFromHtml(html: string): HTMLElement {
  const template = document.createElement('template');
  template.innerHTML = html.trim();

  return template.content.firstElementChild as HTMLElement;
}
