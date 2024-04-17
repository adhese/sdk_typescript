import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UrlString } from '@utils';
import { type AdheseContext, createSlot, logger } from '@adhese/sdk';
import { testContext } from '../testUtils';
import { requestAd, requestAds } from './requestAds';
import { type AdResponse, adSchema, dateLike, numberLike, urlLike } from './requestAds.schema';
import { parseParameters } from './requestAds.utils';

describe('requestAds', () => {
  let context: AdheseContext;

  beforeEach(() => {
    context = testContext;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should be able to request multiple ads', async () => {
    const ads = await requestAds(
      {
        slots: [
          createSlot({
            format: 'foo',
            slot: 'baz',
            context,
          }),
          createSlot({
            format: 'foo2',
            slot: 'baz2',
            context,
          }),
        ],
        context,
      },
    );

    expect(ads.length).toBe(2);
  });

  it('should be able to request ads with the GET method', async () => {
    context = {
      ...context,
      options: {
        ...context.options,
        requestType: 'GET',
      },
    };

    const ads = await requestAds(
      {
        slots: [
          createSlot({
            format: 'foo',
            slot: 'baz',
            context,
          }),
          createSlot({
            format: 'foo2',
            slot: 'baz2',
            context,
          }),
        ],
        context,
      },
    );

    expect(ads.length).toBe(2);
  });

  it('should throw an error when requestAds fails', async () => {
    context = {
      ...context,
      options: {
        ...context.options,
        host: 'https://ads-fail.adhese.com' as UrlString,
      },
    };

    try {
      await requestAds(
        {
          slots: [
            createSlot({
              format: 'foo',
              slot: 'baz',
              context,
            }),
          ],
          context,
        },
      );
    }
    catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should be able to parse ads from the DALE gateway', async () => {
    context = {
      ...context,
      options: {
        ...context.options,
        host: 'https://ads-dale.adhese.com' as UrlString,
      },
    };

    const ads = await requestAds({
      slots: [
        createSlot({
          format: 'bar',
          context: testContext,
        }),
        createSlot({
          format: 'baz',
          context: testContext,
        }),
      ],
      context,
    });

    expect(ads.length).toBe(2);

    for (const ad of ads) {
      expect(ad.origin).toBe('DALE');
      expect(ad.tag).toBeDefined();
    }
  });
});

describe('requestAd', () => {
  let context: AdheseContext;

  beforeEach(() => {
    context = testContext;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should be able to fetch a single ad', async () => {
    const ad = await requestAd({
      slot: createSlot({
        format: 'bar',
        context,
      }),
      context,
    });

    expect(ad).toBeDefined();
  });
});

describe('schema', () => {
  it('should be able to validate a valid response', () => {
    const response = {
      adType: 'foo',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      tag: '<a>foo</a>',
      id: 'baz',
      origin: 'JERLICIA',
    } satisfies AdResponse;

    const result = adSchema.parse(response);

    expect(result).toBeDefined();
  });

  it('should be able to reject an invalid response', () => {
    const response = {
      adType: 'foo',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      tag: '<a>foo</a>',
      id: 'baz',
      // @ts-expect-error Testing invalid response
      invalid: 'invalid',
    } satisfies AdResponse;

    try {
      adSchema.parse(response);
    }
    catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should be able to handle a recursively nested response', () => {
    const response = {
      adType: 'foo',
      // eslint-disable-next-line ts/naming-convention
      slotID: 'bar',
      slotName: 'baz',
      tag: '<a>foo</a>',
      id: 'baz',
      origin: 'JERLICIA',
      additionalCreatives: [{
        id: 'baz',
        adType: 'foo',
        // eslint-disable-next-line ts/naming-convention
        slotID: 'bar',
        slotName: 'baz',
        tag: '<a>foo</a>',
        origin: 'JERLICIA',
      }],
    } satisfies AdResponse;

    const result = adSchema.parse(response);

    expect(result).toBeDefined();
  });

  it('should be able to validate a number like string', () => {
    expect(numberLike.parse('123')).toBe(123);
    expect(numberLike.parse('')).toBeUndefined();
  });

  it('should be able to validate and transform a url string', () => {
    expect(urlLike.parse('https://foo.com')).toBeInstanceOf(URL);
    expect(urlLike.parse('')).toBeUndefined();
  });

  it('should be able to validate and transform a date string', () => {
    expect(dateLike.parse('2021-01-01')).toBeInstanceOf(Date);
    expect(dateLike.parse(Date.now())).toBeInstanceOf(Date);

    expect(dateLike.parse('')).toBeUndefined();
    expect(dateLike.parse('foo')).toBeUndefined();
  });
});

describe('parseParameters', () => {
  let warnLoggerSpy: MockInstance<[msg: string, ...args: Array<any>], void>;

  beforeEach(() => {
    warnLoggerSpy = vi.spyOn(logger, 'warn');
  });

  vi.mock('./logger/logger', () => ({
    logger: {
      debug: vi.fn(),
      warn: vi.fn(),
    } satisfies Partial<typeof logger>,
  }));

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be able to parse parameters', () => {
    const parsedParameters = parseParameters(new Map<string, string | ReadonlyArray<string>>([
      ['fo', ['bar']],
      ['ba', 'qux'],
    ]));

    expect(parsedParameters).toEqual({
      fo: ['bar'],
      ba: 'qux',
    });
  });

  it('should be able to parse and filter parameters with invalid keys', () => {
    const parsedParameters = parseParameters(new Map<string, string | ReadonlyArray<string>>([
      ['fo', ['bar']],
      ['bar', 'qux'],
    ]));

    expect(warnLoggerSpy).toHaveBeenCalledWith('Invalid parameter key: bar. Key should be exactly 2 characters long. Key will be ignored.');

    expect(parsedParameters).toEqual({
      fo: ['bar'],
    });
  });

  it('should be able to parse and filter parameters with invalid values', () => {
    const parsedParameters = parseParameters(new Map<string, string | ReadonlyArray<string>>([
      ['aa', ['bar']],
      ['bb', 'foo*bar'],
      ['cc', ['foo*bar']],
      ['dd', 'α&β'],
      ['ee', ['α&β']],
      ['ff', 'զվար)ճանք'],
    ]));

    expect(parsedParameters).toEqual({
      aa: ['bar'],
      bb: 'foo_bar',
      cc: ['foo_bar'],
      dd: 'α_β',
      ee: ['α_β'],
      ff: 'զվար_ճանք',
    });
  });
});

describe('requestPreviews', () => {
  let context: AdheseContext;

  beforeEach(() => {
    context = testContext;
  });

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: new URL('https://foo.com?adhesePreviewCreativeId=foo-bar&adheseCreativeTemplateId=foo-bar&adhesePreviewCreativeId=bar&adhesePreviewCreativeId=fail'),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should be able to request previews', async () => {
    const ads = await requestAds({
      slots: [
        createSlot({
          format: 'bar',
          context,
        }),
        createSlot({
          format: 'baz',
          context,
        }),
      ],
      context,
    });

    expect(ads.length).toBe(3);
  });
});
