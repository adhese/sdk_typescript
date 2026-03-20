import type { AdheseContextState, MergedOptions } from '@adhese/sdk/core';
import { watch } from '@adhese/sdk-shared/core';

/**
 * Initialize parameters for React Native.
 * Unlike the web version, this does not set `re` (referrer) or `ur` (URL) parameters
 * since those concepts don't exist in React Native.
 */
export function useParameters(context: AdheseContextState, options: MergedOptions): void {
  const parameters = new Map<string, string | ReadonlyArray<string>>();

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
