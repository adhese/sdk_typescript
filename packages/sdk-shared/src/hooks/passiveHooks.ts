import { add } from './hooks.utils';

export function createPassiveHook<
  T = void,
  U extends (arg: T) => void | Promise<void> = (arg: T) => void | Promise<void>,
>(
  {
    onRun,
    onAdd,
  }: {
    onRun?(callbacks?: Set<U>): void;
    onAdd?(callbacks?: Set<U>): void;
  } = {},
): [
  run: (arg: T) => void,
  add: (callback: U) => () => void,
  dispose: () => void,
  ] {
  const callbacks = new Set<U>();

  function run(arg: T): void {
    // eslint-disable-next-line no-console
    Promise.allSettled(Array.from(callbacks).map(callback => callback(arg))).catch(console.trace);

    onRun?.(callbacks);
  }

  function dispose(): void {
    callbacks.clear();
  }

  return [run, (callback): () => void => add<U>(callback, { callbacks, onAdd }), dispose];
}
