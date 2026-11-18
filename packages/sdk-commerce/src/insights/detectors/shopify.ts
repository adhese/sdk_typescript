import { isSku, maxSkusPerEvent } from '../events';
import { closest, type Detector, listen, pathOf, watchFetch } from './common';

const addPath = /\/cart\/add(?:\.js)?$/;
const checkoutPath = /\/checkout\/?$/;

/**
 * SKUs in the response of `/cart/add.js`: one line item, or `{ items: [...] }`.
 */
export function skusFromCartAdd(data: unknown): Array<string> {
  const skus: Array<string> = [];
  const add = (item: unknown): void => {
    const sku = (item as { sku?: unknown } | null)?.sku;
    if (isSku(sku) && !skus.includes(sku))
      skus.push(sku);
  };

  if (typeof data === 'object' && data !== null) {
    add(data);
    const { items } = data as { items?: unknown };
    for (const item of Array.isArray(items) ? items : [])
      add(item);
  }

  return skus.slice(0, maxSkusPerEvent);
}

type CartXhr = XMLHttpRequest & { adheseCartAdd?: boolean };

/**
 * Shopify themes: add to cart through `fetch` or `XMLHttpRequest` on `/cart/add(.js)` (counted when the response is
 * successful) or a plain form post, and checkout start through `name="checkout"` buttons, links to `/checkout` and the
 * "Buy it now" / accelerated checkout buttons. Shopify's checkout pages do not run theme code, so a purchase is not seen.
 */
export const installShopify: Detector = (config, insights, win) => {
  const undo: Array<() => void> = [];
  const pageSku = config.pageType === 'product' ? config.sku : undefined;

  undo.push(watchFetch(win, (url, _init, response) => {
    if (!addPath.test(pathOf(url, win)))
      return;
    response.clone().json().then(
      (data: unknown) => {
        insights.track('add_to_cart', skusFromCartAdd(data));
      },
      () => {
        insights.track('add_to_cart');
      },
    );
  }));

  const xhr = (win as unknown as typeof globalThis).XMLHttpRequest?.prototype;
  if (xhr) {
    const { open, send } = xhr;
    xhr.open = function (this: CartXhr, method: string, url: string | URL, ...rest: Array<unknown>): void {
      this.adheseCartAdd = addPath.test(pathOf(String(url), win));

      ;(open as (...args: Array<unknown>) => void).call(this, method, url, ...rest);
    } as typeof xhr.open;
    xhr.send = function (this: CartXhr, body?: Document | XMLHttpRequestBodyInit | null): void {
      if (this.adheseCartAdd) {
        this.addEventListener('load', () => {
          if (this.status < 200 || this.status >= 300)
            return;
          let data: unknown = null;
          try {
            data = JSON.parse(this.responseText);
          }
          catch {
            // Not JSON: counted without a SKU.
          }
          insights.track('add_to_cart', skusFromCartAdd(data));
        });
      }

      send.call(this, body);
    };
    undo.push(() => {
      xhr.open = open;
      xhr.send = send;
    });
  }

  undo.push(listen(win, 'submit', (event) => {
    const form = event.target as HTMLFormElement | null;
    if (!form || typeof form.getAttribute !== 'function')
      return;
    // A theme that handles the form with fetch calls preventDefault, and that request is counted above instead.
    if (!event.defaultPrevented && addPath.test(pathOf(form.getAttribute('action'), win)))
      insights.track('add_to_cart', pageSku);
    if ((event.submitter as HTMLButtonElement | null)?.name === 'checkout')
      insights.track('begin_checkout');
  }));

  undo.push(listen(win, 'click', (event) => {
    const element = closest(event, 'button, input, a') as (HTMLButtonElement & HTMLInputElement) | null;
    if (!element || element.disabled)
      return;
    const isCheckout = ((element.tagName === 'BUTTON' || element.tagName === 'INPUT') && element.name === 'checkout')
      || (element.tagName === 'A' && checkoutPath.test(pathOf(element.getAttribute('href'), win)))
      || element.closest('.shopify-payment-button') !== null;
    if (isCheckout)
      insights.track('begin_checkout');
  }, true));

  return () => {
    for (const fn of undo)
      fn();
  };
};
