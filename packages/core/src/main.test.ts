import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAdhese } from './main';
import { logger } from './logger/logger';

vi.mock('./logger/logger', () =>
  ({
    logger: {
      debug: vi.fn(),
    },
  }));
describe('createAdhese', () => {
  let loggerSpy: MockInstance<[msg: string, ...args: Array<any>], void>;

  beforeEach(() => {
    loggerSpy = vi.spyOn(logger, 'debug');
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

    expect(logger.level).toBe('debug');
    expect(loggerSpy).toHaveBeenCalledWith('Debug logging enabled');
    expect(loggerSpy).toHaveBeenCalledWith('Created Adhese SDK instance', {
      options: {
        account: 'demo',
        host: 'https://ads-demo.adhese.com',
        poolHost: 'https://pool-demo.adhese.com',
        pageLocation: location.toString(),
        requestType: 'POST',
      },
    });
  });
});
