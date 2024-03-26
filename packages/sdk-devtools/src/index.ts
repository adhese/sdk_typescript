import type { AdheseContext } from '@adhese/sdk';
import { lazy } from 'react';

export async function createDevtools(context: AdheseContext): Promise<() => void> {
  const devtools = await import('@devtools');

  const wrapperElement = document.createElement('div');
  document.body.appendChild(wrapperElement);

  const unmount = devtools.createAdheseDevtools(wrapperElement, context);

  return () => {
    unmount();
    wrapperElement.outerHTML = '';
  };
}

// eslint-disable-next-line ts/naming-convention
export const Devtools = lazy(() => import('@devtools').then(module => ({ default: module.Devtools })));
