/* v8 ignore start */
import type { Merge } from '@adhese/sdk-shared';
import type { ComputedRef, Ref } from '@vue/runtime-core';
import type { Ad } from '../../requestAds/requestAds.schema';
import type { AdheseContext } from '../../main.types';

export type RenderMode = 'iframe' | 'inline';

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
   * Callback that is called when the slot is disposed.
   */
  onDispose?(): void;
  /**
   * Callback that is called when the format of the slot changes.
   */
  onNameChange?(newName: string, oldName: string): void;
  /**
   * Callback that is called when the slot is rendered.
   */
  onRender?(element: HTMLElement): void;
  /**
   * Callback that is called before the ad is rendered. This can be used to modify the ad before it is rendered.
   * Particularly useful for rendering ads with custom HTML if the ad tag contains a JSON object.
   */
  onBeforeRender?(ad: Ad): Ad | void;
  /**
   * Callback that is called when the viewability of the slot changes.
   */
  onViewabilityChanged?(isViewable: boolean): void;
  /**
   * Callback that is called when the request for the slot returns an empty response. This can happen for multiple
   * reasons, for example when the slot is not sold to a buyer.
   */
  onEmpty?(): void;
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

export type AdheseSlot = Merge<Omit<AdheseSlotOptions, 'onDispose' | 'context' | 'onFormatChange' | 'format'>, {
  /**
   * The name of the slot. This is used to identify the slot in the Adhese instance.
   *
   * The name is generated based on the location, format, and slot of the slot.
   */
  name: ComputedRef<string>;
  /**
   * The format code of the slot. Used to find the correct element on the page to render the ad in.
   *
   * If the format is a string, it is used as the format code. If the format is an array, the format code is determined
   * by the query detector.
   *
   * When you change the format, the slot will request a new ad from the API automatically.
   */
  format: Ref<string>;
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
  isViewabilityTracked: ComputedRef<boolean>;
  /**
   * Whether the impression tracking pixel has been fired.
   */
  isImpressionTracked: ComputedRef<boolean>;
  /**
   * Ad object that is fetched from the API.
   */
  ad: Ref<Ad | null>;
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
  status: Ref<'initializing' | 'initialized' | 'loading' | 'loaded' | 'empty' | 'rendering' | 'rendered' | 'error'>;
  /**
   * Renders the slot in the containing element. If no ad is provided, a new ad will be requested from the API.
   */
  render(ad?: Ad): Promise<HTMLElement | null>;
  /**
   * Returns the rendered element.
   */
  getElement(): HTMLElement | null;
  /**
   * Requests a new ad from the API and returns the ad object.
   */
  request(): Promise<Ad | null>;
  /**
   * Removes the slot from the DOM and cleans up the slot instance.
   */
  dispose(): void;
}>;
