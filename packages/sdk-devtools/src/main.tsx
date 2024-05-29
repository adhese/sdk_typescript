import { createRoot } from 'react-dom/client';
import type { AdheseContext } from '@adhese/sdk';
import { StrictMode } from 'react';
import { Devtools } from './Devtools';
import { AdheseProvider } from './AdheseContext';

export function createAdheseDevtools(element: HTMLElement, context: AdheseContext): () => void {
  const root = createRoot(element);

  root.render((
    <StrictMode>
      <AdheseProvider adhese={context}>
        <Devtools />
      </AdheseProvider>
    </StrictMode>
  ));

  return () => {
    root.unmount();
  };
}
