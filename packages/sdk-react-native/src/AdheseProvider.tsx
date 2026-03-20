import type { Adhese, AdheseOptions } from '@adhese/sdk/core';
import {
  createContext,
  type PropsWithChildren,
  type ReactElement,
  useContext,
  useEffect,
  useState,
} from 'react';
import { createAdheseNative } from './createAdheseNative';

const adheseContext = createContext<Adhese | undefined>(undefined);

/**
 * Provider to create an Adhese instance for React Native with the given options.
 * Via the `useAdhese` hook, the Adhese instance can be used in all child components.
 */
export function AdheseProvider({ children, options }: PropsWithChildren<{ options?: AdheseOptions }>): ReactElement {
  const [adhese, setAdhese] = useState<Adhese | undefined>(undefined);

  useEffect(() => {
    let instance: Adhese | undefined;

    if (!options)
      return;

    setAdhese((current) => {
      instance = createAdheseNative(options);
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
 * Hook to get the Adhese instance from the nearest `AdheseProvider`.
 */
export function useAdhese(): Adhese | undefined {
  return useContext(adheseContext);
}
