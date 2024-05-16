import type { Merge, Ref } from '@adhese/sdk-shared';
import type { AdheseContext } from '@adhese/sdk';
import type { createAsyncHook, createPassiveHook } from '../hooks/createHook';

export type RenderMode = 'iframe' | 'inline' | 'none';
export type SlotHooks<T> = {
  /**
   * Hook that is called when the format of the slot changes.
   */
  onBeforeRender: ReturnType<typeof createAsyncHook<T>>[1];
  /**
   * Hook that is called when the slot is rendered.
   */
  onRender: ReturnType<typeof createAsyncHook<T>>[1];
  /**
   * Hook that is called when the slot is requested from the server.
   */
  onRequest: ReturnType<typeof createAsyncHook<void>>[1];
  /**
   * Hook that is called when the slot is disposed.
   */
  onDispose: ReturnType<typeof createPassiveHook>[1];
};

export type BaseSlotOptions = {
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

export type BaseSlotOptionsWithSetup<T extends BaseSlot<U>, U = unknown> = BaseSlotOptions & {
  /**
   * Special callback that is run when the slot is initialized. It passes the slot context ref object and a special
   * plugin object that contains a set of hooks you can use to hook into different moments of the slots lifecycle.
   */
  setup?(context: Ref<T | null>, hooks: SlotHooks<U>): void;
};

export type BaseSlot<T = unknown> = Merge<Omit<BaseSlotOptions, 'onDispose' | 'context' | 'onFormatChange' | 'format'>, SlotHooks<T> & {
  /**
   * The type of the slot. This is useful if you want to differentiate between different types of slots which can have
   * different behavior and data types.
   */
  readonly type: string;
  /**
   * The name of the slot. This is used to identify the slot in the Adhese instance.
   *
   * The name is generated based on the location, format, and slot of the slot.
   */
  readonly name: string;
  /**
   * The format code of the slot. Used to find the correct element on the page to render the ad in.
   *
   * If the format is a string, it is used as the format code. If the format is an array, the format code is determined
   * by the query detector.
   *
   * When you change the format, the slot will request a new ad from the API automatically.
   */
  readonly format: string;
  /**
   * The location of the slot. This is the location that is used to determine the current page URL.
   */
  readonly location: string;
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
  readonly status: 'initializing' | 'initialized' | 'loading' | 'loaded' | 'empty' | 'rendering' | 'rendered' | 'error';
  /**
   * Is the slot disposed.
   */
  readonly isDisposed: boolean;
  /**
   * The element that contains the slot.
   */
  readonly element: HTMLElement | null;
  /**
   * Unique identifier of the slot. ID is generated on initialization and will never change.
   */
  readonly id: string;
  /**
   * Slot related data fetched from the API.
   */
  data: T | null;
  /**
   * Renders the slot in the containing element. If no data is provided, new data will be requested from the API.
   */
  render(data?: T): Promise<HTMLElement | null>;
  /**
   * Requests a new ad from the API and returns the ad object.
   */
  request(): Promise<T | null>;
  /**
   * Remove the HTML element contents from the dom.
   */
  cleanElement(): void;
  /**
   * Removes the slot from the DOM and cleans up the slot instance.
   */
  dispose(): void;
}>;
