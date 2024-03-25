import { createRoot } from 'react-dom/client';
import type { AdheseContext } from '@core';
import { Devtools } from './Devtools';

export function createAdheseDevtools(element: HTMLElement, context: AdheseContext): () => void {
  const root = createRoot(element);

  root.render(<Devtools adheseContext={context} />);

  return () => {
    root.unmount();
  };
}
