/* v8 ignore start */
import type { Merge } from '@utils';
import type { Ad } from '../../requestAds/requestAds.schema';
import type { AdheseContext } from '../../main.types';

export type AdheseSlotOptions = {
  /**
   * The format code of the slot. Used to find the correct element on the page to render the ad in.
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
   * Callback that is called when the slot is disposed.
   */
  onDispose?(): void;
  /**
   * Callback that is called when the format of the slot changes.
   */
  onNameChange?(newName: string, oldName: string): void;
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
   * The location of the slot. This is the location that is used to determine the current page URL.
   */
  location: string;
  /**
   * The parameters that are used to render the ad.
   */
  parameters: Map<string, ReadonlyArray<string> | string>;
  /**
   * Renders the slot in the containing element. If no ad is provided, a new ad will be requested from the API.
   */
  render(ad?: Ad): Promise<HTMLElement>;
  /**
   * Returns the rendered element.
   */
  getElement(): HTMLElement | null;
  /**
   * Returns the name of the slot.
   */
  getName(): string;
  /**
   * Returns the ad that is to be rendered in the slot or is currently rendered in the slot.
   */
  getAd(): Ad | null;
  /**
   * Sets the ad that is to be rendered in the slot. If the slot is in the viewport, the ad will be rendered immediately.
   */
  setAd(ad: Ad): Promise<void>;
  /**
   * Returns whether the viewability tracking pixel has been fired.
   */
  isViewabilityTracked(): boolean;
  /**
   * Returns whether the impression tracking pixel has been fired.
   */
  isImpressionTracked(): boolean;
  /**
   * Sets the format of the slot. This is used to change the format of the slot after it has been created.
   */
  setFormat(format: string): Promise<void>;
  /**
   * Returns the format of the slot.
   */
  getFormat(): string;
  /**
   * Removes the slot from the DOM and cleans up the slot instance.
   */
  dispose(): void;
}>;
