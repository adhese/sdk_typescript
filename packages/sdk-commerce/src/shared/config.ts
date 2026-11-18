export type PageType = 'home' | 'category' | 'search' | 'product' | 'cart' | 'cms';

export type TargetCodes = {
  pageType: string;
  category: string;
  searchTerm: string;
  sku: string;
  cartSkus: string;
  customerGroup: string;
  identity: string;
  /**
   * Insights events: `add_to_cart` or `begin_checkout`.
   */
  event: string;
};

export type SponsoredConfig = {
  /**
   * 1-based grid positions that sponsored tiles take.
   */
  positions: ReadonlyArray<number>;
  /**
   * Hide the organic copy of a sponsored SKU on the same page.
   */
  hideOrganic: boolean;
  /**
   * CSS selector of the product grid (the element holding the organic product items).
   */
  gridSelector: string;
  /**
   * Module endpoint that returns the storefront's own product markup per catalog ID. Without it tiles are built from GraphQL.
   */
  tilesUrl?: string;
};

export type CommerceConfig = {
  mode: 'off' | 'insights' | 'ads';
  account: string;
  /**
   * Overrides the default `https://ads-<account>.adhese.com` host.
   */
  host?: string;
  /**
   * Ads mode: Adhese location for the current page type, resolved by the module.
   */
  location?: string;
  pageType: PageType;
  /**
   * Insights: which storefront the add to cart and checkout detectors listen to. `custom` installs none; call
   * `window.adheseCommerce.track()` yourself.
   */
  platform?: 'adobe-commerce' | 'shopify' | 'custom';
  /**
   * Insights: send an event per add to cart and per checkout start (default true).
   */
  events?: boolean;
  /**
   * Customer identity for the `mi` target (insights and ads): a SHA-256 or HMAC hex hash, or a numeric customer ID.
   * Printed by the platform for that customer only. On Adobe Commerce it arrives through the customer-data bridge instead.
   */
  identity?: string;
  category?: ReadonlyArray<string> | string;
  searchTerm?: string;
  /**
   * Testing only: treat consent as granted without a consent platform.
   */
  assumeConsent?: boolean;
  /**
   * Ads mode: wait briefly for the customer-data bridge (identity, cart, customer group) before the first request.
   */
  expectContext?: boolean;
  /**
   * Ads mode: render third-party creatives in a SafeFrame instead of a plain iframe.
   */
  safeFrame?: boolean;
  debug?: boolean;
  sponsored?: Partial<SponsoredConfig>;
  sku?: string;
  /**
   * 2-letter target codes in the Adhese tenant. Placeholder defaults until the test tenant defines them.
   */
  targetCodes?: Partial<TargetCodes>;
};

export const configElementId = 'adhese-commerce-config';

const pageTypes: ReadonlyArray<string> = ['home', 'category', 'search', 'product', 'cart', 'cms'];

/**
 * Read and validate the JSON the module prints in `<script type="application/json" id="adhese-commerce-config">`.
 * Returns `null` when missing or invalid, so the tag silently does nothing.
 */
export function readConfig(doc: Document = document): CommerceConfig | null {
  try {
    const text = doc.getElementById(configElementId)?.textContent;
    if (!text)
      return null;

    return parseConfig(JSON.parse(text));
  }
  catch {
    return null;
  }
}

export function parseConfig(value: unknown): CommerceConfig | null {
  if (typeof value !== 'object' || value === null)
    return null;

  const config = value as Partial<CommerceConfig>;

  if (
    !['off', 'insights', 'ads'].includes(config.mode as string)
    || typeof config.account !== 'string'
    || config.account === ''
    || !pageTypes.includes(config.pageType as string)
  ) {
    return null;
  }

  return config as CommerceConfig;
}
