import type { CommerceConfig } from '../shared/config';
import { getConsent } from '../shared/consent';
import { getTargetCodes, getTargets } from '../shared/context';
import { identityAllowed } from '../shared/identity';
import { buildAdRequestUrl, deviceParams } from '../shared/request';

export const insightsLocation = 'ac_insights';
export const insightsFormat = 'pixel';

export type InsightsEvent = 'add_to_cart' | 'begin_checkout';

export const insightsEvents: ReadonlyArray<InsightsEvent> = ['add_to_cart', 'begin_checkout'];

export const maxSkusPerEvent = 5;
const checkoutDebounceMs = 1500;

/**
 * A usable catalog ID: not empty, at most 255 characters, no whitespace or path/query characters.
 */
export function isSku(value: unknown): value is string {
  return typeof value === 'string' && value !== '' && value.length <= 255 && !/[\s/?#]/.test(value);
}

export type Insights = {
  /**
   * Customer identity for the `mi` target, set by the platform or the customer-data bridge.
   */
  identity?: string;
  pageView(): Promise<void>;
  /**
   * Count an event on the page view's location and format, told apart by the `ev` target. One request per SKU (at most
   * 5; none without a valid SKU), a checkout start is counted once per 1.5 seconds.
   */
  track(event: InsightsEvent, skus?: ReadonlyArray<unknown> | string): void;
};

/**
 * One counted request per page view, add to cart and checkout start, always on the never-booked `pixel` format of the
 * fixed `ac_insights` location. Nothing is rendered and the response is ignored. No cookies, page URL or referrer.
 * Same consent as the page view: nothing is sent without it. The identity goes along when set and allowed.
 */
export function createInsights(config: CommerceConfig, plainFetch: typeof fetch, win: Window = window): Insights {
  const codes = getTargetCodes(config);
  const state: { identity?: string } = {};
  let lastCheckout = 0;

  async function send(targets: Record<string, ReadonlyArray<string> | string>): Promise<void> {
    const consent = config.assumeConsent ? { granted: true, params: { tl: 'all' } } : await getConsent(win);
    if (!consent.granted)
      return;

    const parameters: Record<string, ReadonlyArray<string> | string> = { ...targets, ...deviceParams(win), ...consent.params };
    if (state.identity && identityAllowed(win))
      parameters[codes.identity] = state.identity;

    const url = buildAdRequestUrl({
      account: config.account,
      host: config.host,
      location: insightsLocation,
      slots: [{ format: insightsFormat }],
      parameters,
    });
    plainFetch(url, { keepalive: true, credentials: 'omit' }).catch(() => {});
  }

  return {
    get identity(): string | undefined {
      return state.identity;
    },
    set identity(value: string | undefined) {
      state.identity = value;
    },
    async pageView(): Promise<void> {
      await send(getTargets(config));
    },
    track(event: InsightsEvent, skus: ReadonlyArray<unknown> | string = []): void {
      if (!insightsEvents.includes(event))
        return;

      const base = { [codes.pageType]: config.pageType, [codes.event]: event };
      const sendEvent = (targets: Record<string, string>): void => {
        send({ ...base, ...targets }).catch(() => {});
      };

      if (event === 'begin_checkout') {
        const now = Date.now();
        if (now - lastCheckout < checkoutDebounceMs)
          return;
        lastCheckout = now;
        sendEvent({});

        return;
      }

      const list = [...new Set((typeof skus === 'string' ? [skus] : skus).filter(isSku))].slice(0, maxSkusPerEvent);
      if (list.length === 0)
        sendEvent({});
      for (const sku of list)
        sendEvent({ [codes.sku]: sku });
    },
  };
}
