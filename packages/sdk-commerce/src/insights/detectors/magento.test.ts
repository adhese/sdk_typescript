/* eslint-disable ts/explicit-function-return-type, style/max-statements-per-line */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installMagento, isAdded, skusFromMutation } from './magento';

type Handler = (event: unknown, data?: unknown) => void;

const insights = { track: vi.fn(), pageView: vi.fn() };
const config = { mode: 'insights', account: 'demo', pageType: 'product', sku: 'PAGE' } as never;
const globals = window as unknown as { jQuery?: unknown; require?: unknown; fetch: unknown };
async function flush(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 5);
  });
}
let undo: () => void = () => {};
let original: unknown;

beforeEach(() => {
  insights.track.mockClear();
  original = globals.fetch;
  document.body.innerHTML = '';
});

afterEach(() => {
  undo();
  globals.fetch = original;
  globals.jQuery = undefined;
  globals.require = undefined;
});

function install(response: Response = new Response('{}'), cfg: unknown = config): void {
  globals.fetch = vi.fn().mockImplementation(async () => response.clone());
  undo = installMagento(cfg as never, insights as never, window);
}

describe('isAdded', () => {
  it('counts an empty answer and a redirect to the cart, not an out of stock or an error redirect', () => {
    expect(isAdded({})).toBe(true);
    expect(isAdded(null)).toBe(true);
    expect(isAdded({ backUrl: 'https://shop.test/checkout/cart/' })).toBe(true);
    expect(isAdded({ backUrl: 'https://shop.test/men/shoes.html' })).toBe(false);
    expect(isAdded({ product: { statusText: 'Out of stock' } })).toBe(false);
  });
});

describe('skusFromMutation', () => {
  it('reads the SKUs of the add to cart mutations', () => {
    const body = JSON.stringify({ query: 'mutation { addProductsToCart(cartId: "x", cartItems: $cartItems) { cart { id } } }', variables: { cartItems: [{ sku: 'A', quantity: 1 }, { data: { sku: 'B' } }, { quantity: 1 }] } });

    expect(skusFromMutation(body)).toEqual({ mutation: true, skus: ['A', 'B'] });
    expect(skusFromMutation(JSON.stringify({ query: 'mutation { addSimpleProductsToCart { cart { id } } }' }))).toEqual({ mutation: true, skus: [] });
  });

  it('ignores other queries and bodies that are not JSON', () => {
    expect(skusFromMutation(JSON.stringify({ query: '{ products { items { sku } } }' }))).toEqual({ skus: [], mutation: false });
    expect(skusFromMutation('nope')).toEqual({ skus: [], mutation: false });
    expect(skusFromMutation(undefined)).toEqual({ skus: [], mutation: false });
  });
});

describe('add to cart through the widget event', () => {
  function jquery() {
    const handlers: Record<string, Handler> = {};
    const jq = () => ({ on: (event: string, handler: Handler) => { handlers[event] = handler; }, off: (event: string) => { delete handlers[event]; } });

    return { jq, handlers };
  }

  it('counts the SKU of a successful add (jQuery global)', () => {
    const { jq, handlers } = jquery();
    globals.jQuery = jq;
    install();

    handlers['ajax:addToCart'](null, { sku: 'A', response: {} });
    expect(insights.track).toHaveBeenCalledWith('add_to_cart', 'A');
  });

  it('asks the module loader for jQuery when there is one, and skips failed adds', () => {
    const { jq, handlers } = jquery();
    globals.require = (deps: Array<string>, callback: (j: unknown) => void) => {
      expect(deps).toEqual(['jquery']);
      callback(jq);
    };
    install();

    handlers['ajax:addToCart'](null, { sku: 'A', response: { product: { statusText: 'Out of stock' } } });
    expect(insights.track).not.toHaveBeenCalled();
    handlers['ajax:addToCart'](null, { response: {} });
    expect(insights.track).toHaveBeenCalledWith('add_to_cart', undefined);
  });

  it('unbinds on undo', () => {
    const { jq, handlers } = jquery();
    globals.jQuery = jq;
    install();
    undo();

    expect(handlers['ajax:addToCart']).toBeUndefined();
  });
});

describe('add to cart through fetch', () => {
  it('counts a successful post to checkout/cart/add with the SKU of the form the shopper used', async () => {
    install();
    document.body.innerHTML = '<form data-product-sku="FORM-1"><button id="b">Add</button></form>';
    document.getElementById('b')?.focus();
    await (window.fetch as typeof fetch)('/checkout/cart/add/product/1/', { method: 'POST' });
    await flush();

    expect(insights.track).toHaveBeenCalledWith('add_to_cart', 'FORM-1');
  });

  it('falls back to the product page SKU', async () => {
    install();
    await (window.fetch as typeof fetch)('https://shop.test/en/checkout/cart/add/uenc/x/', { method: 'POST' });
    await flush();

    expect(insights.track).toHaveBeenCalledWith('add_to_cart', 'PAGE');
  });

  it('does not count failures, other requests or a page that is not a product page', async () => {
    install(new Response('{"product":{"statusText":"Out of stock"}}'));
    await (window.fetch as typeof fetch)('/checkout/cart/add/', { method: 'POST' });
    await (window.fetch as typeof fetch)('/catalog/product/view');
    undo();

    install(new Response('{}', { status: 500 }));
    await (window.fetch as typeof fetch)('/checkout/cart/add/', { method: 'POST' });
    undo();

    install(new Response('{}'), { mode: 'insights', account: 'demo', pageType: 'category' });
    await (window.fetch as typeof fetch)('/checkout/cart/add/', { method: 'POST' });
    await flush();

    expect(insights.track).toHaveBeenCalledTimes(1);
    expect(insights.track).toHaveBeenCalledWith('add_to_cart', undefined);
  });

  it('restores fetch on undo', () => {
    const mock = vi.fn();
    globals.fetch = mock;
    undo = installMagento(config, insights as never, window);
    expect(window.fetch).not.toBe(mock);
    undo();

    expect(window.fetch).toBe(mock);
  });
});

describe('add to cart through GraphQL', () => {
  const body = JSON.stringify({ query: 'mutation($cartItems:[CartItemInput!]!){ addProductsToCart(cartId:"x", cartItems:$cartItems){ cart { id } user_errors { code } } }', variables: { cartItems: [{ sku: 'G1', quantity: 1 }] } });

  it('counts a mutation without errors', async () => {
    install(new Response('{"data":{"addProductsToCart":{"cart":{"id":"x"},"user_errors":[]}}}'));
    await (window.fetch as typeof fetch)('/graphql', { method: 'POST', body });
    await flush();

    expect(insights.track).toHaveBeenCalledWith('add_to_cart', ['G1']);
  });

  it('does not count GraphQL errors, user errors or other queries', async () => {
    install(new Response('{"errors":[{"message":"x"}]}'));
    await (window.fetch as typeof fetch)('/graphql', { method: 'POST', body });
    undo();
    install(new Response('{"data":{"addProductsToCart":{"user_errors":[{"code":"OUT_OF_STOCK"}]}}}'));
    await (window.fetch as typeof fetch)('/graphql', { method: 'POST', body });
    undo();
    install();
    await (window.fetch as typeof fetch)('/graphql', { method: 'POST', body: JSON.stringify({ query: '{ products { items { sku } } }' }) });
    await flush();

    expect(insights.track).not.toHaveBeenCalled();
  });
});

describe('add to cart through a plain form post', () => {
  it('counts the form post unless a script handled it', () => {
    install();
    document.body.innerHTML = '<form id="f" action="/checkout/cart/add/uenc/x/product/3/" data-product-sku="F1"></form><form id="g" action="/checkout/cart/add/product/4/"></form><form id="h" action="/search"></form>';
    // A script that handles the form calls preventDefault on the form itself, before the document listener runs.
    document.getElementById('g')?.addEventListener('submit', (event) => { event.preventDefault(); });

    for (const id of ['f', 'g', 'h'])
      document.getElementById(id)?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(insights.track).toHaveBeenCalledTimes(1);
    expect(insights.track).toHaveBeenCalledWith('add_to_cart', 'F1');
  });
});

describe('checkout start', () => {
  it('counts the cart page and mini cart buttons and links to /checkout', () => {
    install();
    document.body.innerHTML = '<button data-role="proceed-to-checkout" id="a"><span id="in">Proceed</span></button><button id="top-cart-btn-checkout"></button><a id="l" href="/en/checkout/">x</a><a id="cart" href="/checkout/cart/">cart</a><a id="other" href="/men.html">m</a><button id="off" data-role="proceed-to-checkout" disabled></button>';
    // jsdom does not implement navigation.
    document.addEventListener('click', (event) => { event.preventDefault(); });
    for (const id of ['in', 'top-cart-btn-checkout', 'l', 'cart', 'other', 'off'])
      document.getElementById(id)?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(insights.track.mock.calls).toEqual([['begin_checkout'], ['begin_checkout'], ['begin_checkout']]);
  });
});
