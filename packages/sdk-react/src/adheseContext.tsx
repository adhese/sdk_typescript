'use client';

import {
  type PropsWithChildren,
  type ReactElement,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { type Adhese, type AdheseOptions, createAdhese } from '@adhese/sdk';

const adheseContext = createContext<Adhese | undefined>(undefined);

/**
 * Provider to create an Adhese instance with the given options. Via the `useAdhese` hook, the Adhese instance can be
 * used in all child components.
 * @constructor
 */
// eslint-disable-next-line ts/naming-convention
export function AdheseProvider({ children, options }: PropsWithChildren<{ options?: AdheseOptions }>): ReactElement {
  const [adhese, setAdhese] = useState<Adhese | undefined>(undefined);

  useEffect(() => {
    let instance: Adhese | undefined;

    if (!options)
      return;

    setAdhese((current) => {
      instance = createAdhese(options);
      current?.dispose();

      return instance;
    });

    return (): void => {
      instance?.dispose();
    };
  }, [options]);

  return (
    <adheseContext.Provider value={adhese}>
      {children}
    </adheseContext.Provider>
  );
}

/**
 * Hook to get the Adhese instance from the nearest `AdheseProvider`. When the Adhese instance is not available yet, `null`
 */
export function useAdhese(): Adhese | undefined {
  return useContext(adheseContext);
}
