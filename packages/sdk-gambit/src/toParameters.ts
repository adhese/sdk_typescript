import { isArray } from '@adhese/sdk-shared';
import type { GambitParameters } from './gambit';

/**
 * Converts `GambitData` to `Parameters`.
 * @param parameters - Parameters to be converted.
 * @param parameterMap - Map of Gambit parameters to their corresponding keys.
 */
export function toParameters(parameters: Record<string, string | ReadonlyArray<string> | boolean>, parameterMap: Record<string, string>): GambitParameters {
  const map = new Map<string, string | ReadonlyArray<string>>();

  for (let [key, value] of Object.entries(parameters)) {
    key = parameterMap[key];
    value = isArray(value) ? value : String(value);

    const currentValue = map.get(key);

    if (key) {
      if (currentValue) {
        value = typeof value === 'string' ? [value] : [...value];

        if (typeof currentValue === 'string')
          map.set(key, [currentValue, ...value]);
        else
          map.set(key, [...currentValue, ...value]);
      }
      else {
        map.set(key, value);
      }
    }
  }

  return Object.fromEntries(map);
}
