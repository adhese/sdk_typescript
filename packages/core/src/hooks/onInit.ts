import { logger } from '@core';
import { createHook } from './createHook';

let resolveOnInitPromise = (): void => {};
let isInit = false;
const waitOnInit = new Promise<void>((resolve) => {
  resolveOnInitPromise = resolve;
});

const [runOnInit, onInit] = createHook({
  onRun() {
    isInit = true;

    resolveOnInitPromise();

    logger.debug('Initialization completed');
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
