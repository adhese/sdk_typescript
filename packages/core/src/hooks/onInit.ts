import { logger } from '@core';
import { createHook } from './createHook';

let resolveOnInitPromise = (): void => {};
let isInit = false;
const waitOnInit = new Promise<void>((resolve) => {
  resolveOnInitPromise = resolve;
});

const [runOnInit, onInit] = createHook({
  onRun(callbacks) {
    isInit = true;

    resolveOnInitPromise();

    logger.debug('Initialization completed');

    callbacks.clear();
  },
  onAdd() {
    if (isInit)
      runOnInit();
  },
});

export {
  onInit,
  runOnInit,
  waitOnInit,
};
