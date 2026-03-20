import type { AdheseContextState, MergedOptions } from '@adhese/sdk/core';
import { Dimensions } from 'react-native';

/**
 * Device detection for React Native using Dimensions API.
 * Sets `dt` and `br` parameters based on screen width breakpoints.
 */
export function useDeviceDetection(context: AdheseContextState, _options: MergedOptions): void {
  function detectDevice(): string {
    const { width } = Dimensions.get('window');

    if (width <= 768)
      return 'phone';
    if (width <= 1024)
      return 'tablet';
    return 'desktop';
  }

  const device = detectDevice();
  context.device = device;
  context.parameters?.set('dt', device);
  context.parameters?.set('br', device);

  const subscription = Dimensions.addEventListener('change', () => {
    const newDevice = detectDevice();
    context.device = newDevice;
    context.parameters?.set('dt', newDevice);
    context.parameters?.set('br', newDevice);
  });

  context.hooks.onDispose(() => {
    subscription.remove();
  });
}
