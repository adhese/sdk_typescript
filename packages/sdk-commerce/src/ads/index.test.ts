import { beforeEach, describe, expect, it, vi } from 'vitest';
import { configElementId } from '../shared/config';

const createAdhese = vi.fn();
vi.mock('@adhese/sdk', () => ({ createAdhese: (...args: Array<unknown>): unknown => createAdhese(...args) }));

const config = { mode: 'ads', account: 'demo', location: 'home_loc', pageType: 'product', sku: 'S1', category: ['men'] };

async function run(overrides: Record<string, unknown> = {}): Promise<void> {
  vi.resetModules();
  document.body.innerHTML = `<script type="application/json" id="${configElementId}">${JSON.stringify({ ...config, ...overrides })}</script>`
  + '<div class="adhese-slot" data-adhese-type="display" data-format="billboard"></div>';
  const { init } = await import('./init');
  await init();
}

describe('ads bootstrap', () => {
  beforeEach(() => {
    createAdhese.mockReset();
    createAdhese.mockReturnValue({ addSlot: vi.fn(), plugins: { stackSlots: { addSlot: vi.fn() } } });
    delete window.adheseConsent;
  });

  it('creates the SDK with location, targets, plugins and registers slots', async () => {
    await run({ assumeConsent: true, host: 'https://ads.shop.test', debug: true });
    const [[options]] = createAdhese.mock.calls;

    expect(options).toMatchObject({ account: 'demo', host: 'https://ads.shop.test', location: 'home_loc', consent: true, debug: true, parameters: { pt: 'product', sk: 'S1', ct: ['men'] } });
    expect(options.plugins).toHaveLength(2);
    expect(createAdhese.mock.results[0].value.addSlot).toHaveBeenCalledTimes(1);
  });

  it('leaves the host to the SDK default when none is configured', async () => {
    await run();

    expect(createAdhese.mock.calls[0][0]).not.toHaveProperty('host');
  });

  it('adds the SafeFrame plugin on request and exposes the context bridge', async () => {
    await run({ safeFrame: true });

    expect(createAdhese.mock.calls[0][0].plugins).toHaveLength(3);
    expect(typeof window.adheseCommerce?.update).toBe('function');
  });

  it('registers slots from the tag manager queue and from registerSlot once the SDK is up', async () => {
    const queued = { selector: '#queued', type: 'display', format: 'billboard' };
    vi.resetModules();
    document.body.innerHTML = `<script type="application/json" id="${configElementId}">${JSON.stringify(config)}</script>`
    + '<div id="queued"></div><div id="direct"></div>';
    (window as unknown as Record<string, unknown>).adheseSlotQueue = [queued];
    const { init } = await import('./init');
    await init();
    const { addSlot } = createAdhese.mock.results[0].value;

    expect(addSlot).toHaveBeenCalledTimes(1);
    expect(window.adheseCommerce?.registerSlot?.({ selector: '#direct', type: 'display', format: 'leaderboard' })).toBe(true);
    (window as unknown as { adheseSlotQueue: Array<unknown> }).adheseSlotQueue.push({ selector: '#queued', type: 'display', format: 'x' });
    expect(addSlot).toHaveBeenCalledTimes(2);
    expect(addSlot.mock.calls.map(([slot]: [{ format: string }]) => slot.format)).toEqual(['billboard', 'leaderboard']);

    delete (window as unknown as Record<string, unknown>).adheseSlotQueue;
  });

  it('follows window.adheseConsent when there is no override', async () => {
    window.adheseConsent = true;
    await run();

    expect(createAdhese.mock.calls[0][0].consent).toBe(true);
  });

  it('takes the identity the platform printed as part of the shopper context, unless it is invalid', async () => {
    const hash = 'c'.repeat(64);
    const miOf = (consentString: string): unknown => {
      const plugin = createAdhese.mock.calls.at(-1)?.[0].plugins.at(-1);
      const context = { consentString, parameters: new Map<string, unknown>() };
      plugin(context, { hooks: { onInit: (): void => {}, onRequest: (): void => {} } });

      return context.parameters.get('mi');
    };

    await run({ identity: hash });
    expect(miOf('all')).toBe(hash);
    expect(miOf('none')).toBeUndefined();

    await run({ identity: 'jane@example.com' });
    expect(miOf('all')).toBeUndefined();

    window.adheseCommerceContext = { mi: '42' };
    await run({ identity: hash });
    window.adheseCommerceContext = undefined;
    expect(miOf('all')).toBe('42');
  });

  it('is inert in insights/off mode or without a location', async () => {
    await run({ mode: 'insights' });
    await run({ location: undefined });

    expect(createAdhese).not.toHaveBeenCalled();
  });

  it('waits for the customer-data bridge when expected', async () => {
    const promise = run({ expectContext: true });
    await vi.waitFor(() => {
      expect(window.adheseCommerce).toBeDefined();
    });
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });
    expect(createAdhese).not.toHaveBeenCalled();
    window.adheseCommerce?.update({ customerGroup: 'vip' });
    await promise;

    expect(createAdhese).toHaveBeenCalledTimes(1);
  });
});
