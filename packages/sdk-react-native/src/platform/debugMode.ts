import type { AdheseContextState } from '@adhese/sdk/core';
import { watch } from '@adhese/sdk-shared/core';

/**
 * Debug mode handler for React Native.
 * Unlike the web version, does not check window.location.search for debug flags.
 */
export function useDebugMode(context: AdheseContextState): void {
  watch(() => context.debug, (newDebug) => {
    if (newDebug) {
      context.logger.setMinLogLevelThreshold('debug');
      context.logger.debug('Debug mode enabled');
      context.events?.debugChange.dispatch(true);
    }
    else {
      context.logger.debug('Debug mode disabled');
      context.logger.setMinLogLevelThreshold('info');
      context.events?.debugChange.dispatch(false);
    }
  }, {
    immediate: true,
  });

  context.hooks.onDispose(() => {
    context.logger.resetLogs();
    context.logger.debug('Adhese instance disposed');
  });
}
