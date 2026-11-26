import type { SponsoredConfig } from '../shared/config';
import { registerSlotElement, type SlotHost, type SlotType } from './slots';

/**
 * Describes one slot for an element that is already on the page. Same attributes as the `data-*` markup, so there is
 * a single rendering path; this only fills them in from a host that cannot edit the markup (a tag manager tag).
 */
export type SlotSpec = {
  /**
   * CSS selector of the element that becomes the slot (the first match is used).
   */
  selector: string;
  type: SlotType;
  /**
   * Format code, or `formats` for device-specific formats. One of the two is required.
   */
  format?: string;
  formats?: ReadonlyArray<{ format: string; query: string }>;
  slot?: string;
  renderMode?: 'iframe' | 'inline';
  lazy?: boolean;
  /**
   * Sponsored: number of ads in the stack.
   */
  maxAds?: number;
  /**
   * Sponsored: CSS selector of the product grid to fill.
   */
  grid?: string;
  layout?: 'carousel' | 'grid';
  /**
   * Pixels of `min-height` to reserve until the slot fills or collapses.
   */
  reservedHeight?: number;
};

/**
 * Name of the window array a tag manager pushes slot specs onto (`createQueue` in a GTM template). The bundle drains
 * it and from then on handles each push immediately, like `dataLayer`.
 */
export const slotQueueName = 'adheseSlotQueue';

export const maxSelectorLength = 500;
export const maxReservedHeight = 2000;
export const maxAdsLimit = 20;
/**
 * How long to wait for an element that is not on the page yet.
 */
export const waitForElementMs = 5000;

const types: ReadonlyArray<SlotType> = ['display', 'native', 'sponsored'];

function isText(value: unknown, max = maxSelectorLength): value is string {
  return typeof value === 'string' && value !== '' && value.length <= max;
}

function parseFormats(value: unknown): SlotSpec['formats'] | undefined | null {
  if (value === undefined || value === null || value === '')
    return undefined;

  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) as unknown : value;
    if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(entry => isText(entry?.format) && isText(entry?.query)))
      return parsed.map(({ format, query }) => ({ format, query }));
  }
  catch {
    return null;
  }

  return null;
}

/**
 * Validate an untrusted spec. Returns `null` for anything unusable, so a bad tag does nothing instead of throwing.
 */
export function parseSlotSpec(value: unknown): SlotSpec | null {
  if (typeof value !== 'object' || value === null)
    return null;

  const input = value as Record<string, unknown>;
  if (!isText(input.selector) || !types.includes(input.type as SlotType))
    return null;

  const formats = parseFormats(input.formats);
  if (formats === null)
    return null;
  if (!isText(input.format) && !formats)
    return null;

  const spec: SlotSpec = { selector: input.selector, type: input.type as SlotType };
  if (isText(input.format))
    spec.format = input.format;
  if (formats)
    spec.formats = formats;
  if (isText(input.slot))
    spec.slot = input.slot;
  if (input.renderMode === 'iframe' || input.renderMode === 'inline')
    spec.renderMode = input.renderMode;
  if (input.lazy === false || input.lazy === true)
    spec.lazy = input.lazy;
  if (input.layout === 'carousel' || input.layout === 'grid')
    spec.layout = input.layout;
  if (isText(input.grid))
    spec.grid = input.grid;

  const maxAds = Number(input.maxAds);
  if (Number.isInteger(maxAds) && maxAds >= 1 && maxAds <= maxAdsLimit)
    spec.maxAds = maxAds;

  const height = Number(input.reservedHeight);
  if (Number.isFinite(height) && height > 0 && height <= maxReservedHeight)
    spec.reservedHeight = Math.round(height);

  return spec;
}

/**
 * Turn the spec into the same attributes the markup route uses, so `registerSlotElement` stays the only path.
 */
export function applySlotSpec(element: HTMLElement, spec: SlotSpec): void {
  element.classList.add('adhese-slot');
  element.dataset.adheseType = spec.type;

  const attributes: Record<string, string | undefined> = {
    format: spec.format,
    formats: spec.formats ? JSON.stringify(spec.formats) : undefined,
    slot: spec.slot,
    renderMode: spec.renderMode,
    lazy: spec.lazy === undefined ? undefined : String(spec.lazy),
    maxAds: spec.maxAds === undefined ? undefined : String(spec.maxAds),
    grid: spec.grid,
    layout: spec.layout,
  };
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined)
      delete element.dataset[key];
    else
      element.dataset[key] = value;
  }

  if (spec.reservedHeight)
    element.style.minHeight = `${spec.reservedHeight}px`;
}

function find(doc: Document, selector: string): HTMLElement | null {
  try {
    return doc.querySelector<HTMLElement>(selector);
  }
  catch {
    // An invalid selector is a bad tag, not a page error.
    return null;
  }
}

export type SlotRegistry = {
  /**
   * Accepts a spec at any time. Before `attach` it is held, after it the element is looked up (and waited for).
   * Returns `false` for an invalid spec.
   */
  register(spec: unknown): boolean;
  /**
   * The SDK is ready: place every held spec, and every later one immediately.
   */
  attach(host: SlotHost, sponsored?: Partial<SponsoredConfig>, label?: string): void;
  /**
   * Handle the specs a tag manager pushed onto `window.adheseSlotQueue`, and the ones it pushes later.
   */
  consume(win?: Window): void;
};

export function createSlotRegistry(doc: Document = document, waitMs: number = waitForElementMs): SlotRegistry {
  const held: Array<SlotSpec> = [];
  let target: { host: SlotHost; sponsored?: Partial<SponsoredConfig>; label?: string } | null = null;

  function place(spec: SlotSpec): void {
    if (!target)
      return;
    const { host, sponsored, label } = target;

    const done = (element: HTMLElement): void => {
      if (element.dataset.adheseRegistered)
        return;
      applySlotSpec(element, spec);
      registerSlotElement(host, element, sponsored, label);
    };

    const element = find(doc, spec.selector);
    if (element) {
      done(element);

      return;
    }

    // The element may be rendered later (SPA, lazy section): watch briefly, then give up quietly.
    const wait: { timer?: ReturnType<typeof setTimeout> } = {};
    const observer = new MutationObserver(() => {
      const found = find(doc, spec.selector);
      if (!found)
        return;
      observer.disconnect();
      clearTimeout(wait.timer);
      done(found);
    });
    wait.timer = setTimeout(() => {
      observer.disconnect();
    }, waitMs);
    observer.observe(doc.documentElement, { childList: true, subtree: true });
  }

  const registry: SlotRegistry = {
    register(value) {
      const spec = parseSlotSpec(value);
      if (!spec)
        return false;
      if (target)
        place(spec);
      else
        held.push(spec);

      return true;
    },
    attach(host, sponsored, label) {
      target = { host, sponsored, label };
      for (const spec of held.splice(0))
        place(spec);
    },
    consume(win = window) {
      const holder = win as unknown as Record<string, unknown>;
      const existing = Array.isArray(holder[slotQueueName]) ? holder[slotQueueName] as Array<unknown> : [];
      const queue: Array<unknown> = existing;
      holder[slotQueueName] = queue;

      for (const item of queue.splice(0))
        registry.register(item);

      queue.push = (...items: Array<unknown>): number => {
        for (const item of items)
          registry.register(item);

        return queue.length;
      };
    },
  };

  return registry;
}
