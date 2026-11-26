import { createInsights, type InsightsEvent } from '../insights/events';
import { getConsent } from '../shared/consent';
import { isIdentity } from '../shared/identity';
import { whenIdle } from '../shared/idle';
import { isAuthoring } from './authoring';
import { readAemConfig } from './config';
import { getEcid } from './identity';

export { insightsFormat, insightsLocation } from '../insights/events';

const contextTimeoutMs = 1000;

type Bridge = {
  /**
   * For a tag rule that already knows the identity: `window.adheseCommerce.update({ mi })`.
   */
  update(context: { mi?: unknown }): void;
  track(event: InsightsEvent, skus?: ReadonlyArray<unknown> | string): void;
};

/**
 * Insights for AEM sites: one counted request per page view, no storefront event detectors. The page type and category
 * come from the Adobe Client Data Layer, the identity (`mi`) from the Web SDK's ECID, or from a tag rule that calls
 * `window.adheseCommerce.update({ mi })`. Nothing is sent without consent, and the Web SDK is only asked for the ECID
 * once consent is granted.
 */
export function init(): void {
  whenIdle(async () => {
    const config = readAemConfig();
    if (!config || config.mode !== 'insights' || isAuthoring(window))
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

    if (!insights.identity) {
      const consent = config.assumeConsent ? { granted: true } : await getConsent(window);
      if (!consent.granted)
        return;

      const ecid = await getEcid(window, config.alloyName);
      // `insights` is local; an identity that `update()` set meanwhile is only replaced by a valid ECID.
      if (ecid) {
        // eslint-disable-next-line require-atomic-updates
        insights.identity = ecid;
      }
    }

    if (config.expectContext && !insights.identity) {
      await Promise.race([ready, new Promise<void>((resolve) => {
        setTimeout(resolve, contextTimeoutMs);
      })]);
    }

    await insights.pageView();
  });
}

init();
