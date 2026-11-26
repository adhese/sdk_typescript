/* eslint-disable ts/naming-convention */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { configElementId } from '../shared/config';

const createAdhese = vi.fn();
vi.mock('@adhese/sdk', () => ({ createAdhese: (...args: Array<unknown>): unknown => createAdhese(...args) }));

const ecid = '14575006536349286404619648085736425115';
const dataLayer = Object.assign([], {
  getState: () => ({ page: { p: { 'xdm:template': '/conf/s/templates/article-page', 'xdm:tags': ['marketing:interest/sport'] } } }),
});
const config = { mode: 'ads', account: 'demo', locations: { article: 'site_article' }, pageTypes: { 'article-page': 'article' } };

type Options = { config?: Record<string, unknown>; alloy?: unknown; html?: string; url?: string };

async function run({ config: overrides = {}, alloy, html = '', url = '/' }: Options = {}): Promise<void> {
  vi.resetModules();
  window.history.replaceState(null, '', url);
  document.body.innerHTML = `<script type="application/json" id="${configElementId}">${JSON.stringify({ ...config, ...overrides })}</script>${html}`;
  Object.assign(window, { adobeDataLayer: dataLayer, alloy });
  const { init } = await import('./ads');
  await init();
  await new Promise((resolve) => {
    setTimeout(resolve, 10);
  });
}

function miOf(consentString: string): unknown {
  const plugin = createAdhese.mock.calls.at(-1)?.[0].plugins.at(-1);
  const context = { consentString, parameters: new Map<string, unknown>() };
  plugin(context, { hooks: { onInit: (): void => {}, onRequest: (): void => {} } });

  return context.parameters.get('mi');
}

describe('aem ads', () => {
  beforeEach(() => {
    createAdhese.mockReset();
    createAdhese.mockReturnValue({ addSlot: vi.fn(), plugins: { stackSlots: { addSlot: vi.fn() } } });
    Object.assign(window, { adheseConsent: true, adheseCommerceContext: undefined, adheseIdentityConsent: undefined });
  });

  it('creates the SDK with the location and targets from the data layer', async () => {
    await run({ config: { assumeConsent: true, host: 'https://ads.site.test' } });
    const [[options]] = createAdhese.mock.calls;

    expect(options).toMatchObject({
      account: 'demo',
      host: 'https://ads.site.test',
      location: 'site_article',
      consent: true,
      parameters: { pt: 'article', ct: ['marketing:interest/sport'] },
    });
  });

  it('prefers an explicit location, and needs one', async () => {
    await run({ config: { location: 'fixed' } });
    expect(createAdhese.mock.calls[0][0].location).toBe('fixed');

    createAdhese.mockClear();
    await run({ config: { locations: undefined } });
    expect(createAdhese).not.toHaveBeenCalled();
  });

  it('is inert in insights or off mode and in the AEM editor', async () => {
    await run({ config: { mode: 'insights' } });
    await run({ config: { mode: 'off' } });
    await run({ url: '/editor.html/content/site/en.html' });
    await run({ url: '/content/site/en.html?wcmmode=edit' });

    expect(createAdhese).not.toHaveBeenCalled();
  });

  it('registers display and native slots, and ignores sponsored ones', async () => {
    await run({
      html: '<div class="adhese-slot" data-adhese-type="display" data-format="billboard"></div>'
        + '<div class="adhese-slot" data-adhese-type="native" data-format="native_tile"></div>'
        + '<div class="adhese-slot" data-adhese-type="sponsored" data-format="sponsored_grid"></div>',
    });
    const host = createAdhese.mock.results[0].value;

    expect(host.addSlot).toHaveBeenCalledTimes(2);
    expect(host.plugins.stackSlots.addSlot).not.toHaveBeenCalled();
  });

  it('adds the ECID from the Web SDK to the requests once consent is granted', async () => {
    await run({ alloy: vi.fn().mockResolvedValue({ identity: { ECID: ecid } }) });
    expect(miOf('all')).toBe(ecid);
    expect(miOf('none')).toBeUndefined();
  });

  it('holds the first request for the ECID with expectContext', async () => {
    await run({ config: { expectContext: true }, alloy: vi.fn().mockResolvedValue({ identity: { ECID: ecid } }) });
    expect(miOf('all')).toBe(ecid);
  });

  it('does not ask the Web SDK without consent, and still starts', async () => {
    window.adheseConsent = false;
    const alloy = vi.fn().mockResolvedValue({ identity: { ECID: ecid } });
    await run({ config: { expectContext: true }, alloy });

    expect(alloy).not.toHaveBeenCalled();
    expect(createAdhese).toHaveBeenCalledTimes(1);
  });

  it('takes an identity from the config or a tag rule instead of asking the Web SDK', async () => {
    const alloy = vi.fn();
    await run({ config: { identity: ecid }, alloy });
    expect(miOf('all')).toBe(ecid);
    expect(alloy).not.toHaveBeenCalled();

    window.adheseCommerce?.update({ mi: '42' });
    expect(miOf('all')).toBe('42');
  });
});
