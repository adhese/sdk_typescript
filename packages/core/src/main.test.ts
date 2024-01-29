import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAdhese } from './main';
import { logger } from './logger/logger';
import type { AdResponse } from './requestAds/requestAds.schema';

vi.mock('./logger/logger', async (importOriginal) => {
  const module: { logger: typeof logger } = await importOriginal();

  return ({
    logger: {
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      setMinLogLevelThreshold: vi.fn((level) => { module.logger.setMinLogLevelThreshold(level); }),
      getMinLogLevelThreshold: vi.fn(() => module.logger.getMinLogLevelThreshold()),
    } satisfies Partial<typeof logger>,
  });
});

describe('createAdhese', () => {
  vi.stubGlobal('fetch', vi.fn(() => ({
    ok: true,
    json(): Promise<unknown> {
      return new Promise((resolve) => {
        resolve([{
          adType: 'foo',
          // eslint-disable-next-line ts/naming-convention
          slotID: 'bar',
          slotName: 'homepage-foo',
          tag: '<a>foo</a>',
        }, {
          adType: 'foo2',
          // eslint-disable-next-line ts/naming-convention
          slotID: 'bar2',
          slotName: 'baz2',
          tag: '<a>foo</a>',
        }] satisfies ReadonlyArray<AdResponse>);
      });
    },
  })));
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
  });

  it('should create an adhese instance', () => {
    const adhese = createAdhese({
      account: 'demo',
    });

    expect(adhese).not.toBeUndefined();
  });

  it('should create an adhese instance with default options', async () => {
    const adhese = await createAdhese({
      account: 'demo',
    });

    expect(adhese.account).toBe('demo');
    expect(adhese.host).toBe('https://ads-demo.adhese.com');
    expect(adhese.poolHost).toBe('https://pool-demo.adhese.com');
    expect(adhese.requestType).toBe('POST');
  });

  it('should create an adhese instance with custom options', async () => {
    const adhese = await createAdhese({
      account: 'demo',
      host: 'https://ads.example.com',
      poolHost: 'https://pool.example.com',
      location: '/foo',
      requestType: 'GET',
      parameters: {
        aa: 'foo',
        bb: [
          'bar',
          'baz',
        ],
      },
    });

    expect(adhese.account).toBe('demo');
    expect(adhese.host).toBe('https://ads.example.com');
    expect(adhese.poolHost).toBe('https://pool.example.com');
    expect(adhese.requestType).toBe('GET');
    expect(adhese.parameters.size).toBe(2);
  });

  it('should create an adhese instance with debug logging', async () => {
    await createAdhese({
      account: 'demo',
      debug: true,
    });

    expect(logger.getMinLogLevelThreshold()).toBe('debug');
    expect(debugLoggerSpy).toHaveBeenCalledWith('Debug logging enabled');
    expect(debugLoggerSpy).toHaveBeenCalled();
  });

  it('should create a warning when host or poolHost are invalid', async () => {
    await createAdhese({
      account: 'demo',
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
      account: 'demo',
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
      account: 'demo',
      findDomSlotsOnLoad: true,
    });

    expect(adhese.getAll().length).toBe(1);
  });

  it('should be able to get the current page location', async () => {
    const adhese = await createAdhese({
      account: 'demo',
    });

    expect(adhese.getLocation()).toBe('homepage');
  });

  it('should be able to set the current page location', async () => {
    const adhese = await createAdhese({
      account: 'demo',
    });

    adhese.setLocation('/foo');

    expect(adhese.getLocation()).toBe('/foo');
  });

  it('should be able to add a slot', async () => {
    const adhese = await createAdhese({
      account: 'demo',
      location: '_sdk_example_',
    });

    const element = document.createElement('div');
    element.id = 'foo';
    element.classList.add('leaderboard');
    element.dataset.format = 'billboard';

    document.body.appendChild(element);

    await adhese.addSlot({
      format: 'leaderboard',
      containingElement: 'foo',
    });

    expect(adhese.getAll().length).toBe(1);
  });

  it('should be able to find all slots in the DOM', async () => {
    const adhese = await createAdhese({
      account: 'demo',
    });

    const element = document.createElement('div');
    element.id = 'billboard';
    element.classList.add('adunit');
    element.dataset.format = 'billboard';

    document.body.appendChild(element);

    const slots = await adhese.findDomSlots();

    expect(slots.length).toBe(1);
  });
});
