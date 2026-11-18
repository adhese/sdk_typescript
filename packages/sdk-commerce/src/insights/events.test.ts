/* eslint-disable ts/explicit-function-return-type, prefer-named-capture-group */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createInsights } from './events';

const base = 'https://ads-demo.adhese.com/json/slac_insights-pixel';
const flags = window as unknown as { adheseConsent?: boolean; adheseIdentityConsent?: boolean };

function setup(overrides: Record<string, unknown> = {}, consent = true) {
  window.matchMedia = ((query: string) => ({ matches: query.includes('1024') })) as typeof window.matchMedia;
  flags.adheseConsent = consent;
  const fetchMock = vi.fn().mockResolvedValue(new Response('[]'));
  const insights = createInsights({ mode: 'insights', account: 'demo', pageType: 'product', sku: 'S1', ...overrides } as never, fetchMock as never);

  return { insights, fetchMock, urls: () => fetchMock.mock.calls.map(call => String(call[0])) };
}

async function flush(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 5);
  });
}

afterEach(() => {
  vi.useRealTimers();
  flags.adheseIdentityConsent = undefined;
});

describe('page view', () => {
  it('sends the page targets, device and consent', async () => {
    const { insights, urls } = setup();
    await insights.pageView();

    expect(urls()).toEqual([`${base}/ptproduct/sks1/dttablet/brtablet/tlall`]);
  });

  it('adds the identity as the last target', async () => {
    const { insights, urls } = setup();
    insights.identity = 'a'.repeat(64);
    await insights.pageView();

    expect(urls()[0]).toBe(`${base}/ptproduct/sks1/dttablet/brtablet/tlall/mi${'a'.repeat(64)}`);
  });

  it('leaves the identity out when the storefront withholds it', async () => {
    const { insights, urls } = setup();
    insights.identity = '42';
    flags.adheseIdentityConsent = false;
    await insights.pageView();

    expect(urls()[0]).toBe(`${base}/ptproduct/sks1/dttablet/brtablet/tlall`);
  });

  it('sends nothing without consent', async () => {
    const { insights, fetchMock } = setup({}, false);
    await insights.pageView();

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('add to cart', () => {
  it('sends the event with the page type and the SKU', async () => {
    const { insights, urls } = setup();
    insights.track('add_to_cart', 'RED-SHOE');
    await flush();

    expect(urls()).toEqual([`${base}/ptproduct/evadd_to_cart/skred_shoe/dttablet/brtablet/tlall`]);
  });

  it('sends one request per distinct valid SKU, at most five', async () => {
    const { insights, urls } = setup();
    insights.track('add_to_cart', ['A', 'A', 'B', 'bad sku', 'C/D', '', 4, 'C', 'D', 'E', 'F', 'G']);
    await flush();

    expect(urls().map(url => /\/sk([^/]+)/.exec(url)?.[1])).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('is still counted without a SKU, once', async () => {
    const { insights, urls } = setup();
    insights.track('add_to_cart');
    insights.track('add_to_cart', ['not valid']);
    await flush();

    expect(urls()).toEqual([
      `${base}/ptproduct/evadd_to_cart/dttablet/brtablet/tlall`,
      `${base}/ptproduct/evadd_to_cart/dttablet/brtablet/tlall`,
    ]);
  });

  it('includes the identity, and nothing without consent', async () => {
    const granted = setup();
    granted.insights.identity = '42';
    granted.insights.track('add_to_cart', 'A');
    await flush();
    expect(granted.urls()[0]).toBe(`${base}/ptproduct/evadd_to_cart/ska/dttablet/brtablet/tlall/mi42`);

    const denied = setup({}, false);
    denied.insights.track('add_to_cart', 'A');
    await flush();
    expect(denied.fetchMock).not.toHaveBeenCalled();
  });
});

describe('checkout start', () => {
  it('is one request per 1.5 seconds', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const { insights, urls } = setup({ pageType: 'cart' });
    insights.track('begin_checkout');
    insights.track('begin_checkout');
    await flush();
    expect(urls()).toEqual([`${base}/ptcart/evbegin_checkout/dttablet/brtablet/tlall`]);

    vi.setSystemTime(Date.now() + 2000);
    insights.track('begin_checkout');
    await flush();
    expect(urls()).toHaveLength(2);
  });

  it('ignores unknown events', async () => {
    const { insights, fetchMock } = setup();
    insights.track('purchase' as never, 'A');
    await flush();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses overridden target codes', async () => {
    const { insights, urls } = setup({ targetCodes: { event: 'xx', sku: 'ss' } });
    insights.track('add_to_cart', 'A');
    await flush();

    expect(urls()[0]).toBe(`${base}/ptproduct/xxadd_to_cart/ssa/dttablet/brtablet/tlall`);
  });
});
