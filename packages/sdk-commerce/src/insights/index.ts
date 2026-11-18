import { readConfig } from '../shared/config';
import { isIdentity } from '../shared/identity';
import { installMagento } from './detectors/magento';
import { installShopify } from './detectors/shopify';
import { createInsights, type InsightsEvent } from './events';

export { insightsFormat, insightsLocation } from './events';

const contextTimeoutMs = 1000;

type Bridge = {
  /**
   * Called by the module's customer-data bridge with the shopper's private context; only `mi` is used here.
   */
  update(context: { mi?: unknown }): void;
  track(event: InsightsEvent, skus?: ReadonlyArray<unknown> | string): void;
};

/**
 * True inside the Shopify theme editor, whose sessions are the merchant's own and not shopper traffic.
 */
function shopifyDesignMode(): boolean {
  // eslint-disable-next-line ts/naming-convention
  return (window as unknown as { Shopify?: { designMode?: boolean } }).Shopify?.designMode === true;
}

function whenIdle(callback: () => void): void {
  if (typeof requestIdleCallback === 'function')
    requestIdleCallback(callback);
  else
    setTimeout(callback, 1);
}

/**
 * Insights mode: one counted request per page view, plus one per add to cart and checkout start (`ev` target) when the
 * platform's detector is installed. Anonymous unless the platform provides a customer identity (`mi`); the identity is
 * sent with the same consent as the request and never when the storefront withholds it (`adheseIdentityConsent`).
 * Without a consent signal nothing is sent.
 */
export function init(): void {
  whenIdle(async () => {
    const config = readConfig();
    if (!config || config.mode !== 'insights')
      return;

    // Do not count the merchant's own theme editor sessions as shopper traffic.
    if (config.platform === 'shopify' && shopifyDesignMode())
      return;

    const insights = createInsights(config, fetch.bind(window));
    const known = (window as unknown as { adheseCommerceContext?: { mi?: unknown } }).adheseCommerceContext?.mi ?? config.identity;
    insights.identity = isIdentity(known) ? known : undefined;

    let contextReady: () => void = () => {};
    const ready = new Promise<void>((resolve) => {
      contextReady = resolve;
    });
    const bridge: Bridge = {
      update(context) {
        if (isIdentity(context?.mi))
          insights.identity = context.mi;
        contextReady();
      },
      track: insights.track,
    };
    (window as unknown as { adheseCommerce?: Bridge }).adheseCommerce = bridge;

    if (config.events !== false) {
      if (config.platform === 'shopify')
        installShopify(config, insights, window);
      else if (config.platform !== 'custom')
        installMagento(config, insights, window);
    }

    // The identity of a logged-in shopper is private data, so it reaches a cached page late: wait briefly for it.
    if (config.expectContext && !insights.identity) {
      await Promise.race([ready, new Promise<void>((resolve) => {
        setTimeout(resolve, contextTimeoutMs);
      })]);
    }

    await insights.pageView();
  });
}

init();
