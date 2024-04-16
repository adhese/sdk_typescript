import { createRoot } from 'react-dom/client';
import type { AdheseContext } from '@adhese/sdk';
import { StrictMode } from 'react';
import { Devtools } from './Devtools';

export function createAdheseDevtools(element: HTMLElement, context: AdheseContext): () => void {
  const root = createRoot(element);

  root.render((
    <StrictMode>
      <Devtools adheseContext={context} />
    </StrictMode>
  ));

  return () => {
    root.unmount();
  };
}
