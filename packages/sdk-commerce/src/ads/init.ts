import { createAdhese } from '@adhese/sdk';
import { safeFramePlugin } from '@adhese/sdk-safe-frame';
import { stackSlotsPlugin } from '@adhese/sdk-stack-slots';
import { readConfig } from '../shared/config';
import { getTargetCodes, getTargets } from '../shared/context';
import { isIdentity } from '../shared/identity';
import { createContextPlugin, createContextStore, type DynamicContext } from './context';
import { registerSlots } from './slots';

const contextTimeoutMs = 1000;

declare global {

  interface Window {
    adheseConsent?: boolean;
    adheseCommerce?: {
      /**
       * The Adhese SDK instance, for QA and debugging. Set once the tag has started.
       */
      instance?: unknown;
      /**
       * Called by the module's customer-data bridge with identity, cart SKUs and customer group.
       */
      update(context: DynamicContext): void;
    };
    adheseCommerceContext?: DynamicContext;
  }
}

function waitForDom(): Promise<void> {
  if (document.readyState !== 'loading')
    return Promise.resolve();

  return new Promise((resolve) => {
    document.addEventListener('DOMContentLoaded', () => {
      resolve();
    }, { once: true });
  });
}

/**
 * Ads mode: create the Adhese SDK instance with the page context, then register the slots the page contains.
 */
export async function init(): Promise<void> {
  const config = readConfig();
  if (!config || config.mode !== 'ads' || !config.location)
    return;

  const codes = getTargetCodes(config);
  // An identity the platform prints for the logged-in customer (`config.identity`) is part of the shopper context; the
  // customer-data bridge, when there is one, overrides it.
  const store = createContextStore({
    ...(isIdentity(config.identity) ? { mi: config.identity } : {}),
    ...window.adheseCommerceContext,
  });
  const bridge: NonNullable<Window['adheseCommerce']> = { update: store.update };
  window.adheseCommerce = bridge;

  await waitForDom();
  if (config.expectContext)
    await store.ready(contextTimeoutMs);

  const adhese = createAdhese({
    account: config.account,
    // An explicit `undefined` would override the SDK's default host.
    ...(config.host ? { host: config.host } : {}),
    location: config.location,
    parameters: getTargets(config),
    consent: config.assumeConsent === true || window.adheseConsent === true,
    debug: config.debug === true,
    plugins: [
      stackSlotsPlugin,
      ...(config.safeFrame ? [safeFramePlugin] : []),
      createContextPlugin(store, codes),
    ],
  });

  bridge.instance = adhese;
  registerSlots(adhese as never, document, config.sponsored);
}
