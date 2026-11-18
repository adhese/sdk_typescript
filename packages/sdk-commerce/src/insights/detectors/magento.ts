import { closest, type Detector, listen, pathOf, watchFetch } from './common';

const addToCartPath = /\/checkout\/cart\/add(?:\/|$)/;
const cartPath = /\/checkout\/cart\/?$/;
const checkoutPath = /\/checkout\/?$/;
const checkoutButtons = '[data-role="proceed-to-checkout"], #top-cart-btn-checkout';
const addMutation = /\badd(?:Simple|Configurable|Virtual|Bundle|Downloadable)?ProductsToCart\b/;

type AddResponse = { backUrl?: unknown; product?: { statusText?: unknown } } | null | undefined;
type Jquery = (target: Document) => { on(name: string, handler: (jqueryEvent: unknown, data?: { sku?: unknown; response?: AddResponse }) => void): unknown; off?(name: string, handler: unknown): unknown };
type MagentoWindow = Window & { jQuery?: Jquery; require?(dependencies: Array<string>, callback: (jquery: Jquery) => void): void };

/**
 * Did the add to cart succeed? Magento answers an Ajax add with `{}` and no further hint on success, `product.statusText`
 * when the product is out of stock, and a `backUrl` for both a redirect to the cart after a successful add (the shop's
 * "redirect to cart" setting) and for an error that sends the shopper back (the product page). Only the first of those
 * redirects counts.
 */
export function isAdded(response: AddResponse, win: Window = window): boolean {
  if (response?.product?.statusText)
    return false;

  return typeof response?.backUrl === 'string' ? cartPath.test(pathOf(response.backUrl, win)) : true;
}

/**
 * SKUs a GraphQL add-to-cart mutation was asked for (`variables.cartItems[].sku`, or `.data.sku`).
 */
export function skusFromMutation(body: unknown): { skus: Array<string>; mutation: boolean } {
  try {
    const { query, variables } = JSON.parse(String(body)) as { query?: unknown; variables?: { cartItems?: ReadonlyArray<{ sku?: unknown; data?: { sku?: unknown } }> } };
    if (typeof query !== 'string' || !addMutation.test(query))
      return { skus: [], mutation: false };

    return {
      mutation: true,
      skus: (variables?.cartItems ?? []).flatMap(item => [item.sku ?? item.data?.sku]).filter((sku): sku is string => typeof sku === 'string'),
    };
  }
  catch {
    return { skus: [], mutation: false };
  }
}

/**
 * Adobe Commerce, Luma and Hyvä:
 * - add to cart through the catalog-add-to-cart widget (jQuery event `ajax:addToCart`, which carries the SKU), through
 *   `fetch` to `checkout/cart/add` (Hyvä and custom themes), through the GraphQL add-to-cart mutations (headless), or a
 *   plain form post to `checkout/cart/add`;
 * - checkout start: the cart page's and the mini cart's "Proceed to Checkout" buttons, or any link to `/checkout`.
 * Checkout pages themselves do not carry the tag, so a placed order is not seen.
 */
export const installMagento: Detector = (config, insights, win) => {
  const doc = win.document;
  const pageSku = config.pageType === 'product' ? config.sku : undefined;
  const formSku = (form: Element | null | undefined): string | undefined => (form as HTMLElement | null | undefined)?.dataset.productSku;
  const undo: Array<() => void> = [];

  const onAjaxAdd = (_event: unknown, data?: { sku?: unknown; response?: AddResponse }): void => {
    if (isAdded(data?.response, win))
      insights.track('add_to_cart', typeof data?.sku === 'string' ? data.sku : undefined);
  };
  const bind = (jquery: Jquery): void => {
    jquery(doc).on('ajax:addToCart', onAjaxAdd);
    undo.push(() => jquery(doc).off?.('ajax:addToCart', onAjaxAdd));
  };
  const { require: amd, jQuery } = win as MagentoWindow;
  try {
    // The tag is async: jQuery may not be loaded yet, so ask the module loader when there is one.
    if (typeof amd === 'function')
      amd(['jquery'], bind);
    else if (typeof jQuery === 'function')
      bind(jQuery);
  }
  catch {
    // No jQuery on this storefront.
  }

  undo.push(watchFetch(win, (url, init, response) => {
    const path = pathOf(url, win);

    if (addToCartPath.test(path)) {
      response.clone().json().then(
        (data: AddResponse) => {
          if (isAdded(data, win))
            insights.track('add_to_cart', formSku((doc.activeElement as Element | null)?.closest('form')) ?? pageSku);
        },
        () => {},
      );
    }
    else if (path.endsWith('/graphql') && typeof init?.body === 'string') {
      const { skus, mutation } = skusFromMutation(init.body);
      if (!mutation)
        return;
      response.clone().json().then(
        // eslint-disable-next-line ts/naming-convention
        (data: { errors?: unknown; data?: Record<string, { user_errors?: ReadonlyArray<unknown> } | undefined> | null }) => {
          const [result] = Object.values(data.data ?? {});
          if (!data.errors && (result?.user_errors?.length ?? 0) === 0)
            insights.track('add_to_cart', skus);
        },
        () => {},
      );
    }
  }));

  undo.push(listen(win, 'submit', (event) => {
    const form = event.target as HTMLFormElement | null;
    // A plain add to cart form. The widget's Ajax add calls preventDefault and is counted through its event instead.
    if (!event.defaultPrevented && form && typeof form.getAttribute === 'function' && addToCartPath.test(pathOf(form.getAttribute('action'), win)))
      insights.track('add_to_cart', formSku(form) ?? pageSku);
  }));

  undo.push(listen(win, 'click', (event) => {
    const element = closest(event, `${checkoutButtons}, a[href]`);
    if (!element || (element as HTMLButtonElement).disabled || element.getAttribute('aria-disabled') === 'true')
      return;
    if (element.matches(checkoutButtons) || (element.tagName === 'A' && checkoutPath.test(pathOf(element.getAttribute('href'), win))))
      insights.track('begin_checkout');
  }, true));

  return () => {
    for (const fn of undo)
      fn();
  };
};
