import { logger } from '../logger/logger';
import { createHook } from './createHook';

let resolveOnDisposePromise = (): void => {};
let isDisposed = false;

const waitOnDispose = new Promise<void>((resolve) => {
  resolveOnDisposePromise = resolve;
});

const [runOnDispose, onDispose, disposeOnDispose] = createHook({
  onRun(callbacks) {
    isDisposed = true;

    resolveOnDisposePromise();

    logger.debug('Disposal completed');

    callbacks.clear();
  },
  onAdd() {
    if (isDisposed)
      runOnDispose();
  },
});

export {
  onDispose,
  runOnDispose,
  waitOnDispose,
  disposeOnDispose,
};
