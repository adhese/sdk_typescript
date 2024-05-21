const hookMap = new Map<string, Set<Function>>();

export function clearAllHooks(): void {
  hookMap.clear();
}

export function createAsyncHook<
  Argument = void,
  Callback extends (arg: Argument) => Argument | void | Promise<Argument | void> = (arg: Argument) => Argument | void | Promise<Argument | void>,
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
  run: (arg: Argument) => Promise<Argument>,
  add: (callback: Callback) => () => void,
  dispose: () => void,
  ] {
  hookMap.set(name, new Set<Callback>());

  const run = (async (arg) => {
    let latestResult: Argument = arg;

    for (const callback of hookMap.get(name) ?? [])
      // eslint-disable-next-line no-await-in-loop
      latestResult = (await callback(latestResult) as Argument) ?? latestResult;

    onRun?.(hookMap.get(name) as Set<Callback>);

    return latestResult;
  }) as (arg: Argument) => Promise<Argument>;

  function dispose(): void {
    hookMap.delete(name);
  }

  return [run, (callback): () => void => add<Callback>(callback, { name, onAdd }), dispose];
}

export function createSyncHook<
  Argument = void,
  Callback extends (arg: Argument) => Argument | void | Promise<void> = (arg: Argument) => Argument | void | Promise<void>,
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
  run: (arg: Argument) => Argument,
  add: (callback: Callback) => () => void,
  dispose: () => void,
  ] {
  hookMap.set(name, new Set<Callback>());

  const run = ((arg) => {
    let latestResult: Argument = arg;

    const promisedCallbacks: Array<Callback> = [];

    for (const callback of hookMap.get(name) ?? []) {
      if (isCallbackAsync(callback))
        promisedCallbacks.push(callback as Callback);
      else
        latestResult = callback(latestResult) as Argument ?? latestResult;
    }

    // eslint-disable-next-line no-console
    Promise.allSettled(promisedCallbacks.map(callback => callback(latestResult) as Argument)).catch(console.trace);

    onRun?.(hookMap.get(name) as Set<Callback>);

    return latestResult;
  }) as (arg: Argument) => Argument;

  function dispose(): void {
    hookMap.delete(name);
  }

  return [run, (callback): () => void => add<Callback>(callback, { name, onAdd }), dispose];
}

export function createPassiveHook<
  Argument = void,
  Callback extends (arg: Argument) => void | Promise<void> = (arg: Argument) => void | Promise<void>,
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
  run: (arg: Argument) => void,
  add: (callback: Callback) => () => void,
  dispose: () => void,
  ] {
  hookMap.set(name, new Set<Callback>());

  function run(arg: Argument): void {
    // eslint-disable-next-line no-console
    Promise.allSettled(Array.from(hookMap.get(name) ?? []).map(callback => callback(arg) as Callback)).catch(console.trace);

    onRun?.(hookMap.get(name) as Set<Callback>);
  }

  function dispose(): void {
    hookMap.delete(name);
  }

  return [run, (callback): () => void => add<Callback>(callback, { name, onAdd }), dispose];
}

function isCallbackAsync(callback: Function): boolean {
  return callback.constructor.name === 'AsyncFunction';
}

function add<Callback extends Function>(callback: Callback, {
  name,
  onAdd,
}: {
  name: string;
  onAdd?(hookSet: Set<Callback>): void;
}): () => void {
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
