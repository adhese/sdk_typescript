import { describe, expect, it, vi } from 'vitest';
import { getTargetCodes } from '../shared/context';
import { applyDynamicContext, createContextPlugin, createContextStore } from './context';

const codes = getTargetCodes({ mode: 'ads', account: 'a', pageType: 'home' });
const hash = 'a'.repeat(64);

describe('applyDynamicContext', () => {
  it('sets cart skus, customer group and identity with consent', () => {
    const parameters = new Map<string, ReadonlyArray<string> | string>();
    applyDynamicContext(parameters, { mi: hash, cartSkus: ['A', 'B'], customerGroup: 'general' }, codes, true);

    expect(Object.fromEntries(parameters)).toEqual({ mi: hash, cs: ['A', 'B'], cg: 'general' });
  });

  it('never sends identity without consent and clears stale values', () => {
    const parameters = new Map<string, ReadonlyArray<string> | string>([['mi', 'old'], ['cs', ['X']]]);
    applyDynamicContext(parameters, { mi: hash, cartSkus: [] }, codes, false);

    expect(parameters.has('mi')).toBe(false);
    expect(parameters.has('cs')).toBe(false);
  });
});

describe('identity values', () => {
  it('accepts a hex hash or a numeric customer id and nothing else', () => {
    for (const ok of [hash, '8123456789012', '1']) {
      const parameters = new Map<string, ReadonlyArray<string> | string>();
      applyDynamicContext(parameters, { mi: ok }, codes, true);
      expect(parameters.get('mi')).toBe(ok);
    }
    for (const bad of ['jane@example.com', 'hash', 'A'.repeat(64), 'a'.repeat(63), '1'.repeat(21), '12 34', '']) {
      const parameters = new Map<string, ReadonlyArray<string> | string>();
      applyDynamicContext(parameters, { mi: bad }, codes, true);
      expect(parameters.has('mi'), bad).toBe(false);
    }
  });
});

describe('createContextStore', () => {
  it('merges updates', () => {
    const store = createContextStore();
    store.update({ mi: 'a' });
    store.update({ customerGroup: 'vip' });

    expect(store.get()).toEqual({ mi: 'a', customerGroup: 'vip' });
  });

  it('ready resolves on the first update', async () => {
    const store = createContextStore();
    const promise = store.ready(5000);
    store.update({ mi: 'a' });

    await expect(promise).resolves.toBeUndefined();
  });

  it('ready resolves after the timeout and immediately when data exists', async () => {
    vi.useFakeTimers();
    const store = createContextStore();
    const promise = store.ready(1000);
    await vi.advanceTimersByTimeAsync(1000);
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();

    await expect(createContextStore({ mi: 'x' }).ready(5000)).resolves.toBeUndefined();
  });
});

describe('createContextPlugin keeps parameters current', () => {
  it('applies on creation and on every update, for requests that bypass the global hook', () => {
    const store = createContextStore({ cartSkus: ['A'] });
    const context = { consentString: 'all', parameters: new Map<string, ReadonlyArray<string> | string>() };
    createContextPlugin(store, codes)(context as never, { hooks: { onRequest: () => {}, onInit: () => {} } } as never);

    expect(context.parameters.get('cs')).toEqual(['A']);

    store.update({ mi: hash, cartSkus: ['A', 'B'] });

    expect(context.parameters.get('mi')).toBe(hash);
    expect(context.parameters.get('cs')).toEqual(['A', 'B']);
  });
});

describe('createContextPlugin', () => {
  function run(consentString: string): Map<string, ReadonlyArray<string> | string> {
    let hook: ((options: unknown) => unknown) | undefined;
    const plugin = createContextPlugin(createContextStore({ mi: hash, cartSkus: ['A'] }), codes);
    const info = plugin({ consentString: 'all', parameters: new Map() } as never, {
      hooks: {
        onInit: (): void => {},
        onRequest: (callback: typeof hook): void => {
          hook = callback;
        },
      },
    } as never);
    const parameters = new Map<string, ReadonlyArray<string> | string>();
    hook?.({ context: { consentString, parameters } });

    expect(info.name).toBe('commerceContext');

    return parameters;
  }

  it('adds identity when consent is granted', () => {
    expect(run('all').get('mi')).toBe(hash);
    expect(run('CPtcstring').get('cs')).toEqual(['A']);
  });

  it('drops identity when the storefront withholds it, whatever the consent', () => {
    (window as unknown as { adheseIdentityConsent?: boolean }).adheseIdentityConsent = false;
    const withheld = run('all');
    (window as unknown as { adheseIdentityConsent?: boolean }).adheseIdentityConsent = undefined;

    expect(withheld.has('mi')).toBe(false);
    expect(withheld.get('cs')).toEqual(['A']);
    expect(run('all').get('mi')).toBe(hash);
  });

  it('drops identity when consent is none', () => {
    expect(run('none').has('mi')).toBe(false);
    expect(run('none').get('cs')).toEqual(['A']);
  });
});
