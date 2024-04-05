export function createHook<T extends Function>(
  {
    onRun,
    onAdd,
  }: {
    onRun?(callbacks: Set<T>): void;
    onAdd?(callbacks: Set<T>): void;
  },
): [() => void, (callback: T) => void] {
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

  return [run, add];
}
