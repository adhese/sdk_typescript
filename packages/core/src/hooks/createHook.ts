export function createHook<T extends Function>(
  {
    onRun,
    onAdd,
  }: {
    onRun?(): void;
    onAdd?(): void;
  },
): [() => void, (callback: T) => void] {
  const callbacks = new Set<T>();

  function run(): void {
    for (const callback of callbacks)
      callback();

    onRun?.();
  }

  function add(callback: T): void {
    callbacks.add(callback);

    onAdd?.();
  }

  return [run, add];
}
