type Event<T> = {
  /**
   * The listeners for this event. This is a set of functions that will be called when the event is dispatched.
   */
  listeners: Set<(data: T) => void | Promise<void>>;
  /**
   * Dispatches the event to all listeners. This is a synchronous operation.
   * @param data
   */
  dispatch(data: T): void;
  /**
   * Dispatches the event to all listeners. This is an asynchronous operation.
   * @param data
   */
  dispatchAsync(data: T): Promise<void>;
  /**
   * Adds a listener to the event.
   * @param listener
   */
  addListener(listener: (data: T) => void | Promise<void>): void;
  /**
   * Removes a listener from the event.
   * @param listener
   */
  removeListener(listener: (data: T) => void | Promise<void>): void;
};

type EventManagerGroup<Events extends Record<string, unknown>> = {
  [Key in keyof Events]: Readonly<Event<Events[Key]>>;
};

export type EventManager<Events extends Record<string, unknown>> = {
  /**
   * Disposes of all listeners and clears the event manager. After calling this method, the event manager is no longer usable.
   */
  dispose(): void;
} & EventManagerGroup<Events>;

/**
 * Creates a new event manager with the given event names.
 *
 * @typeParam Events The events that the event manager will handle and their data types.
 */
export function createEventManager<
  Events extends Record<Name, unknown>,
  Name extends Readonly<string | number | symbol> = keyof Events,
>(): EventManager<Events> {
  const disposables = new Set<() => void>();

  function dispose(): void {
    for (const disposable of disposables)
      disposable();
  }

  return new Proxy<EventManager<Events>>({
    dispose,
  } as EventManager<Events>, {
    // eslint-disable-next-line ts/explicit-function-return-type
    get(target, key, receiver) {
      if (!(key in target) && typeof key === 'string') {
        const event = createEvent<Events[Name]>();

        disposables.add(() => {
          event.listeners.clear();
        });

        Reflect.set(target, key, event, receiver);
      }

      return Reflect.get(target, key, receiver);
    },
  });
}

function createEvent<T>(): Event<T> {
  const listeners = new Set<(data: T) => void | Promise<void>>();

  function dispatch(data: T): void {
    for (const listener of listeners)
      // eslint-disable-next-line no-void
      void listener(data);
  }

  async function dispatchAsync(data: T): Promise<void> {
    await Promise.allSettled(
      Array.from(listeners).map(listener => listener(data)),
    );
  }

  function addListener(listener: (data: T) => void | Promise<void>): void {
    listeners.add(listener);
  }

  function removeListener(listener: (data: T) => void | Promise<void>): void {
    listeners.delete(listener);
  }

  return {
    listeners,
    dispatch,
    dispatchAsync,
    addListener,
    removeListener,
  };
}
