# @adhese/sdk-commerce

The Commerce wrapper for Adobe Commerce storefronts, Shopify and AEM sites. It ships four standalone browser bundles, built from the same
shared config, context and consent code:

| Bundle | Mode | What it does | Size |
| --- | --- | --- | --- |
| `dist/insights.min.js` | Insights (free tier) | One counted request per page view, per add to cart and per checkout start, for the never-booked `pixel` format on the fixed `ac_insights` location. Optionally identified with a customer identity (`mi`). Nothing is rendered; no cookies, page URL or referrer. No dependencies. | about 3.3 KB gzipped (4 KB budget, CI-checked) |
| `dist/aem.min.js` | Insights for AEM sites | The insights page view for a content site. The page type and category (the page's tags) come from the Adobe Client Data Layer, the identity `mi` from the Web SDK's ECID. No storefront event detectors. No dependencies. | about 2.3 KB gzipped (4 KB budget, CI-checked) |
| `dist/aem-ads.min.js` | Ads for AEM sites | `@adhese/sdk` with the stack-slots plugin and the display and native slots, targets from the Adobe Client Data Layer, ECID as `mi`. No sponsored products. | about 32 KB gzipped (60 KB ceiling) |
| `dist/ads.min.js` | Ads | `@adhese/sdk` with the stack-slots and SafeFrame plugins, a context plugin, and renderers for display, native and sponsored products. | about 33 KB gzipped (60 KB ceiling) |

The Composer module `adhese/module-retail-media` prints the page config the bundles read and loads the right one.

## Page config

```html
<script type="application/json" id="adhese-commerce-config">
{"mode":"ads","account":"demo","location":"ac_home","pageType":"product","category":["Men","Tops"],"sku":"MH01"}
</script>
<script async src=".../ads.min.js"></script>
```

| Field | Mode | Meaning |
| --- | --- | --- |
| `mode` | both | `insights`, `ads` or `off` |
| `account` | both | Adhese account; requests go to `https://ads-<account>.adhese.com` (override with `host`) |
| `pageType` | both | `home`, `category`, `search`, `product`, `cart`, `cms`; sent as the page-type target |
| `category`, `searchTerm`, `sku` | both | Targets, only for the page types where they apply (see the targets table) |
| `location` | ads | Adhese location for this page type (chosen by the module from its settings) |
| `expectContext` | both | Wait up to 1 s for the customer-data bridge (identity, and in ads mode cart and group) before the first request |
| `identity` | insights | Customer identity for `mi`: a 64-character hex hash (SHA-256/HMAC) or a numeric customer ID, for a platform that prints it into the page for that customer only. Anything else is ignored. On Adobe Commerce it arrives through the bridge instead |
| `events` | insights | Send add to cart and checkout start events (default `true`) |
| `platform` | insights | Which detectors count the events: `adobe-commerce` (default), `shopify` or `custom` (none, call `track()` yourself). `shopify` also skips the theme editor |
| `sponsored` | ads | `{ positions: number[], hideOrganic: boolean, gridSelector: string, tilesUrl?: string }` |
| `safeFrame`, `debug` | ads | Use the SafeFrame plugin / SDK debug mode |
| `assumeConsent` | both | Testing only: treat consent as granted without a consent platform |
| `targetCodes` | both | Override the 2-letter target codes (below) |

## Targets

All targets travel as 2-letter SDK parameters. `mi` and `ev` are agreed with Adhese; the others are **placeholders** until the
codes exist in the tenant (open item in the plan). Override them with `targetCodes` in the config.

| Signal | Default code | Source | Sent |
| --- | --- | --- | --- |
| Page type | `pt` | config | always |
| Category path | `ct` | config | category and product pages |
| Search term | `kw` | config | search pages |
| SKU | `sk` | config | product pages |
| Cart SKUs | `cs` | customer-data bridge | ads mode |
| Customer group | `cg` | customer-data bridge | ads mode |
| Event | `ev` | the tag | insights events: `add_to_cart`, `begin_checkout` |
| Customer identity | `mi` | config `identity`, or the customer-data bridge (hashed email) | insights and ads mode, **only with consent** and only if enabled |
| Device | `dt`, `br` | media queries | automatic |
| Consent | `xt` (TCF) or `tl` | CMP | automatic |

The SDK lowercases target values and replaces anything but letters, digits and `_` with `_` (so SKU `MH01-X` is sent as
`mh01_x`). The catalogue feed needs the same normalisation to match.

## Insights events

With `events` on (default), the Insights tag sends the same counted request as the page view with an **`ev` target**
naming the event, so no new format is needed in the tenant:

| Event | `ev` | When | Example |
| --- | --- | --- | --- |
| Add to cart | `add_to_cart` | A product was added and the shop confirmed it | `…/slac_insights-pixel/ptproduct/evadd_to_cart/skred_shoe/dtdesktop/brdesktop/tlall` |
| Checkout started | `begin_checkout` | The shopper clicked a checkout button or link | `…/slac_insights-pixel/ptcart/evbegin_checkout/dtdesktop/brdesktop/tlall` |

Targets: `pt` page type, `sk` the SKU (catalog ID) of the added product (left out when the shop does not say), device
`dt`/`br`, the consent parameter, and `mi` when identity is available and allowed. Nothing is sent without the consent
the page view needs. **Quantity and price are not sent**, and changing a quantity in the cart is not counted. A purchase
is not tracked: checkout pages do not carry the tag (on Shopify they cannot run theme code at all).
One request per added product (a cart add with several line items sends one per SKU, at most 5), invalid SKUs are dropped,
and a checkout start is counted once per 1.5 seconds (a click and its form submit are one event).

What each platform detector counts:

| `platform` | Add to cart | Checkout start |
| --- | --- | --- |
| `adobe-commerce` | The catalog-add-to-cart widget's jQuery event `ajax:addToCart` (Luma, carries the SKU from `data-product-sku`); `fetch` to `checkout/cart/add` (Hyvä, custom themes; SKU from the form the shopper used, else the product page's); the GraphQL `add…ProductsToCart` mutations (SKUs from the variables, not when the response has errors or `user_errors`); a plain form post to `checkout/cart/add` | The cart page and mini cart "Proceed to Checkout" buttons (`[data-role=proceed-to-checkout]`, `#top-cart-btn-checkout`) and any link to `/checkout` |
| `shopify` | `fetch` or `XMLHttpRequest` on `/cart/add(.js)` with a successful response (SKUs from the response); a plain form post | `name="checkout"` buttons, links to `/checkout`, "Buy it now" / accelerated checkout buttons |
| `custom` | `window.adheseCommerce.track('add_to_cart', sku)` | `window.adheseCommerce.track('begin_checkout')` |

A failed add (sold out) is not counted. Magento answers an Ajax add with an empty object on success, `product.statusText`
when the product is out of stock, and `backUrl` both for a redirect to the cart (success) and for an error that sends the
shopper back, so only a `backUrl` that points at the cart counts.

`window.adheseCommerce.track(event, sku?)` is available on every platform (the SKU can be a string or a list).

## Customer identity

Insights is **anonymous** unless an identity is available: with `identity` in the config (platforms that print it for the
logged-in customer) or from the customer-data bridge (Adobe Commerce: a SHA-256 hash of the email, opt-in in the module).
It is added as the last target (`mi`) of the page view and of every event, and in Ads mode to every ad request (display,
native and sponsored; the SDK request carries it as `mi` like the other targets). The same rules apply to both bundles. It must look like a SHA-256/HMAC hex hash or a
numeric ID; anything else (an email address, say) is dropped.

Consent: the identity goes along whenever the request itself is allowed. A storefront whose consent banner asks for
identity separately (Shopify: analytics vs marketing) sets `window.adheseIdentityConsent = false` when only measurement was
agreed, and the page view, events and ad requests are then anonymous. With `expectContext` the tag waits up to 1 s for the
bridge on a cached page and sends anonymously when the shopper is logged out or the bridge is late.

Ads mode in particular: the identity must look like a hash or numeric ID (anything else is dropped), is only sent when the
SDK's consent is not `none` and the storefront does not withhold it, comes from `config.identity` or the bridge (the bridge
wins), and is removed from the next request when the shopper logs out.

## Consent

- Insights: TCF v2 (`__tcfapi`, sent as `xt`), otherwise `window.adheseConsent === true` (sent as `tl=all`). No signal means no request.
- Ads: the SDK detects TCF v2 itself and reloads slots when consent changes. For a CMP without TCF, set `window.adheseConsent = true`.
  Identity (`mi`) is dropped from every request while consent is `none`.

## Slots (ads mode)

Slots are empty, cacheable placeholders. The module's `Block\Slot` and widget print them; you can write them by hand:

```html
<div class="adhese-slot" data-adhese-type="display" data-format="billboard" data-slot="_top" style="min-height:250px"></div>
```

| Attribute | Applies to | Meaning |
| --- | --- | --- |
| `data-adhese-type` | all | `display`, `native` or `sponsored` |
| `data-format` / `data-formats` | all | Format code, or JSON `[{"format","query"}]` for device-specific formats |
| `data-slot` | all | Slot code, to tell slots with the same format apart |
| `data-render-mode` | display | `iframe` (default, for third-party creatives) or `inline` (retailer-owned creatives only) |
| `data-lazy` | all | `false` to request immediately; default is lazy loading with a 200 px margin |
| `data-max-ads` | sponsored | Number of ads in the stack (default 4) |
| `data-grid` | sponsored | CSS selector of the product grid to fill (defaults to `sponsored.gridSelector`) |
| `data-layout` | sponsored | `carousel` puts the tiles inside the slot instead of into a grid |

**Display.** `iframe` render mode, lazy loading, and the container collapses (`hidden`) on no-fill so the page does not
keep an empty gap. Reserve height with `min-height`; it is released when the slot fills or collapses.

**Native.** The ad's `tag` is a JSON payload, schema version `1`:

```json
{ "ver": "1", "title": "Summer sale", "url": "https://shop.example/sale", "body": "Up to 50%", "image": "https://cdn.example/a.jpg", "cta": "Shop now", "advertiser": "Acme" }
```

`ver`, `title` and `url` are required. Text is escaped and length-limited, URLs must be `https` (a non-https image is
dropped, a non-https landing URL invalidates the ad), unknown fields are dropped. An invalid payload is treated as empty
and the slot collapses. A non-JSON creative (HTML) is left to the SDK. The link uses the ad's click tracker.

**Sponsored products.** A stack slot (`@adhese/sdk-stack-slots`). Adhese returns a **catalog ID** per ad (the Commerce SKU)
and nothing else; the storefront renders the product:

1. The catalog ID of each ad is read from its native assets (`{ catalogId }`, `{ catalog_id }`, `{ sku }`,
   `{ id: 'catalogId', data: { value } }` or `{ data: { type: 'catalogId', value } }`), falling back to the `catalogId`,
   `catalog_id` or `sku` query parameter of the landing URL.
   *The exact asset shape is an assumption until the catalogue source is final.*
2. **Native rendering (default with the Magento module).** One GET to the module endpoint (`sponsored.tilesUrl`,
   `adhese/sponsored/tiles?ids=…`) returns each product rendered with the theme's own product list item, so a sponsored tile
   has the same markup, price rendering (customer group, special and tier prices), swatches and add to cart as every other
   tile. Out-of-stock, disabled and invisible products are not returned and are dropped. After injection the tiles are passed
   to Magento's `contentUpdated` event so its widgets initialise.
3. **Fallback.** Without `tilesUrl`, or when the endpoint fails, one GraphQL call (`products(filter: {sku: {in: [...]}})`)
   fetches name, URL, image, price and stock and builds a basic tile (theme item classes). An endpoint that answers but
   returns no products is final: the slot collapses.
4. Tiles get a "Sponsored" label and `rel="sponsored"` links, and are inserted into the grid at the configured 1-based
   positions, in auction order. Click trackers fire before the shopper navigates to the normal product URL.
5. If a sponsored product also appears organically, the organic copy is hidden (`hideOrganic`, default on), matched by product URL path.
6. With no winner left or no grid found, the slot collapses.

## Customer-data bridge

`window.adheseCommerce.update({ mi, cartSkus, customerGroup })` is called by the module's `bridge.js` with the private
shopper context. These values are never printed into HTML. The Insights tag only uses `mi`. `window.adheseCommerce.instance` is the SDK instance, for QA.

## Development

```bash
npm run test -w @adhese/sdk-commerce    # Vitest (112 tests)
npm run build -w @adhese/sdk-commerce   # both bundles + types
npm run size -w @adhese/sdk-commerce    # size budgets, and no Node globals in the bundles
```

After a build, copy `dist/insights.min.js` and `dist/ads.min.js` to the module's `view/frontend/web/js/`.

Open items: the 2-letter target codes, the native schema field list per format, and moving `shared/request.ts` into
`@adhese/sdk-shared` so the beacon and the SDK share one URL builder.

## AEM sites

`dist/aem.min.js` is the insights tag for an AEM site that has the Adobe Client Data Layer (Core Components) and, for the
identity, the Experience Platform Web SDK. Print the same config element as for Commerce, with only what the data layer
cannot tell:

```html
<script type="application/json" id="adhese-commerce-config">
{"account":"demo","pageTypes":{"article-page":"article","landing-page":"landing"}}
</script>
<script async src=".../aem.min.js"></script>
```

| Field | Meaning |
| --- | --- |
| `mode` | `off` switches the tag off; anything else is insights |
| `pageType` | Fixed page type for this page. Without it, the page type comes from the template name (the last segment of `xdm:template`) through `pageTypes`, and is `other` for an unknown template. Content types: `article`, `landing`, `other` |
| `pageTypes` | Template name to page type, for example `{"article-page":"article"}` |
| `category` | Overrides the page's tags (`xdm:tags`, at most 10) that are sent as the category target |
| `dataLayerName` | Name of the data layer object when it is not `adobeDataLayer` |
| `alloyName` | Name of the Web SDK instance when it is not `alloy` (otherwise the first entry of `window.__alloyNS`) |
| `identity`, `expectContext`, `assumeConsent`, `account`, `host`, `targetCodes` | As above |

The Core Components data layer is **off by default**: enable it in the site's `DataLayerConfig`, otherwise the page type is
`other` and no category is sent.

**Identity.** After consent is granted the tag calls `alloy("getIdentity", { namespaces: ["ECID"] })` and sends the ECID as
`mi`, so it matches the audiences exported by the Adhese destination in Adobe Experience Platform. The Web SDK is not
asked before consent. An ECID is a numeric ID of up to 38 digits, which is now accepted as an identity by both bundles. A tag
rule that already has the identity can call `window.adheseCommerce.update({ mi })` instead (use `expectContext` to wait for it).

### Ads on AEM

`dist/aem-ads.min.js` uses the same config element with `"mode":"ads"` and a location. Authors place slots with a component
that prints plain markup; the tag finds them on load:

```html
<script type="application/json" id="adhese-commerce-config">
{"mode":"ads","account":"demo","locations":{"article":"site_article","landing":"site_landing"},"expectContext":true,"safeFrame":true}
</script>
<div class="adhese-slot" data-adhese-type="display" data-format="billboard"></div>
<div class="adhese-slot" data-adhese-type="native" data-format="native_tile"></div>
<script async src=".../aem-ads.min.js"></script>
```

- **Location:** `location`, or `locations[pageType]`. Without one no ads are requested.
- **Slots:** `display` and `native` as in Commerce (`data-format` or `data-formats`, `data-slot`, `data-render-mode`, `data-lazy`).
  `sponsored` slots are ignored on AEM.
- **Identity:** the ECID is read from the Web SDK after consent and added to every request as `mi` once it arrives. With
  `expectContext` the first request waits up to 1 s for it (or for `window.adheseCommerce.update({ mi })`). If consent is granted
  later on the same page, the ECID is used from the next page.
- **Author mode:** nothing runs in the Sites editor (`/editor.html/...`) or with `wcmmode=edit`. Other author modes are not detected.
- **Mode:** Insights need `"mode":"insights"` (the default) and the ads tag needs `"mode":"ads"`, so each
  tag only runs for its own mode when both are loaded.
