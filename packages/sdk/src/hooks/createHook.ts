export function createHook<T extends Function>(
  {
    onRun,
    onAdd,
    onDispose,
  }: {
    onRun?(callbacks: Set<T>): void;
    onAdd?(callbacks: Set<T>): void;
    onDispose?(callbacks: Set<T>): void;
  },
): [
    run: () => void,
    add: (callback: T) => void,
    dispose: () => void,
  ] {
  const callbacks = new Set<T>();

  function run(): void {
    for (const callback of callbacks)
      callback();

    onRun?.(callbacks);
  }

  function add(callback: T): void {
    callbacks.add(callback);

    onAdd?.(callbacks);
  }

  function dispose(): void {
    onDispose?.(callbacks);

    callbacks.clear();
  }

  return [run, add, dispose];
}
