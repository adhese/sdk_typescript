import { createAdhese } from '@adhese/sdk';
import { safeFramePlugin } from '@adhese/sdk-safe-frame';
import { stackSlotsPlugin } from '@adhese/sdk-stack-slots';
import { readConfig } from '../shared/config';
import { getTargetCodes, getTargets } from '../shared/context';
import { isIdentity } from '../shared/identity';
import { createContextPlugin, createContextStore, type DynamicContext } from './context';
import { createSlotRegistry } from './register';
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
      /**
       * Turn an element that is already on the page into a slot (see `SlotSpec`). Held until the SDK is ready; returns
       * `false` for an invalid spec. A tag manager pushes the same specs onto `window.adheseSlotQueue` instead. Not
       * available in the AEM bundle.
       */
      registerSlot?(spec: unknown): boolean;
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
  // Slot specs from a tag manager can arrive before the SDK exists: take over the queue now and hold them.
  const slotRegistry = createSlotRegistry();
  const bridge: NonNullable<Window['adheseCommerce']> = { update: store.update, registerSlot: slotRegistry.register };
  window.adheseCommerce = bridge;
  slotRegistry.consume();

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
  slotRegistry.attach(adhese as never, config.sponsored);
}
