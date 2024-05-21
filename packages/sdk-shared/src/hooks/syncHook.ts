import { add } from './hooks.utils';

export function createSyncHook<
  T = void,
  U extends (arg: T) => T | void | Promise<void> = (arg: T) => T | void | Promise<void>,
>(
  {
    onRun,
    onAdd,
  }: {
    onRun?(callbacks?: Set<U>): void;
    onAdd?(callbacks?: Set<U>): void;
  } = {},
): [
  run: (arg: T) => T,
  add: (callback: U) => () => void,
  dispose: () => void,
  ] {
  const callbacks = new Set<U>();

  function run(arg: T): T {
    let latestResult: T = arg;

    const promisedCallbacks: Array<U> = [];

    for (const callback of callbacks) {
      if (callback.constructor.name === 'AsyncFunction')
        promisedCallbacks.push(callback);
      else
        latestResult = callback(latestResult) as T ?? latestResult;
    }

    // eslint-disable-next-line no-console
    Promise.allSettled(promisedCallbacks.map(callback => callback(latestResult))).catch(console.trace);

    onRun?.(callbacks);

    return latestResult;
  }

  function dispose(): void {
    callbacks.clear();
  }

  return [run, (callback): () => void => add<U>(callback, { callbacks, onAdd }), dispose];
}
