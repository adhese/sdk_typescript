import type { AdheseAd, AdheseContext } from '@adhese/sdk';
import type { createAsyncHook, createPassiveHook, Merge, Ref } from '@adhese/sdk-shared';

export type RenderMode = 'iframe' | 'inline' | 'none';
export type AdheseSlotHooks = {
  /**
   * Hook that is called when the format of the slot changes.
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
   * Hook that is called when the slot is empty.
   */
  onEmpty: ReturnType<typeof createPassiveHook>[1];
  /**
   * Hook that is called when the slot encounters an error.
   */
  onError: ReturnType<typeof createPassiveHook<Error>>[1];
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
   * - `rendered`: The slot has rendered the ad
   * - `error`: The slot has encountered an error
   */
  status: 'initializing' | 'initialized' | 'loading' | 'loaded' | 'empty' | 'rendering' | 'rendered' | 'error';
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
   * Process the onEmpty hook when a slot is not filled with an Ad.
   */
  processOnEmpty(): void;
}>;

export type AdheseSlotContext = BaseAdheseSlot;

type ReadonlyProps = 'type' | 'name' | 'format' | 'location' | 'status' | 'isDisposed' | 'element' | 'id';

export type AdheseSlot = Omit<BaseAdheseSlot, ReadonlyProps> & Readonly<Pick<BaseAdheseSlot, ReadonlyProps>>;
