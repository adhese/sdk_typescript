import { createAdhese } from '@adhese/sdk';
import { safeFramePlugin } from '@adhese/sdk-safe-frame';
import { stackSlotsPlugin } from '@adhese/sdk-stack-slots';
import { createContextPlugin, createContextStore } from '../ads/context';
import { addDisplaySlot, addNativeSlot, type SlotHost, slotSelector, type SlotType } from '../ads/slots';
import { getConsent } from '../shared/consent';
import { getTargetCodes, getTargets } from '../shared/context';
import { isIdentity } from '../shared/identity';
import { isAuthoring } from './authoring';
import { readAemConfig } from './config';
import { getEcid } from './identity';

const contextTimeoutMs = 1000;

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
 * Register the display and native slots of the page. Sponsored products are a storefront feature and are ignored.
 */
export function registerAemSlots(host: SlotHost, root: ParentNode): number {
  let count = 0;

  for (const element of Array.from(root.querySelectorAll<HTMLElement>(slotSelector))) {
    const type = element.dataset.adheseType as SlotType;
    if (element.dataset.adheseRegistered || type === 'sponsored')
      continue;
    element.dataset.adheseRegistered = 'true';
    count++;

    if (type === 'native')
      addNativeSlot(host, element);
    else
      addDisplaySlot(host, element);
  }

  return count;
}

/**
 * Ads for AEM sites: display and native slots (`<div class="adhese-slot" data-adhese-type="display" data-format="...">`),
 * with the page type and tags from the Adobe Client Data Layer as targets and the Web SDK's ECID as `mi`. The ECID is read
 * after consent and reaches the requests through the context plugin: use `expectContext` to hold the first request for it.
 */
export async function init(): Promise<void> {
  const config = readAemConfig();
  if (!config || config.mode !== 'ads' || !config.location || isAuthoring(window))
    return;

  const store = createContextStore({
    ...(isIdentity(config.identity) ? { mi: config.identity } : {}),
    ...window.adheseCommerceContext,
  });
  const bridge: NonNullable<Window['adheseCommerce']> = { update: store.update };
  window.adheseCommerce = bridge;

  // The ECID is only asked for after consent. Whatever the outcome, the first update releases `expectContext`.
  if (!store.get().mi) {
    (async (): Promise<void> => {
      const consent = config.assumeConsent ? { granted: true } : await getConsent(window);
      const ecid = consent.granted ? await getEcid(window, config.alloyName) : undefined;
      store.update(ecid ? { mi: ecid } : {});
    })().catch(() => {});
  }

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
      createContextPlugin(store, getTargetCodes(config)),
    ],
  });

  bridge.instance = adhese;
  registerAemSlots(adhese as never, document);
}
