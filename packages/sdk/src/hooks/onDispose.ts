import { createHook } from './createHook';

let isDisposed = false;

const [runOnDispose, onDispose] = createHook('onDispose', {
  onRun(callbacks) {
    isDisposed = true;

    callbacks?.clear();
  },
  onAdd() {
    if (isDisposed)
      runOnDispose().catch(console.error);
  },
});

export {
  onDispose,
  runOnDispose,
};
