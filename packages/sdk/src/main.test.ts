import { type MockInstance, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { awaitTimeout, waitForDomLoad } from '@adhese/sdk-shared';
import { createAdhese } from './main';
import { logger } from './logger/logger';
import type { Adhese } from './main.types';
import { waitOnInit } from './hooks/onInit';

vi.mock('./logger/logger', async (importOriginal) => {
  const module: { logger: typeof logger } = await importOriginal();

  return ({
    logger: {
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      setMinLogLevelThreshold: vi.fn((level) => { module.logger.setMinLogLevelThreshold(level); }),
      getMinLogLevelThreshold: vi.fn(() => module.logger.getMinLogLevelThreshold()),
      resetLogs: vi.fn(),
    } satisfies Partial<typeof logger>,
  });
});

describe('createAdhese', () => {
  const listeners = new Map<string, Set<() => void>>();
  let validQuery = '(max-width: 768px) and (pointer: coarse)';

  let adhese: Adhese | undefined;

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

  beforeEach(() => {
    debugLoggerSpy = vi.spyOn(logger, 'debug');

    adhese?.dispose();
    adhese = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
    listeners.clear();
    validQuery = '(max-width: 768px) and (pointer: coarse)';

    adhese?.dispose();
    adhese = undefined;
  });

  it('should create an adhese instance', () => {
    adhese = createAdhese({
      account: 'test',
    });

    expect(adhese).not.toBeUndefined();
  });

  it('should create an adhese instance with default options', () => {
    adhese = createAdhese({
      account: 'test',
    });

    expect(adhese.options.account).toBe('test');
    expect(adhese.options.host).toBe('https://ads-test.adhese.com');
    expect(adhese.options.poolHost).toBe('https://pool-test.adhese.com');
    expect(adhese.options.requestType).toBe('POST');
  });

  it('should create an adhese instance with custom options', () => {
    adhese = createAdhese({
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
      eagerRendering: true,
    });

    expect(adhese.options.account).toBe('test');
    expect(adhese.options.host).toBe('https://ads.example.com');
    expect(adhese.options.poolHost).toBe('https://pool.example.com');
    expect(adhese.consent).toBe(true);
    expect(adhese.options.requestType).toBe('GET');
    expect(adhese.parameters.size).toBe(8);
    expect(adhese.options.eagerRendering).toBe(true);
  });

  it('should create an adhese instance with debug logging', () => {
    adhese = createAdhese({
      account: 'test',
      debug: true,
    });

    expect(logger.getMinLogLevelThreshold()).toBe('debug');
    expect(debugLoggerSpy).toHaveBeenCalledWith('Debug logging enabled');
    expect(debugLoggerSpy).toHaveBeenCalled();
  });

  it('should create an adhese instance with initial slots', () => {
    const element = document.createElement('div');
    element.id = 'billboard';
    element.classList.add('adunit');
    element.dataset.format = 'billboard';

    document.body.appendChild(element);

    adhese = createAdhese({
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
    element.id = 'leaderboard';
    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';

    document.body.appendChild(element);

    await waitForDomLoad();

    adhese = createAdhese({
      account: 'test',
      findDomSlotsOnLoad: true,
    });

    await waitOnInit;

    await awaitTimeout(100);

    expect(adhese.getAll().length).toBe(1);
  });

  it('should be able to get the current page location', () => {
    adhese = createAdhese({
      account: 'test',
    });

    expect(adhese.location).toBe('homepage');
  });
  it('should be able to set the current page location', () => {
    adhese = createAdhese({
      account: 'test',
    });

    adhese.location = '/foo';

    expect(adhese.location).toBe('/foo');
  });

  it('should be able to add a slot', async () => {
    adhese = createAdhese({
      account: 'test',
      location: '_sdk_example_',
    });

    const element = document.createElement('div');
    element.id = 'foo';
    element.classList.add('leaderboard');
    element.dataset.format = 'billboard';

    document.body.appendChild(element);

    adhese.addSlot({
      format: 'foo',
      containingElement: 'foo',
    });

    expect(adhese.getAll().length).toBe(1);
  });

  it('should be able to find all slots in the DOM', async () => {
    adhese = createAdhese({
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
    adhese = createAdhese({
      account: 'test',
    });

    expect(adhese.consent).toBe(false);
    expect(adhese.parameters.get('tl')).toBe('none');

    adhese.consent = true;

    expect(adhese.consent).toBe(true);

    await awaitTimeout(10);

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

    adhese = createAdhese({
      account: 'test',
    });

    const element = document.createElement('div');
    adhese.addSlot({
      format: 'foo',
      containingElement: element,
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
    adhese = createAdhese({
      account: 'test',
      location: '_sdk-example_',
    });

    const element = document.createElement('div');
    adhese.addSlot({
      format: 'foo',
      containingElement: element,
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

  it('should dispose the instance', () => {
    adhese = createAdhese({
      account: 'test',
    });

    adhese.dispose();

    expect(adhese.getAll().length).toBe(0);
  });
});
