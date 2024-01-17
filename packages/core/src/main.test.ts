import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAdhese } from './main';
import { logger } from './logger/logger';

vi.mock('./logger/logger', async (importOriginal) => {
  const module: { logger: typeof logger } = await importOriginal();

  return ({
    logger: {
      debug: vi.fn(),
      warn: vi.fn(),
      setMinLogLevelThreshold: vi.fn((level) => { module.logger.setMinLogLevelThreshold(level); }),
      getMinLogLevelThreshold: vi.fn(() => module.logger.getMinLogLevelThreshold()),
    } satisfies Partial<typeof logger>,
  });
});
describe('createAdhese', () => {
  let debugLoggerSpy: MockInstance<[msg: string, ...args: Array<any>], void>;
  let warnLoggerSpy: MockInstance<[msg: string, ...args: Array<any>], void>;

  beforeEach(() => {
    debugLoggerSpy = vi.spyOn(logger, 'debug');
    warnLoggerSpy = vi.spyOn(logger, 'warn');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create an adhese instance', () => {
    const adhese = createAdhese({
      account: 'demo',
    });

    expect(adhese).not.toBeUndefined();
  });

  it('should create an adhese instance with default options', () => {
    const adhese = createAdhese({
      account: 'demo',
    });

    expect(adhese.account).toBe('demo');
    expect(adhese.host).toBe('https://ads-demo.adhese.com');
    expect(adhese.poolHost).toBe('https://pool-demo.adhese.com');
    expect(adhese.pageLocation).toMatchObject(new URL(location.toString()));
    expect(adhese.requestType).toBe('POST');
  });

  it('should create an adhese instance with custom options', () => {
    const adhese = createAdhese({
      account: 'demo',
      host: 'https://ads.example.com',
      poolHost: 'https://pool.example.com',
      pageLocation: new URL('https://example.com'),
      requestType: 'GET',
    });

    expect(adhese.account).toBe('demo');
    expect(adhese.host).toBe('https://ads.example.com');
    expect(adhese.poolHost).toBe('https://pool.example.com');
    expect(adhese.pageLocation).toMatchObject(new URL('https://example.com'));
    expect(adhese.requestType).toBe('GET');
  });

  it('should create an adhese instance with debug logging', () => {
    createAdhese({
      account: 'demo',
      debug: true,
    });

    expect(logger.getMinLogLevelThreshold()).toBe('debug');
    expect(debugLoggerSpy).toHaveBeenCalledWith('Debug logging enabled');
    expect(debugLoggerSpy).toHaveBeenCalledWith('Created Adhese SDK instance', {
      options: {
        account: 'demo',
        host: 'https://ads-demo.adhese.com',
        poolHost: 'https://pool-demo.adhese.com',
        pageLocation: location.toString(),
        requestType: 'POST',
      },
    });
  });

  it('should create a warning when host or poolHost are invalid', () => {
    createAdhese({
      account: 'demo',
      // @ts-expect-error Testing invalid host
      host: 'invalid',
      // @ts-expect-error Testing invalid host
      poolHost: 'invalid',
    });

    expect(warnLoggerSpy).toHaveBeenCalledWith('Invalid host or poolHost');
  });
});
