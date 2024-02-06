type EventManagerGroup<Events extends Record<string, unknown>> = {
  [Key in keyof Events]: Readonly<
    {
      /**
       * The listeners for this event. This is a set of functions that will be called when the event is dispatched.
       */
      listeners: Set<(data: Events[Key]) => void | Promise<void>>;
      /**
       * Dispatches the event to all listeners. This is a synchronous operation.
       * @param data
       */
      dispatch(data: Events[Key]): void;
      /**
       * Dispatches the event to all listeners. This is an asynchronous operation.
       * @param data
       */
      dispatchAsync(data: Events[Key]): Promise<void>;
      /**
       * Adds a listener to the event.
       * @param listener
       */
      addListener(listener: (data: Events[Key]) => void | Promise<void>): void;
      /**
       * Removes a listener from the event.
       * @param listener
       */
      removeListener(listener: (data: Events[Key]) => void | Promise<void>): void;
    }
  >;
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
 * @param eventNames The names of the events. These will be used as keys in the returned event manager.
 */
export function createEventManager<
  Events extends Record<Name, unknown>,
  Name extends Readonly<string | number | symbol> = keyof Events,
>(eventNames: ReadonlyArray<Name>): EventManager<Events> {
  const events = {} as EventManagerGroup<Events>;

  for (const key of eventNames) {
    const listeners = new Set<(data: Events[typeof key]) => void | Promise<void>>();

    function dispatch(data: Events[typeof key]): void {
      for (const listener of listeners)
        // eslint-disable-next-line no-void
        void listener(data);
    }

    async function dispatchAsync(data: Events[typeof key]): Promise<void> {
      await Promise.allSettled(
        Array.from(listeners).map(listener => listener(data)),
      );
    }

    function addListener(listener: (data: Events[typeof key]) => void | Promise<void>): void {
      listeners.add(listener);
    }

    function removeListener(listener: (data: Events[typeof key]) => void | Promise<void>): void {
      listeners.delete(listener);
    }

    events[key] = {
      listeners,
      dispatch,
      dispatchAsync,
      addListener,
      removeListener,
    };
  }

  function dispose(): void {
    for (const key in events)
      events[key].listeners.clear();
  }

  return {
    ...events,
    dispose,
  };
}
