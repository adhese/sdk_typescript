import { type MockInstance, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { awaitTimeout } from '@utils';
import { createAdhese } from './main';
import { logger } from './logger/logger';

vi.mock('./logger/logger', async (importOriginal) => {
  const module: { logger: typeof logger } = await importOriginal();

  return ({
    logger: {
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      setMinLogLevelThreshold: vi.fn((level) => { module.logger.setMinLogLevelThreshold(level); }),
      getMinLogLevelThreshold: vi.fn(() => module.logger.getMinLogLevelThreshold()),
      resetLogs: vi.fn(),
    } satisfies Partial<typeof logger>,
  });
});

describe('createAdhese', () => {
  const listeners = new Map<string, Set<() => void>>();
  let validQuery = '(max-width: 768px) and (pointer: coarse)';

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn((
        query: string,
      ) => ({
        media: query,
        onchange: null,
        dispatchEvent: null,
        matches: query === validQuery,
        addEventListener: vi.fn((type: string, listener: () => void) => {
          if (listeners.has(type))
            listeners.get(type)?.add(listener);
          else
            listeners.set(type, new Set([listener]));
        }),
        removeEventListener: vi.fn(
          (type: string, listener: () => void) => {
            listeners.get(type)?.delete(listener);
          },
        ),
      })),
    });
  });

  let debugLoggerSpy: MockInstance<[msg: string, ...args: Array<any>], void>;
  let warnLoggerSpy: MockInstance<[msg: string, ...args: Array<any>], void>;

  beforeEach(() => {
    debugLoggerSpy = vi.spyOn(logger, 'debug');
    warnLoggerSpy = vi.spyOn(logger, 'warn');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
    listeners.clear();
    validQuery = '(max-width: 768px) and (pointer: coarse)';
  });

  it('should create an adhese instance', () => {
    const adhese = createAdhese({
      account: 'test',
    });

    expect(adhese).not.toBeUndefined();
  });

  it('should create an adhese instance with default options', async () => {
    const adhese = await createAdhese({
      account: 'test',
    });

    expect(adhese.account).toBe('test');
    expect(adhese.host).toBe('https://ads-test.adhese.com');
    expect(adhese.poolHost).toBe('https://pool-test.adhese.com');
    expect(adhese.requestType).toBe('POST');
  });

  it('should create an adhese instance with custom options', async () => {
    const adhese = await createAdhese({
      account: 'test',
      host: 'https://ads.example.com',
      poolHost: 'https://pool.example.com',
      location: '/foo',
      requestType: 'GET',
      consent: true,
      parameters: {
        aa: 'foo',
        bb: [
          'bar',
          'baz',
        ],
      },
    });

    expect(adhese.account).toBe('test');
    expect(adhese.host).toBe('https://ads.example.com');
    expect(adhese.poolHost).toBe('https://pool.example.com');
    expect(adhese.getConsent()).toBe(true);
    expect(adhese.requestType).toBe('GET');
    expect(adhese.parameters.size).toBe(8);
  });

  it('should create an adhese instance with debug logging', async () => {
    await createAdhese({
      account: 'test',
      debug: true,
    });

    expect(logger.getMinLogLevelThreshold()).toBe('debug');
    expect(debugLoggerSpy).toHaveBeenCalledWith('Debug logging enabled');
    expect(debugLoggerSpy).toHaveBeenCalled();
  });

  it('should create a warning when host or poolHost are invalid', async () => {
    await createAdhese({
      account: 'test',
      // @ts-expect-error Testing invalid host
      host: 'invalid',
      // @ts-expect-error Testing invalid host
      poolHost: 'invalid',
    });

    expect(warnLoggerSpy).toHaveBeenCalledWith('Invalid host or poolHost');
  });

  it('should create an adhese instance with initial slots', async () => {
    const element = document.createElement('div');
    element.id = 'billboard';
    element.classList.add('adunit');
    element.dataset.format = 'billboard';

    document.body.appendChild(element);

    const adhese = await createAdhese({
      account: 'test',
      initialSlots: [
        {
          format: 'billboard',
          containingElement: 'billboard',
          slot: 'billboard',
        },
      ],
    });

    expect(adhese.getAll().length).toBe(1);
  });

  it('should create an adhese instance with findDomSlotsOnLoad', async () => {
    const element = document.createElement('div');
    element.id = 'billboard';
    element.classList.add('adunit');
    element.dataset.format = 'billboard';

    document.body.appendChild(element);

    const adhese = await createAdhese({
      account: 'test',
      findDomSlotsOnLoad: true,
    });

    expect(adhese.getAll().length).toBe(1);
  });

  it('should be able to get the current page location', async () => {
    const adhese = await createAdhese({
      account: 'test',
    });

    expect(adhese.getLocation()).toBe('homepage');
  });

  it('should be able to set the current page location', async () => {
    const adhese = await createAdhese({
      account: 'test',
    });

    adhese.setLocation('/foo');

    expect(adhese.getLocation()).toBe('/foo');
  });

  it('should be able to add a slot', async () => {
    const adhese = await createAdhese({
      account: 'test',
      location: '_sdk_example_',
    });

    const element = document.createElement('div');
    element.id = 'foo';
    element.classList.add('leaderboard');
    element.dataset.format = 'billboard';

    document.body.appendChild(element);

    await adhese.addSlot({
      format: 'foo',
      containingElement: 'foo',
    });

    expect(adhese.getAll().length).toBe(1);
  });

  it('should be able to find all slots in the DOM', async () => {
    const adhese = await createAdhese({
      account: 'test',
    });

    const element = document.createElement('div');
    element.id = 'billboard';
    element.classList.add('adunit');
    element.dataset.format = 'billboard';

    document.body.appendChild(element);

    const slots = await adhese.findDomSlots();

    expect(slots.length).toBe(1);
  });

  it('should be able to change the consent', async () => {
    const adhese = await createAdhese({
      account: 'test',
    });

    expect(adhese.getConsent()).toBe(false);
    expect(adhese.parameters.get('tl')).toBe('none');

    adhese.setConsent(true);

    expect(adhese.getConsent()).toBe(true);
    expect(adhese.parameters.get('tl')).toBe('all');
  });

  it('should change the consent parameter via TCF', async () => {
    const tcfListeners = new Set<(data: {
      tcString: string;
    }, success: boolean) => void>();
    Object.defineProperty(window, '__tcfapi', {
      // @ts-expect-error Testing TCF
      value: vi.fn((command: 'addEventListener' | 'removeEventListener', version: number, callback: (data: {
        tcString: string;
      }, success: boolean) => void): void => {
        if (command === 'addEventListener')
          tcfListeners.add(callback);
        else if (command === 'removeEventListener')
          tcfListeners.delete(callback);
      }),
    });

    const adhese = await createAdhese({
      account: 'test',
    });

    expect(adhese.parameters.get('xt')).toBeUndefined();
    expect(adhese.parameters.get('tl')).toBe('none');

    tcfListeners.forEach((listener) => {
      listener({
        tcString: 'foo',
      }, true);
    });

    expect(adhese.parameters.get('xt')).toBe('foo');
    expect(adhese.parameters.get('tl')).toBeUndefined();

    listeners.clear();
  });

  it('should be able to handle device change', async () => {
    const adhese = await createAdhese({
      account: 'test',
    });

    expect(adhese.parameters.get('dt')).toBe('mobile');
    expect(adhese.parameters.get('br')).toBe('mobile');

    validQuery = '(min-width: 769px) and (max-width: 1024px) and (pointer: coarse)';

    for (const listener of listeners.get('change') ?? [])
      listener();

    await awaitTimeout(70);

    expect(adhese.parameters.get('dt')).toBe('tablet');
    expect(adhese.parameters.get('br')).toBe('tablet');
  });

  it('should dispose the instance', async () => {
    const adhese = await createAdhese({
      account: 'test',
    });

    adhese.dispose();

    expect(adhese.getAll().length).toBe(0);
  });
});
