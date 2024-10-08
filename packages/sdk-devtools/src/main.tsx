import type { AdheseContext } from '@adhese/sdk';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdheseProvider } from './AdheseContext';
import { Devtools } from './Devtools';

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
