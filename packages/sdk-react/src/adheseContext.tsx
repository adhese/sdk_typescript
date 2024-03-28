import {
  type PropsWithChildren,
  type ReactElement,
  createContext,
  useContext,
  useSyncExternalStore,
} from 'react';
import { type Adhese, type AdheseOptions, createAdhese } from '@adhese/sdk';
import { isEqual } from 'lodash-es';

const listeners = new Set<() => void>();
let cachedAdhese: Adhese | null = null;
let adhesePromise: Promise<Adhese> | null = null;
let cachedOptions: AdheseOptions | null = null;

function subscribe(callback: () => void): () => void {
  listeners.add(callback);

  return () => {
    listeners.delete(callback);

    for (const listener of listeners)
      listener();
  };
}

function getSnapshot(options: AdheseOptions): Adhese | null {
  if ((!cachedAdhese && !adhesePromise) || !isEqual(options, cachedOptions)) {
    cachedOptions = options;
    adhesePromise = createAdhese(options).then((value) => {
      cachedAdhese?.dispose();
      adhesePromise = null;
      cachedAdhese = value;

      for (const listener of listeners)
        listener();

      return value;
    });
  }

  return cachedAdhese;
}

const adheseContext = createContext<Adhese | null>(null);

/**
 * Provider to create an Adhese instance with the given options. Via the `useAdhese` hook, the Adhese instance can be
 * used in all child components.
 * @param children The children to render
 * @param options The options to create the Adhese instance with. When the options change, the Adhese instance will be recreated.
 * @constructor
 */
// eslint-disable-next-line ts/naming-convention
export function AdheseProvider({ children, options }: PropsWithChildren<{ options: AdheseOptions }>): ReactElement {
  const adhese: Adhese | null = useSyncExternalStore(subscribe, getSnapshot.bind(null, options), () => null);

  return (
    <adheseContext.Provider value={adhese}>
      {children}
    </adheseContext.Provider>
  );
}

/**
 * Hook to get the Adhese instance from the nearest `AdheseProvider`. When the Adhese instance is not available yet, `null`
 */
export function useAdhese(): Adhese | null {
  return useContext(adheseContext);
}
