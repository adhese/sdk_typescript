import type { AdheseContext } from '@adhese/sdk';
import { watch } from '@adhese/sdk-shared';
import { createContext, type PropsWithChildren, type ReactElement, useContext, useEffect, useState } from 'react';

const adheseContext = createContext<AdheseContext | undefined>(undefined);

// eslint-disable-next-line ts/naming-convention
export function AdheseProvider({ adhese, children }: PropsWithChildren<{
  adhese: AdheseContext;
}>): ReactElement {
  const [state, setState] = useState(adhese);

  useEffect(() => watch(adhese, (newValue) => {
    setState({ ...newValue });
  }, { immediate: true, deep: true }), [adhese]);

  return <adheseContext.Provider value={state}>{children}</adheseContext.Provider>;
}

export function useAdheseContext(): AdheseContext | undefined {
  return useContext(adheseContext);
}
