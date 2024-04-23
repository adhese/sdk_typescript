import { createSyncHook } from './createHook';

let resolveOnInitPromise = (): void => {};
let isInit = false;
const waitOnInit = new Promise<void>((resolve) => {
  resolveOnInitPromise = resolve;
});

const [runOnInit, onInit] = createSyncHook('onInit', {
  onRun(callbacks) {
    isInit = true;

    resolveOnInitPromise();

    callbacks?.clear();
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
