import { createRoot } from 'react-dom/client';
import type { AdheseContext } from '@core';
import { App } from './App';

export function createAdheseDevtools(element: HTMLElement, context: AdheseContext): () => void {
  const root = createRoot(element);

  root.render(<App adheseContext={context} />);

  return root.unmount.bind(null);
}
