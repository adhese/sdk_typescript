import { logger } from '../logger/logger';
import { createHook } from './createHook';

let resolveOnInitPromise = (): void => {};
let isInit = false;
const waitOnInit = new Promise<void>((resolve) => {
  resolveOnInitPromise = resolve;
});

const [runOnInit, onInit] = createHook('onInit', {
  onRun(callbacks) {
    isInit = true;

    resolveOnInitPromise();

    logger.debug('Initialization completed');

    callbacks?.clear();
  },
  onAdd() {
    if (isInit)
      runOnInit().catch(logger.error);
  },
});

export {
  onInit,
  runOnInit,
  waitOnInit,
};
