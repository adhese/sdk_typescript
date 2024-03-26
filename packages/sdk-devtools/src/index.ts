import type { AdheseContext } from '@adhese/sdk';
import { lazy } from 'react';

export async function createDevtools(context: AdheseContext): Promise<() => void> {
  const main = await import('./main');

  const wrapperElement = document.createElement('div');
  document.body.appendChild(wrapperElement);

  const unmount = main.createAdheseDevtools(wrapperElement, context);

  return () => {
    unmount();
    wrapperElement.outerHTML = '';
  };
}

// eslint-disable-next-line ts/naming-convention
export const Devtools = lazy(() => import('./Devtools').then(module => ({ default: module.Devtools })));
