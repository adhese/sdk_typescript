import { type Adhese, type AdheseOptions, createAdhese } from '@core';
import { type PropsWithChildren, type ReactElement, createContext, useContext, useSyncExternalStore } from 'react';
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

// eslint-disable-next-line ts/naming-convention
export function AdheseProvider({ children, options }: PropsWithChildren<{ options: AdheseOptions }>): ReactElement {
  const adhese = useSyncExternalStore(subscribe, getSnapshot.bind(null, options), () => null);

  return (
    <adheseContext.Provider value={adhese}>
      {children}
    </adheseContext.Provider>
  );
}

export function useAdhese(): Adhese | null {
  return useContext(adheseContext);
}
