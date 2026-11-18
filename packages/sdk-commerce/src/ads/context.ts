import type { AdheseContext, AdhesePlugin } from '@adhese/sdk';
import type { TargetCodes } from '../shared/config';
import { isIdentity, identityAllowed as storefrontAllowsIdentity } from '../shared/identity';

/**
 * Private, per-shopper data. Read in the browser from Magento's customer-data sections and never printed into cached
 * HTML.
 */
export type DynamicContext = {
  /**
   * Customer identity: a SHA-256/HMAC hex hash or a numeric customer ID, anything else is never sent. Only sent with
   * consent, and not when the storefront withholds it (`window.adheseIdentityConsent === false`).
   */
  mi?: string;
  cartSkus?: ReadonlyArray<string>;
  customerGroup?: string;
};

export type ContextStore = {
  get(): DynamicContext;
  update(partial: DynamicContext): void;
  subscribe(listener: () => void): void;
  /**
   * Resolves when the first update arrived or after `timeoutMs`, whichever comes first.
   */
  ready(timeoutMs: number): Promise<void>;
};

export function createContextStore(initial: DynamicContext = {}): ContextStore {
  let value = initial;
  let hasValue = Object.keys(initial).length > 0;
  const waiting = new Set<() => void>();
  const listeners = new Set<() => void>();

  return {
    get: () => value,
    update(partial): void {
      value = { ...value, ...partial };
      hasValue = true;
      for (const resolve of waiting)
        resolve();
      waiting.clear();
      for (const listener of listeners)
        listener();
    },
    subscribe(listener): void {
      listeners.add(listener);
    },
    async ready(timeoutMs): Promise<void> {
      if (hasValue)
        return;

      await new Promise<void>((resolve) => {
        const done = (): void => {
          waiting.delete(done);
          // eslint-disable-next-line ts/no-use-before-define
          clearTimeout(timer);
          resolve();
        };
        const timer = setTimeout(done, timeoutMs);
        waiting.add(done);
      });
    },
  };
}

type Parameters = Map<string, ReadonlyArray<string> | string>;

/**
 * Write the dynamic context into a parameter map, removing keys that no longer have a value.
 * Identity is only included when `identityAllowed` and it is a valid identity.
 */
export function applyDynamicContext(
  parameters: Parameters,
  context: DynamicContext,
  codes: TargetCodes,
  identityAllowed: boolean,
): void {
  function set(key: string, value: ReadonlyArray<string> | string | undefined): void {
    if (value === undefined || value.length === 0)
      parameters.delete(key);
    else
      parameters.set(key, value);
  }

  set(codes.identity, identityAllowed && isIdentity(context.mi) ? context.mi : undefined);
  set(codes.cartSkus, context.cartSkus);
  set(codes.customerGroup, context.customerGroup);
}

/**
 * SDK plugin that adds the shopper context to every ad request through the `onRequest` hook.
 */
export function createContextPlugin(store: ContextStore, codes: TargetCodes, win: Window = window): AdhesePlugin<{ name: 'commerceContext' }> {
  return (context, plugin) => {
    function apply(target: AdheseContext): void {
      const { consentString } = target;

      applyDynamicContext(target.parameters, store.get(), codes, Boolean(consentString) && consentString !== 'none' && storefrontAllowsIdentity(win));
    }

    // Stack slots (sponsored products) build their own request from `context.parameters`, before the global request
    // hook runs, so the parameters are kept current here as well as on every request.
    apply(context);
    plugin.hooks.onInit(() => {
      // Consent is resolved once the instance is initialised.
      apply(context);
    });
    store.subscribe(() => {
      apply(context);
    });
    plugin.hooks.onRequest((options) => {
      apply(options.context);

      return options;
    });

    return { name: 'commerceContext' };
  };
}
