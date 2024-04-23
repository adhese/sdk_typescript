import { createSyncHook } from './createHook';

let isDisposed = false;

const [runOnDispose, onDispose] = createSyncHook('onDispose', {
  onRun(callbacks) {
    isDisposed = true;

    callbacks?.clear();
  },
  onAdd() {
    if (isDisposed)
      runOnDispose();
  },
});

export {
  onDispose,
  runOnDispose,
};
