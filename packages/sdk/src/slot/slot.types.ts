import type { AdheseAd, AdheseContext } from '@adhese/sdk';
import type { createAsyncHook, createPassiveHook, Merge, Ref } from '@adhese/sdk-shared';

export type RenderMode = 'iframe' | 'inline' | 'none';
export type AdheseSlotHooks = {
  /**
   * Hook that is called right before the slot is rendered, once the slot's element is known to be in the viewport.
   *
   * Returning a falsy value here marks the ad as empty: the creative is not rendered, but the slot is still
   * considered `rendered` for tracking purposes (impression and viewability pixels can still fire) and `onEmpty`
   * is fired. This is a fallback for detecting no-fill/house creatives right before they would be written to the
   * DOM; prefer calling `context.value.processOnEmpty(ad)` from `onRequest` instead, so `onEmpty` fires as soon
   * as the ad is known to be empty rather than only once the slot actually renders.
   */
  onBeforeRender: ReturnType<typeof createAsyncHook<AdheseAd>>[1];
  /**
   * Hook that is called when the slot is rendered.
   */
  onRender: ReturnType<typeof createPassiveHook<AdheseAd>>[1];
  /**
   * Hook that is called before the slot is requested from the server.
   */
  onBeforeRequest: ReturnType<typeof createAsyncHook<AdheseAd | null>>[1];
  /**
   * Hook that is called when the slot is requested from the server.
   *
   * To detect a no-fill/house creative (an ad response whose content indicates there's nothing real to show, e.g.
   * a recognisable `ad.tag`), call `context.value.processOnEmpty(ad)` with the received ad and return the ad
   * unchanged. This fires `onEmpty` immediately, while still letting the ad reach `render()` later so the slot's
   * position is tracked (impression/viewability pixels still fire) once it actually renders — no creative is
   * written to the element. See `isEmpty` on the slot context.
   */
  onRequest: ReturnType<typeof createAsyncHook<AdheseAd>>[1];
  /**
   * Hook that is called when the slot is initialized.
   */
  onInit: ReturnType<typeof createAsyncHook<void>>[1];
  /**
   * Hook that is called when the slot is disposed.
   */
  onDispose: ReturnType<typeof createPassiveHook>[1];
  /**
   * Hook that is called when the slot is empty, either because the server didn't return an ad for it at all
   * (`context.value.processOnEmpty()`, no tracking), or because an ad was identified as an empty/no-fill
   * creative via `context.value.processOnEmpty(ad)` from `onRequest`, or a falsy return from `onBeforeRender`
   * (both keep the slot's position tracked as rendered — see `isEmpty` on the slot context).
   */
  onEmpty: ReturnType<typeof createPassiveHook>[1];
  /**
   * Hook that is called when the slot encounters an error.
   */
  onError: ReturnType<typeof createPassiveHook<Error>>[1];
  /**
   * Hook that is called when the slots impressions tracker is fired.
   */
  onImpressionTracked: ReturnType<typeof createAsyncHook<AdheseAd>>[1];
  /**
   * Hook that is called when the slots impressions tracker is fired.
   */
  onViewableTracked: ReturnType<typeof createAsyncHook<AdheseAd>>[1];
};
export type AdheseSlotOptions = {
  /**
   * The format code of the slot. Used to find the correct element on the page to render the ad in. If the format is a
   * string, it is used as the format code. If the format is an array, the format code is determined by the query
   * detector.
   */
  format: string | ReadonlyArray<{
    format: string;
    query: string;
  }>;
  /**
   * Type of the slot. On its own has no effect, but can be used by plugins to create different behavior for different
   * types of slots.
   */
  type?: string;
  /**
   * If we have multiple slots with the same format, we can use this to differentiate between them.
   */
  slot?: string;
  /**
   * The element that contains the slot. Used to find the correct element on the page to render the ad in.
   */
  containingElement?: string | HTMLElement;
  /**
   * The parameters that are used to render the ad.
   */
  parameters?: Record<string, ReadonlyArray<string> | string>;
  /**
   * The Adhese context
   */
  context: AdheseContext;
  /**
   * The render mode of the slot.
   *
   * - `iframe`: The ad will be rendered in an iframe.
   * - `inline`: The ad will be rendered in the containing element.
   *
   * @default 'iframe'
   */
  renderMode?: RenderMode;
  /**
   * Overwrite the width of the slot. If not provided, the width will be determined by the ad response
   *
   * Will be ignored if `renderMode` is set to `inline` or `none`
   */
  width?: number | string;
  /**
   * Overwrite the height of the slot. If not provided, the height will be determined by the ad response
   *
   * Will be ignored if `renderMode` is set to `inline` or `none`
   */
  height?: number | string;
  /**
   * Specific options for the slot that may be used my plugins
   */
  pluginOptions?: Record<string, unknown>;
  /**
   * The initial data of the slot. If provided, the slot will not request new data from the API.
   */
  initialData?: AdheseAd | null;
  /**
   * Special callback that is run when the slot is initialized. It passes the slot context ref object and a special
   * plugin object that contains a set of hooks you can use to hook into different moments of the slots lifecycle.
   */
  setup?(context: Ref<AdheseSlotContext | null>, hooks: AdheseSlotHooks): void;
} & ({
  /**
   * If the slot should be lazy loaded. This means that the ad will only be requested when the slot is in the viewport.
   * If `true`, the slot will handle the request itself and render the ad.
   */
  lazyLoading: true;
  lazyLoadingOptions?: {
    /**
     * The root margin of the intersection observer. This is used to determine when the slot is in the viewport.
     */
    rootMargin?: string;
  };
} | {
  lazyLoading?: false;
  lazyLoadingOptions?: never;
});

type BaseAdheseSlot = Merge<Omit<AdheseSlotOptions, 'onDispose' | 'context' | 'onFormatChange' | 'format'>, AdheseSlotHooks & {
  /**
   * Type of the slot. On its own has no effect, but can be used by plugins to create different behavior for different
   * types of slots.
   */
  type?: string;
  /**
   * The name of the slot. This is used to identify the slot in the Adhese instance.
   *
   * The name is generated based on the location, format, and slot of the slot.
   */
  name: string;
  /**
   * The format code of the slot. Used to find the correct element on the page to render the ad in.
   *
   * If the format is a string, it is used as the format code. If the format is an array, the format code is determined
   * by the query detector.
   *
   * When you change the format, the slot will request a new ad from the API automatically.
   */
  format: string;
  /**
   * The location of the slot. This is the location that is used to determine the current page URL.
   */
  location: string;
  /**
   * The parameters that are used to render the ad.
   */
  parameters: Map<string, ReadonlyArray<string> | string>;
  /**
   * Whether the viewability tracking pixel has been fired.
   */
  readonly isViewabilityTracked: boolean;
  /**
   * Whether the impression tracking pixel has been fired.
   */
  readonly isImpressionTracked: boolean;
  /**
   * The state of the slot is currently in.
   *
   * - `initializing`: The slot is initializing.
   * - `initialized`: The slot is initialized.
   * - `loading`: The slot is loading data from the API
   * - `loaded`: The slot has loaded data from the API and is ready to render
   * - `empty`: The slot has loaded data from the API but the response was empty
   * - `rendering`: The slot is rendering the ad
   * - `rendered`: The slot has rendered the ad, or identified it as an empty/no-fill creative (see `isEmpty`)
   * - `error`: The slot has encountered an error
   */
  status: 'initializing' | 'initialized' | 'loading' | 'loaded' | 'empty' | 'rendering' | 'rendered' | 'error';
  /**
   * Whether the ad was identified as empty (a no-fill/house creative), via `processOnEmpty(ad)` from `onRequest`
   * or a falsy return from `onBeforeRender`. Once the slot reaches `rendered` status, `isEmpty` tells you whether
   * a creative was actually written to `element` (`false`) or the slot's position was tracked without one
   * (`true`).
   *
   * This is distinct from `status === 'empty'`, which means the server returned no ad for the slot at all and
   * nothing is tracked.
   */
  readonly isEmpty: boolean;
  /**
   * Is the slot disposed.
   */
  isDisposed: boolean;
  /**
   * The element that contains the slot.
   */
  element: HTMLElement | null;
  /**
   * Unique identifier of the slot. ID is generated on initialization and will never change.
   */
  id: string;
  /**
   * Slot related data fetched from the API.
   */
  data: AdheseAd | null;
  /**
   * Options slot was created with
   */
  options: Omit<AdheseSlotOptions, 'context'>;
  /**
   * Is the slot visible in the viewport.
   */
  isVisible: boolean;
  /**
   * Renders the slot in the containing element. If no data is provided, new data will be requested from the API.
   */
  render(data?: AdheseAd): Promise<HTMLElement | null>;
  /**
   * Requests a new ad from the API and returns the ad object.
   */
  request(): Promise<AdheseAd | null>;
  /**
   * Remove the HTML element contents from the dom.
   */
  cleanElement(): void;
  /**
   * Removes the slot from the DOM and cleans up the slot instance.
   */
  dispose(): void;
  /**
   * Marks the slot as empty and fires the `onEmpty` hook.
   *
   * Call it with no argument when there's no ad at all for the slot: `status` becomes `empty` and nothing is
   * tracked. Call it with the received `ad` from the `onRequest` hook when the server did return an ad but its
   * creative should be treated as empty (a no-fill/house banner): the ad is kept alive so the slot's position is
   * still tracked as rendered once it actually renders, without writing a creative to the element.
   */
  processOnEmpty(ad?: AdheseAd): void;
  /**
   * Process the onError hook whenever an error is triggered.
   */
  processOnError(error: string): void;
}>;

export type AdheseSlotContext = BaseAdheseSlot;

type ReadonlyProps = 'type' | 'name' | 'format' | 'location' | 'status' | 'isDisposed' | 'element' | 'id';

export type AdheseSlot = Omit<BaseAdheseSlot, ReadonlyProps> & Readonly<Pick<BaseAdheseSlot, ReadonlyProps>>;
