import { debounce } from 'lodash-es';
import { logger } from '@core';

export type DeviceDetectorOptions = {
  queries?: Record<string, string>;
  onChange?(device: string): void | Promise<void>;
};

export type DeviceDetector = {
  /**
   * Map of passed media queries
   */
  queries: Map<string, MediaQueryList>;
  /**
   * Get the current active device
   */
  getDevice(): string;
  /**
   * Clean up all event listeners. After this the instance will no longer react to changes
   */
  dispose(): void;
};

/**
 * Create a device detector that will match a list of media queries and keeps track of the current matching device
 *
 * @param options
 * @param options.onChange - Callback to fire when the device changes
 * @param options.queries Map of devices, and it's media query to match
 */
export function createDeviceDetector(
  {
    onChange,
    queries = {
      mobile: '(max-width: 768px) and (pointer: coarse)',
      tablet: '(min-width: 769px) and (max-width: 1024px) and (pointer: coarse)',
      desktop: '(min-width: 1025px) and (pointer: fine)',
    },
  }: DeviceDetectorOptions = {},
): DeviceDetector {
  const mediaMap = new Map(
    Object.entries(queries).map(([key, query]) => [key, window.matchMedia(query)]),
  );

  function getDevice(): string {
    for (const [device, query] of Object.entries(queries)) {
      if (window.matchMedia(query).matches)
        return device;
    }

    return 'unknown';
  }

  const handleOnChange = debounce((): void => {
    // eslint-disable-next-line no-void
    void onChange?.(getDevice());

    logger.debug(`Change device ${getDevice()}`);
  }, 50);

  if (onChange) {
    for (const query of mediaMap.values())
      query.addEventListener('change', handleOnChange);
  }

  function dispose(): void {
    for (const query of mediaMap.values())
      query.removeEventListener('change', handleOnChange);
  }

  return {
    queries: mediaMap,
    getDevice,
    dispose,
  };
}