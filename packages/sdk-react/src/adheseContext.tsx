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
 * @param children The children to render
 * @param options The options to create the Adhese instance with. When the options change, the Adhese instance will be recreated.
 * @constructor
 */
// eslint-disable-next-line ts/naming-convention
export function AdheseProvider({ children, options }: PropsWithChildren<{ options: AdheseOptions }>): ReactElement {
  const [adhese, setAdhese] = useState<Adhese | undefined>(undefined);

  useEffect(() => {
    const instance = createAdhese(options);
    setAdhese(instance);

    return (): void => {
      instance.dispose();
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
