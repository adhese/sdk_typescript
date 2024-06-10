import { type MockInstance, afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { awaitTimeout, waitForDomLoad } from '@adhese/sdk-shared';
// eslint-disable-next-line ts/naming-convention
import MatchMediaMock from 'vitest-matchmedia-mock';
import { createAdhese } from './main';
import { logger } from './logger/logger';
import type { Adhese } from './main.types';

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
  const mediaQueryMock = new MatchMediaMock();

  let adhese: Adhese | undefined;
  let debugLoggerSpy: MockInstance<[msg: string, ...args: Array<any>], void>;

  beforeEach(() => {
    mediaQueryMock.useMediaQuery('(max-width: 768px)');
    debugLoggerSpy = vi.spyOn(logger, 'debug');

    adhese?.dispose();
    adhese = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
    mediaQueryMock.clear();

    adhese?.dispose();
    adhese = undefined;
  });

  afterAll(() => {
    mediaQueryMock.destroy();
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
    expect(debugLoggerSpy).toHaveBeenCalledWith('Debug mode enabled');
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

    await awaitTimeout(200);

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

    await awaitTimeout(0);

    const element = document.createElement('div');
    element.id = 'leaderboard';
    element.classList.add('adunit');
    element.dataset.format = 'leaderboard';

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

    mediaQueryMock.useMediaQuery('(min-width: 769px) and (max-width: 1024px)');

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
