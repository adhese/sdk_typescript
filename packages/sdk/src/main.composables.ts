import { watch } from '@adhese/sdk-shared';
import type { AdheseContextState, MergedOptions } from './main.types';
import { useQueryDetector } from './queryDetector/queryDetector';

export function useMainQueryDetector(mergedOptions: MergedOptions, context: AdheseContextState): void {
  const [device] = useQueryDetector(context, mergedOptions.queries);
  watch(device, async (newDevice) => {
    context.device = newDevice;

    context.parameters?.set('dt', newDevice);
    context.parameters?.set('br', newDevice);

    await Promise.allSettled(context.getAll().map(slot => slot.request()));
  }, { immediate: true });
}

export function useMainDebugMode(context: AdheseContextState): void {
  watch(() => context.debug, async (newDebug) => {
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
    context.logger.info('Adhese instance disposed');
  });
}

export function useMainParameters(context: AdheseContextState, options: MergedOptions): void {
  const parameters = new Map<string, string | ReadonlyArray<string>>();

  if (options.logReferrer)
    parameters.set('re', btoa(document.referrer));

  if (options.logUrl)
    parameters.set('ur', btoa(window.location.href));

  for (const [key, value] of Object.entries({
    ...options.parameters ?? {},
    rn: Math.round(Math.random() * 10_000).toString(),
  }))
    parameters.set(key, value);

  context.parameters = parameters;

  watch(
    () => context.parameters,
    (newParameters) => {
      context.events?.parametersChange.dispatch(newParameters);
    },
    {
      deep: true,
    },
  );
}
