/* eslint-disable ts/naming-convention, style/max-statements-per-line */
import { describe, expect, it, vi } from 'vitest';
import { configElementId } from '../shared/config';

const config = { mode: 'insights', account: 'demo', pageType: 'product', sku: 'S1' };

async function run(overrides: Record<string, unknown> = {}, consent = true): Promise<ReturnType<typeof vi.fn>> {
  vi.resetModules();
  document.body.innerHTML = `<script type="application/json" id="${configElementId}">${JSON.stringify({ ...config, ...overrides })}</script>`;
  (window as unknown as { adheseConsent: boolean }).adheseConsent = consent;
  window.matchMedia = ((q: string) => ({ matches: q.includes('1024') })) as typeof window.matchMedia;
  vi.stubGlobal('requestIdleCallback', (cb: () => void) => {
    cb();
  });
  const fetchMock = vi.fn().mockResolvedValue(new Response('[]'));
  vi.stubGlobal('fetch', fetchMock);
  await import('./index');
  await new Promise((resolve) => {
    setTimeout(resolve, 10);
  });
  return fetchMock;
}

describe('insights tag', () => {
  it('sends exactly one request with targets', async () => {
    const fetchMock = await run();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://ads-demo.adhese.com/json/slac_insights-pixel/ptproduct/sks1/dttablet/brtablet/tlall');
    expect(fetchMock.mock.calls[0][1]).toEqual({ keepalive: true, credentials: 'omit' });
  });

  it('sends nothing without consent', async () => {
    expect(await run({}, false)).not.toHaveBeenCalled();
  });

  it('sends without a CMP when assumeConsent is set', async () => {
    expect(await run({ assumeConsent: true }, false)).toHaveBeenCalledTimes(1);
  });

  it('sends nothing when mode is off', async () => {
    expect(await run({ mode: 'off' })).not.toHaveBeenCalled();
  });
});

describe('identity', () => {
  const hash = 'b'.repeat(64);

  it('adds a valid identity from the config to the page view, and ignores anything else', async () => {
    const identified = await run({ identity: hash });
    expect(String(identified.mock.calls[0][0])).toMatch(new RegExp(`/tlall/mi${hash}$`));

    expect(String((await run({ identity: '42' })).mock.calls[0][0])).toMatch(/\/tlall\/mi42$/);
    expect(String((await run({ identity: 'a@b.com' })).mock.calls[0][0])).not.toContain('/mi');
  });

  it('is withheld when the storefront only has consent for measurement', async () => {
    (window as unknown as { adheseIdentityConsent?: boolean }).adheseIdentityConsent = false;
    const fetchMock = await run({ identity: hash });
    (window as unknown as { adheseIdentityConsent?: boolean }).adheseIdentityConsent = undefined;

    expect(String(fetchMock.mock.calls[0][0])).not.toContain('/mi');
  });

  it('waits for the customer-data bridge when the page is cached', async () => {
    vi.resetModules();
    document.body.innerHTML = `<script type="application/json" id="${configElementId}">${JSON.stringify({ ...config, expectContext: true })}</script>`;
    (window as unknown as { adheseConsent: boolean }).adheseConsent = true;
    window.matchMedia = ((q: string) => ({ matches: q.includes('1024') })) as typeof window.matchMedia;
    vi.stubGlobal('requestIdleCallback', (cb: () => void) => {
      cb();
    });
    const fetchMock = vi.fn().mockResolvedValue(new Response('[]'));
    vi.stubGlobal('fetch', fetchMock);
    await import('./index');
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });
    expect(fetchMock).not.toHaveBeenCalled();

    (window as unknown as { adheseCommerce: { update(context: unknown): void } }).adheseCommerce.update({ mi: hash, cartSkus: ['A'] });
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toMatch(new RegExp(`/mi${hash}$`));
  });

  it('is sent anonymously when the bridge reports a logged out shopper', async () => {
    vi.resetModules();
    document.body.innerHTML = `<script type="application/json" id="${configElementId}">${JSON.stringify({ ...config, expectContext: true })}</script>`;
    (window as unknown as { adheseConsent: boolean }).adheseConsent = true;
    window.matchMedia = ((q: string) => ({ matches: q.includes('1024') })) as typeof window.matchMedia;
    vi.stubGlobal('requestIdleCallback', (cb: () => void) => {
      cb();
    });
    const fetchMock = vi.fn().mockResolvedValue(new Response('[]'));
    vi.stubGlobal('fetch', fetchMock);
    await import('./index');
    (window as unknown as { adheseCommerce: { update(context: unknown): void } }).adheseCommerce.update({ mi: undefined, cartSkus: [] });
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).not.toContain('/mi');
  });
});

describe('events', () => {
  const tick = async (): Promise<void> => new Promise((resolve) => {
    setTimeout(resolve, 20);
  });

  it('exposes track() for custom storefronts', async () => {
    const fetchMock = await run({ platform: 'custom' });
    (window as unknown as { adheseCommerce: { track(event: string, sku: string): void } }).adheseCommerce.track('add_to_cart', 'A1');
    await tick();

    expect(fetchMock.mock.calls.map(call => String(call[0]))).toEqual([
      'https://ads-demo.adhese.com/json/slac_insights-pixel/ptproduct/sks1/dttablet/brtablet/tlall',
      'https://ads-demo.adhese.com/json/slac_insights-pixel/ptproduct/evadd_to_cart/ska1/dttablet/brtablet/tlall',
    ]);
  });

  it('counts a checkout click on Adobe Commerce by default, but not when events are off', async () => {
    document.addEventListener('click', (event) => { event.preventDefault(); });
    const on = await run();
    document.body.insertAdjacentHTML('beforeend', '<button data-role="proceed-to-checkout" id="go-on"></button>');
    document.getElementById('go-on')?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await tick();
    expect(on.mock.calls.map(call => String(call[0])).at(-1)).toBe('https://ads-demo.adhese.com/json/slac_insights-pixel/ptproduct/evbegin_checkout/dttablet/brtablet/tlall');

    const off = await run({ events: false });
    document.body.insertAdjacentHTML('beforeend', '<button data-role="proceed-to-checkout" id="go-off"></button>');
    document.getElementById('go-off')?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await tick();
    expect(off).toHaveBeenCalledTimes(1);
  });

  it('does not count the theme editor of a Shopify store', async () => {
    (window as unknown as { Shopify: unknown }).Shopify = { designMode: true };
    const fetchMock = await run({ platform: 'shopify' });
    (window as unknown as { Shopify: unknown }).Shopify = undefined;

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
