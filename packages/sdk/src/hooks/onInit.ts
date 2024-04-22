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

    callbacks?.clear();
  },
  onAdd() {
    if (isInit)
      runOnInit().catch(console.error);
  },
});

export {
  onInit,
  runOnInit,
  waitOnInit,
};
