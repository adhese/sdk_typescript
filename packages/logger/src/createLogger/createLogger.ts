import { createEventManager } from '@utils';
import uniqueId from 'lodash/uniqueId';

/**
 * A log entry saved by the logger
 */
export type Log<T extends string> = {
  /**
   * The scope of the logger that created this log entry
   */
  scope: string;
  /**
   * The log level of this log entry
   */
  level: T;
  /**
   * The message of this log entry
   */
  message: string;
  /**
   * The attributes of this log entry
   */
  attributes?: unknown;
  /**
   * The timestamp of this log entry
   */
  timestamp: number;
  id: string;
};

export type LogFunction = (message: string, attributes?: unknown) => void;
export type Logger<T extends string> = {
  [key in T]: LogFunction;
} & {
  /**
   * The scope of the logger
   */
  readonly scope: string;
  /**
   * The event manager of the logger
   */
  events: ReturnType<typeof createEventManager<{
    log: Log<T>;
    reset: void;
  }>>;
  /**
   * Set the minimum log level threshold
   */
  setMinLogLevelThreshold(level: T): void;
  /**
   * Reset the minimum log level threshold to the default value
   */
  resetMinLogLevelThreshold(): void;
  /**
   * Get the current minimum log level threshold
   */
  getMinLogLevelThreshold(): T;
  /**
   * Get the logs that were created by this logger
   */
  getLogs(): ReadonlyArray<Log<T>>;
  /**
   * Reset the logs that were created by this logger
   */
  resetLogs(): void;
};

export type LoggerOptions<T extends string, U extends T = T> = {
  /**
   * The scope of the logger
   */
  scope: string;
  /**
   * The log levels of the logger in order of priority
   *
   * @default ['trace', 'debug', 'info', 'warn', 'error']
   */
  logLevels?: ReadonlyArray<T>;
  /**
   * The minimum log level threshold of the logger. Needs to be one of the log levels in the `logLevels` array
   *
   * @default 'info' or the third log level in the `logLevels` array
   */
  minLogLevelThreshold?: U;
};

const defaultLogLevels = ['trace', 'debug', 'info', 'warn', 'error'] as const;

/**
 * Create a logger instance with the given options
 */
export function createLogger<T extends string = typeof defaultLogLevels[number], U extends T = T>({
  scope,
  logLevels = defaultLogLevels as unknown as ReadonlyArray<T>,
  minLogLevelThreshold = logLevels[2] as U,
}: LoggerOptions<T, U>): Logger<T> {
  const logs = new Set<Log<T>>();
  let currentMinLogLevelThreshold: T = minLogLevelThreshold;
  const events = createEventManager<{
    log: Log<T>;
    reset: void;
  }>();

  const logFunctions = Object.fromEntries(logLevels.map((level, index) => {
    const logFunction: LogFunction = (message, attributes) => {
      logs.add({
        scope,
        level,
        message,
        attributes,
        timestamp: Date.now(),
        id: uniqueId(),
      });

      events.log.dispatch({
        scope,
        level,
        message,
        attributes,
        timestamp: Date.now(),
        id: uniqueId(),
      });

      if (index >= logLevels.indexOf(currentMinLogLevelThreshold)) {
        if ((['warn', 'error', 'trace'] as ReadonlyArray<string>).includes(level)) {
          // eslint-disable-next-line no-console
          console[level as typeof defaultLogLevels[number]](...[
            `%c${scope}`,
            'color: red; font-weight: bold;',
            message,
            attributes,
          ].filter(Boolean));
        }
        else {
          // eslint-disable-next-line no-console
          console.log(...[
            `%c${scope} %c${level.toUpperCase()}`,
            'color: red; font-weight: bold;',
            'font-weight: bold;',
            message,
            attributes,
          ].filter(Boolean));
        }
      }
    };

    return [level, logFunction];
  })) as {
    [key in T]: LogFunction;
  };

  return {
    ...logFunctions,
    scope,
    events,
    setMinLogLevelThreshold(level: T): void {
      currentMinLogLevelThreshold = level;
    },
    resetMinLogLevelThreshold(): void {
      currentMinLogLevelThreshold = minLogLevelThreshold;
    },
    getMinLogLevelThreshold(): T {
      return currentMinLogLevelThreshold;
    },
    getLogs(): ReadonlyArray<Log<T>> {
      return Array.from(logs) as ReadonlyArray<Log<T>>;
    },
    resetLogs(): void {
      events.reset.dispatch();
      logs.clear();
    },
  };
}
