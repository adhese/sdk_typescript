import { afterAll, describe, expect, it, vi } from 'vitest';
import { createLogger } from './createLogger';

describe('createLogger', () => {
  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should initialize a logger', () => {
    const logger = createLogger();

    expect(logger).toBeDefined();
  });

  it('should initialize a logger with a scope', () => {
    const logger = createLogger({
      scope: 'test',
    });

    expect(logger.scope).toBe('test');
  });

  it('should initialize a logger with custom levels', () => {
    const logger = createLogger({
      logLevels: ['foo', 'bar', 'baz'],
    });

    expect(logger.foo).toBeDefined();
    expect(logger.bar).toBeDefined();

    logger.bar = vi.fn();
    logger.bar('foo');
    expect(logger.bar).toHaveBeenCalledWith('foo');

    // @ts-expect-error - should not be defined
    expect(logger.info).toBeUndefined();
  });

  it('should initialize a logger with a custom minimum log level threshold', () => {
    const logger = createLogger({
      minLogLevelThreshold: 'warn',
    });

    expect(logger.getMinLogLevelThreshold()).toBe('warn');
  });

  it('should initialize a logger and change the minimum log level threshold', () => {
    const logger = createLogger();

    logger.setMinLogLevelThreshold('warn');

    expect(logger.getMinLogLevelThreshold()).toBe('warn');
  });

  it('should initialize a logger and reset the minimum log level threshold', () => {
    const logger = createLogger();

    logger.setMinLogLevelThreshold('warn');

    expect(logger.getMinLogLevelThreshold()).toBe('warn');

    logger.resetMinLogLevelThreshold();

    expect(logger.getMinLogLevelThreshold()).toBe('info');
  });

  it('should initialize a logger below the minimum log level threshold', () => {
    const consoleDebugSpy = vi.spyOn(console, 'debug');

    const logger = createLogger();

    logger.debug('foo');

    expect(consoleDebugSpy).not.toHaveBeenCalled();
  });

  it('should initialize a logger above the minimum log level threshold', () => {
    const consoleInfoSpy = vi.spyOn(console, 'info');

    const logger = createLogger();

    logger.info('foo');

    expect(consoleInfoSpy).toHaveBeenCalledWith('foo');
  });

  it('should use `console.log` if the log level does not exist on the console', () => {
    const consoleLogSpy = vi.spyOn(console, 'log');

    const logger = createLogger({
      logLevels: ['foo'],
    });

    logger.foo('bar');

    expect(consoleLogSpy).toHaveBeenCalledWith('FOO: bar');
  });

  it('should initialize a logger and get the logs', () => {
    const logger = createLogger();

    logger.info('foo');

    expect(logger.getLogs()).toHaveLength(1);
    expect(logger.getLogs()[0].message).toBe('foo');
  });

  it('should initialize a logger and reset the logs', () => {
    const logger = createLogger();

    logger.info('foo');

    expect(logger.getLogs()).toHaveLength(1);

    logger.resetLogs();

    expect(logger.getLogs()).toHaveLength(0);
  });
});
