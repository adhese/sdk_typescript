import { logger } from '../logger/logger';
import { createHook } from './createHook';

let isDisposed = false;

const [runOnDispose, onDispose] = createHook('onDispose', {
  onRun(callbacks) {
    isDisposed = true;

    logger.debug('Disposal completed');

    callbacks?.clear();
  },
  onAdd() {
    if (isDisposed)
      runOnDispose().catch(logger.error);
  },
});

export {
  onDispose,
  runOnDispose,
};
