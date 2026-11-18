/* eslint-disable ts/naming-convention, ts/explicit-member-accessibility, ts/no-unused-vars, style/max-statements-per-line */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installShopify, skusFromCartAdd } from './shopify';

const insights = { track: vi.fn(), pageView: vi.fn() };
const config = { mode: 'insights', account: 'demo', pageType: 'product', sku: 'PAGE', platform: 'shopify' } as never;
const globals = window as unknown as { fetch: unknown; XMLHttpRequest: unknown };
async function flush(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 5);
  });
}

class FakeXhr {
  status = 200;
  responseText = '{"sku":"X1"}';
  listeners: Array<() => void> = [];
  open(_method: string, _url: string): void {}
  send(_body?: unknown): void {}
  addEventListener(_type: string, callback: () => void): void {
    this.listeners.push(callback);
  }
}

let undo: () => void = () => {};
let originalFetch: unknown;
let originalXhr: unknown;

beforeEach(() => {
  insights.track.mockClear();
  originalFetch = globals.fetch;
  originalXhr = globals.XMLHttpRequest;
  globals.XMLHttpRequest = FakeXhr;
  document.body.innerHTML = '';
  // jsdom does not implement navigation.
  document.addEventListener('click', (event) => { event.preventDefault(); });
});

afterEach(() => {
  undo();
  globals.fetch = originalFetch;
  globals.XMLHttpRequest = originalXhr;
});

function install(response: Response = new Response('{"sku":"A1"}')): void {
  globals.fetch = vi.fn().mockImplementation(async () => response.clone());
  undo = installShopify(config, insights as never, window);
}

describe('skusFromCartAdd', () => {
  it('reads one line item or a list, distinct and valid, at most five', () => {
    expect(skusFromCartAdd({ sku: 'A' })).toEqual(['A']);
    expect(skusFromCartAdd({ items: [{ sku: 'A' }, { sku: 'A' }, { sku: 'B C' }, { sku: '' }, { sku: 'B' }, null] })).toEqual(['A', 'B']);
    expect(skusFromCartAdd({ items: ['1', '2', '3', '4', '5', '6', '7'].map(sku => ({ sku })) })).toHaveLength(5);
    expect(skusFromCartAdd(null)).toEqual([]);
    expect(skusFromCartAdd('x')).toEqual([]);
  });
});

describe('add to cart', () => {
  it('counts a successful fetch of /cart/add.js with the SKUs of the response (any market prefix)', async () => {
    install(new Response('{"items":[{"sku":"A1"},{"sku":"B2"}]}'));
    await (window.fetch as typeof fetch)('/en-be/cart/add.js', { method: 'POST' });
    await flush();

    expect(insights.track).toHaveBeenCalledWith('add_to_cart', ['A1', 'B2']);
  });

  it('is still counted when the response is not JSON, but not when it failed', async () => {
    install(new Response('<html>'));
    await (window.fetch as typeof fetch)('/cart/add', { method: 'POST' });
    await flush();
    expect(insights.track).toHaveBeenCalledWith('add_to_cart');
    undo();
    insights.track.mockClear();

    install(new Response('{"status":422}', { status: 422 }));
    await (window.fetch as typeof fetch)('/cart/add.js', { method: 'POST' });
    await (window.fetch as typeof fetch)('/cart.js');
    await flush();
    expect(insights.track).not.toHaveBeenCalled();
  });

  it('counts a successful XMLHttpRequest on /cart/add.js', () => {
    install();
    const xhr = new (window as unknown as { XMLHttpRequest: new () => FakeXhr }).XMLHttpRequest();
    xhr.open('POST', '/cart/add.js');
    xhr.send();
    for (const listener of xhr.listeners)
      listener.call(xhr);

    expect(insights.track).toHaveBeenCalledWith('add_to_cart', ['X1']);

    const other = new (window as unknown as { XMLHttpRequest: new () => FakeXhr }).XMLHttpRequest();
    other.open('GET', '/cart.js');
    other.send();
    expect(other.listeners).toHaveLength(0);

    const failed = new (window as unknown as { XMLHttpRequest: new () => FakeXhr }).XMLHttpRequest();
    failed.status = 422;
    failed.open('POST', '/cart/add.js');
    failed.send();
    for (const listener of failed.listeners)
      listener.call(failed);
    expect(insights.track).toHaveBeenCalledTimes(1);
  });

  it('counts a plain form post with the product page SKU unless a script handled it', () => {
    install();
    document.body.innerHTML = '<form id="f" action="/cart/add"></form><form id="g" action="/cart/add"></form><form id="h" action="/search"></form>';
    document.getElementById('g')?.addEventListener('submit', (event) => { event.preventDefault(); });
    for (const id of ['f', 'g', 'h'])
      document.getElementById(id)?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(insights.track).toHaveBeenCalledTimes(1);
    expect(insights.track).toHaveBeenCalledWith('add_to_cart', 'PAGE');
  });

  it('restores fetch and XMLHttpRequest on undo', () => {
    const mock = vi.fn();
    globals.fetch = mock;
    const { open, send } = FakeXhr.prototype;
    undo = installShopify(config, insights as never, window);
    undo();

    expect(window.fetch).toBe(mock);
    expect(FakeXhr.prototype.open).toBe(open);
    expect(FakeXhr.prototype.send).toBe(send);
  });
});

describe('checkout start', () => {
  const click = (id: string): void => {
    document.getElementById(id)?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  };

  it('counts checkout buttons, links to /checkout and accelerated checkout buttons', () => {
    install();
    document.body.innerHTML = '<button name="checkout" id="a"></button><a href="/checkout" id="b">go</a><div class="shopify-payment-button"><button id="c"></button></div><a href="/collections/all" id="d">c</a><button name="update" id="e"></button><button name="checkout" id="f" disabled></button>';
    for (const id of ['a', 'b', 'c', 'd', 'e', 'f'])
      click(id);

    expect(insights.track.mock.calls).toEqual([['begin_checkout'], ['begin_checkout'], ['begin_checkout']]);
  });

  it('counts a form submitted with the checkout button', () => {
    install();
    document.body.innerHTML = '<form id="cart"><button name="checkout" id="a"></button></form>';
    const submitter = document.getElementById('a');
    const event = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'submitter', { value: submitter });
    document.getElementById('cart')?.dispatchEvent(event);

    expect(insights.track).toHaveBeenCalledWith('begin_checkout');
  });
});
