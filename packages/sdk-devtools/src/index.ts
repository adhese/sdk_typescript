import type { AdheseContext, AdhesePlugin } from '@adhese/sdk';
import { watch } from '@adhese/sdk-shared';
import { lazy } from 'react';

export const devtoolsPlugin: AdhesePlugin = (context: AdheseContext, {
  hooks: {
    onInit,
    onDispose,
  },
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

  onInit(() => {
    watch(() => [context.debug, context.isDisposed], async ([debug, isDisposed]) => {
      if (debug && !isDisposed) {
        await initDevtools();

        if (context.isDisposed)
          dispose();
      }
      else {
        dispose();
      }
    }, {
      immediate: true,
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
