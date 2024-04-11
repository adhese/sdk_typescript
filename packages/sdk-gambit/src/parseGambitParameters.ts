import isArray from 'lodash/isArray';
import type { GambitData, Parameters } from './gambit.types';

const gambitParameters = {
  position: 'ps',
  consent: 'tl',
  pageType: 'pt',
  category: 'ct',
  subCategory: 'ct',
  productGroup: 'ct',
  searchTerm: 'kw',
  userId: 'mi',
  userMode: 'um',
  inOrderMode: 'om',
  customerType: 'cu',
  pagePath: 'pp',
  domain: 'dm',
} as const;

/**
 * Converts `GambitData` to `Parameters`.
 * @param parameters
 */
export function parseGambitParameters(parameters: Partial<GambitData>): Parameters {
  const map = new Map<string, string | ReadonlyArray<string>>();

  for (let [key, value] of Object.entries(parameters)) {
    key = gambitParameters[key as keyof typeof gambitParameters];
    value = isArray(value) ? value as ReadonlyArray<string> : String(value);

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
