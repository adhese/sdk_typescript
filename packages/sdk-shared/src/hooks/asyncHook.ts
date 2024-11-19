import { add } from './hooks.utils';

export function createAsyncHook<
  T = void,
  U extends (arg: T) => T | void | Promise<T | void> = (arg: T) => T | void | Promise<T | void>,
>(
  {
    onRun,
    onAdd,
  }: {
    onRun?(callbacks?: Set<U>): void;
    onAdd?(callbacks?: Set<U>): void;
  } = {},
): [
  run: (arg: T) => Promise<T>,
  add: (callback: U) => () => void,
  dispose: () => void,
  ] {
  const callbacks = new Set<U>();

  async function run(arg: T): Promise<T> {
    if (arg) {
      let latestResult: T = arg;

      for (const callback of callbacks)
        // eslint-disable-next-line no-await-in-loop
        latestResult = (await callback(latestResult)) ?? latestResult;

      onRun?.(callbacks);

      return latestResult;
    }

    // eslint-disable-next-line no-console
    Promise.allSettled(Array.from(callbacks).map(async callback => callback(arg))).catch(console.trace);

    onRun?.(callbacks);

    return arg;
  }

  function dispose(): void {
    callbacks.clear();
  }

  return [run, (callback): () => void => add<U>(callback, { callbacks, onAdd }), dispose];
}
