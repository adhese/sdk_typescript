import type { AdheseContext, AdhesePlugin } from '@adhese/sdk';
import { lazy } from 'react';

export const createDevtools: AdhesePlugin = (context: AdheseContext, {
  onInit,
  onDispose,
}) => {
  const wrapperElement = document.createElement('div');
  let unmount: (() => void) | undefined;

  async function initDevtools(): Promise<void> {
    const main = await import('./main');

    if (!unmount) {
      document.body.appendChild(wrapperElement);

      unmount = main.createAdheseDevtools(wrapperElement, context);
    }
  }

  onInit(async () => {
    if (context.debug)
      await initDevtools();

    context.events?.debugChange.addListener(async (debug) => {
      if (debug)
        await initDevtools();
      else
        dispose();
    });
  });

  function dispose(): void {
    unmount?.();
    unmount = undefined;
    if (wrapperElement.parentElement)
      wrapperElement.outerHTML = '';
  }

  onDispose(dispose);
};

// eslint-disable-next-line ts/naming-convention
export const Devtools = lazy(() => import('./Devtools').then(module => ({ default: module.Devtools })));
