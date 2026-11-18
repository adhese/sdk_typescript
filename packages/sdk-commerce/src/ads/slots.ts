import type { AdheseAd, AdheseSlotOptions } from '@adhese/sdk';
import type { SponsoredConfig } from '../shared/config';
import { parseNative, renderNativeTile } from './native';
import { catalogIdFromAd, defaultSponsored, hideOrganicDuplicates, injectTiles, nativeTile, nativeTilesByCatalogId, type Product, productFromTile, productsBySku, renderProductTile, type StackAd, tileFromHtml, trackClicks } from './sponsored';

export type SlotType = 'display' | 'native' | 'sponsored';

/**
 * Subset of the Adhese instance the wrapper needs; keeps slot code testable without the full SDK.
 */
export type SlotHost = {
  plugins: {
    stackSlots: {
      addSlot(slot: Omit<AdheseSlotOptions, 'location' | 'context' | 'type' | 'renderMode' | 'pluginOptions' | 'width' | 'height'> & { maxAds: number }): unknown;
    };
  };
  addSlot(slot: Omit<AdheseSlotOptions, 'location' | 'context'>): unknown;
};

export const slotSelector = '.adhese-slot[data-adhese-type]';
const lazyRootMargin = '200px';

export function collapse(element: HTMLElement): void {
  element.hidden = true;
  element.style.minHeight = '0';
  element.classList.add('adhese-slot--empty');
}

/**
 * `data-formats='[{"format":"leaderboard","query":"(max-width: 768px)"}, ...]'` for device specific formats,
 * otherwise `data-format`.
 */
export function formatsFrom(element: HTMLElement): AdheseSlotOptions['format'] | null {
  const { formats } = element.dataset;
  if (formats) {
    try {
      const parsed = JSON.parse(formats) as unknown;
      if (Array.isArray(parsed) && parsed.every(entry => typeof entry?.format === 'string' && typeof entry?.query === 'string'))
        return parsed as ReadonlyArray<{ format: string; query: string }>;
    }
    catch {
      return null;
    }

    return null;
  }

  return element.dataset.format || null;
}

function lazyOptions(element: HTMLElement): { lazyLoading: true; lazyLoadingOptions: { rootMargin: string } } | { lazyLoading: false } {
  return element.dataset.lazy === 'false'
    ? { lazyLoading: false }
    : { lazyLoading: true, lazyLoadingOptions: { rootMargin: lazyRootMargin } };
}

export function addDisplaySlot(host: SlotHost, element: HTMLElement): void {
  const format = formatsFrom(element);
  if (!format)
    return;

  host.addSlot({
    format,
    slot: element.dataset.slot,
    containingElement: element,
    // Third-party creatives stay in an iframe; inline is for the retailer's own house creatives.
    renderMode: element.dataset.renderMode === 'inline' ? 'inline' : 'iframe',
    ...lazyOptions(element),
    setup(_context, { onEmpty }) {
      onEmpty(() => {
        collapse(element);
      });
    },
  });
}

export function addNativeSlot(host: SlotHost, element: HTMLElement, label?: string): void {
  const format = formatsFrom(element);
  if (!format)
    return;

  host.addSlot({
    format,
    slot: element.dataset.slot,
    containingElement: element,
    renderMode: 'inline',
    ...lazyOptions(element),
    setup(_context, { onBeforeRender, onEmpty }) {
      onEmpty(() => {
        collapse(element);
      });
      onBeforeRender((ad) => {
        // HTML fallback: the creative is not a native payload, let the SDK render it.
        if (typeof ad.tag !== 'object')
          return ad;

        const data = parseNative(ad.tag);
        if (!data) {
          collapse(element);

          return null as unknown as AdheseAd;
        }

        return { ...ad, tag: renderNativeTile(data, ad.clickTag ? String(ad.clickTag) : undefined, label) };
      });
    },
  });
}

function initializeWidgets(tiles: ReadonlyArray<HTMLElement>): void {
  const { jQuery } = window as unknown as { jQuery?(element: HTMLElement): { trigger(event: string): void } };
  if (typeof jQuery !== 'function')
    return;

  for (const tile of tiles) {
    try {
      jQuery(tile).trigger('contentUpdated');
    }
    catch {
      // A widget that fails to initialise must not break the page.
    }
  }
}

export function addSponsoredSlot(
  host: SlotHost,
  element: HTMLElement,
  options: Partial<SponsoredConfig> = {},
  hydrate: typeof productsBySku = productsBySku,
  label?: string,
  fetchTiles: typeof nativeTilesByCatalogId = nativeTilesByCatalogId,
): void {
  const { format } = element.dataset;
  if (!format)
    return;

  const config = { ...defaultSponsored, ...options };
  const maxAds = Number(element.dataset.maxAds) || 4;
  const gridSelector = element.dataset.grid || config.gridSelector;

  host.plugins.stackSlots.addSlot({
    format,
    slot: element.dataset.slot,
    containingElement: element,
    maxAds,
    ...lazyOptions(element),
    setup(_context, { onBeforeRender, onEmpty }) {
      onEmpty(() => {
        collapse(element);
      });
      onBeforeRender(async (ad) => {
        const stack = Array.isArray(ad.tag) ? (ad.tag as ReadonlyArray<StackAd>) : [];
        const entries = stack.map(item => ({ item, id: catalogIdFromAd(item) })).filter((entry): entry is { item: StackAd; id: string } => Boolean(entry.id));
        const ids = entries.map(entry => entry.id);

        // Preferred: the storefront renders its own product item. Fall back to a basic tile from Magento's GraphQL.
        const rendered = config.tilesUrl ? await fetchTiles(ids, config.tilesUrl) : undefined;
        let products: ReadonlyArray<Product> = [];
        if (!rendered) {
          try {
            products = await hydrate(ids);
          }
          catch {
            products = [];
          }
        }

        // Keep the auction order, drop catalog IDs Commerce did not return (out of stock or not visible).
        const winners = entries.flatMap(({ item, id }) => {
          const html = rendered?.get(id);
          const native = html ? nativeTile(html, id, label) : undefined;
          if (native)
            return [{ item, tile: native, product: productFromTile(native, id) }];

          const product = products.find(candidate => candidate.sku === id);

          return product ? [{ item, tile: tileFromHtml(renderProductTile(product, label)), product }] : [];
        });

        const grid = element.dataset.layout === 'carousel' ? element : document.querySelector(gridSelector);
        if (winners.length === 0 || !grid) {
          collapse(element);

          return null as unknown as AdheseAd;
        }

        const tiles = winners.map(({ item, tile }) => {
          trackClicks(tile, item.native.link?.url);

          return tile;
        });

        injectTiles(grid, tiles, element.dataset.layout === 'carousel' ? [] : config.positions);
        // Let Magento initialise the widgets of the storefront rendered tiles (swatches, add to cart, wishlist).
        initializeWidgets(tiles);
        if (config.hideOrganic)
          hideOrganicDuplicates(grid, winners.flatMap(({ product }) => (product ? [product] : [])));
        element.classList.add('adhese-slot--filled');

        // We rendered; the SDK keeps tracking.
        return null as unknown as AdheseAd;
      });
    },
  });
}

export function registerSlots(host: SlotHost, root: ParentNode, sponsored?: Partial<SponsoredConfig>, label?: string): number {
  let count = 0;

  for (const element of Array.from(root.querySelectorAll<HTMLElement>(slotSelector))) {
    if (element.dataset.adheseRegistered)
      continue;
    element.dataset.adheseRegistered = 'true';
    count++;

    const type = element.dataset.adheseType as SlotType;
    if (type === 'native')
      addNativeSlot(host, element, label);
    else if (type === 'sponsored')
      addSponsoredSlot(host, element, sponsored, undefined, label);
    else
      addDisplaySlot(host, element);
  }

  return count;
}
