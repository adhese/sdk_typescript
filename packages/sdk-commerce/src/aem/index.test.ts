/* eslint-disable ts/naming-convention */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { configElementId } from '../shared/config';

const ecid = '14575006536349286404619648085736425115';
const dataLayer = Object.assign([], {
  getState: () => ({ page: { p: { 'xdm:template': '/conf/s/templates/article-page', 'xdm:tags': ['marketing:interest/sport'] } } }),
});

type Options = { config?: Record<string, unknown>; consent?: boolean; alloy?: unknown; layer?: unknown };

async function run({ config = {}, consent = true, alloy, layer = dataLayer }: Options = {}): Promise<ReturnType<typeof vi.fn>> {
  vi.resetModules();
  document.body.innerHTML = `<script type="application/json" id="${configElementId}">${JSON.stringify({ account: 'demo', pageTypes: { 'article-page': 'article' }, ...config })}</script>`;
  Object.assign(window, { adheseConsent: consent, adobeDataLayer: layer, alloy });
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

  return fetchMock;
}

afterEach(() => {
  Object.assign(window, { alloy: undefined, adobeDataLayer: undefined, adheseCommerceContext: undefined });
});

describe('aem insights tag', () => {
  it('sends one request with the page type and tags from the data layer, and the ECID', async () => {
    const fetchMock = await run({ alloy: vi.fn().mockResolvedValue({ identity: { ECID: ecid } }) });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`https://ads-demo.adhese.com/json/slac_insights-pixel/ptarticle/ctmarketing_interest_sport/dttablet/brtablet/tlall/mi${ecid}`);
  });

  it('is anonymous without the Web SDK, and does not need the data layer', async () => {
    const fetchMock = await run({ layer: null });
    expect(fetchMock.mock.calls[0][0]).toBe('https://ads-demo.adhese.com/json/slac_insights-pixel/ptother/dttablet/brtablet/tlall');
  });

  it('lets the config override the derived page type and category', async () => {
    const fetchMock = await run({ config: { pageType: 'landing', category: ['Offers'] } });
    expect(String(fetchMock.mock.calls[0][0])).toContain('/ptlanding/ctoffers/');
  });

  it('sends nothing, and never asks the Web SDK, without consent', async () => {
    const alloy = vi.fn().mockResolvedValue({ identity: { ECID: ecid } });
    expect(await run({ consent: false, alloy })).not.toHaveBeenCalled();
    expect(alloy).not.toHaveBeenCalled();
  });

  it('sends nothing when switched off or without an account', async () => {
    expect(await run({ config: { mode: 'off' } })).not.toHaveBeenCalled();
    expect(await run({ config: { account: '' } })).not.toHaveBeenCalled();
  });

  it('is withheld when the storefront only has consent for measurement', async () => {
    Object.assign(window, { adheseIdentityConsent: false });
    const fetchMock = await run({ alloy: vi.fn().mockResolvedValue({ identity: { ECID: ecid } }) });
    Object.assign(window, { adheseIdentityConsent: undefined });
    expect(String(fetchMock.mock.calls[0][0])).not.toContain('/mi');
  });

  it('takes an identity pushed by a tag rule when the page waits for it', async () => {
    const fetchMock = await run({ config: { expectContext: true } });
    expect(fetchMock).not.toHaveBeenCalled();

    (window as unknown as { adheseCommerce: { update(context: unknown): void } }).adheseCommerce.update({ mi: ecid });
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });
    expect(String(fetchMock.mock.calls[0][0])).toMatch(new RegExp(`/mi${ecid}$`));
  });
});
