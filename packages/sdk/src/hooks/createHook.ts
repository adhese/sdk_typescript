const hookMap = new Map<string, Set<Function>>();

export function clearAllHooks(): void {
  hookMap.clear();
}

export function createHook<
  Argument = void,
  Callback extends (() => void | Promise<void>) | ((arg: Argument) => Argument | void | Promise<Argument | void>) = Argument extends void ?
      () => void | Promise<void> :
      (arg: Argument) => Argument | void | Promise<Argument | void>,
>(
  name: string,
  {
    onRun,
    onAdd,
  }: {
    onRun?(callbacks?: Set<Callback>): void;
    onAdd?(callbacks?: Set<Callback>): void;
  } = {},
): [
  run: Argument extends void ? () => Promise<void> : (arg: Argument) => Promise<Argument>,
  add: (callback: Callback) => () => void,
  ] {
  hookMap.set(name, new Set<Callback>());

  const run = (async (arg) => {
    let latestResult: Argument = arg;

    for (const callback of hookMap.get(name) ?? [])
      // eslint-disable-next-line no-await-in-loop
      latestResult = (await callback(latestResult) as Argument) ?? latestResult;

    onRun?.(hookMap.get(name) as Set<Callback>);

    return latestResult;
  }) as Argument extends void ? () => Promise<void> : (arg: Argument) => Promise<Argument>;

  function add(callback: Callback): () => void {
    const hookSet = hookMap.get(name);

    if (hookSet)
      hookSet.add(callback);
    else
      hookMap.set(name, new Set([callback]));

    onAdd?.(hookSet as Set<Callback>);

    return () => {
      hookMap.get(name)?.delete(callback);
    };
  }

  return [run, add];
}
