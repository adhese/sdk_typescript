import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UrlString } from '@utils';
import { createSlot, logger } from '@core';
import { parseParameters, requestAd, requestAds } from './requestAds';
import { type AdResponse, adSchema, dateLike, numberLike, urlLike } from './requestAds.schema';

describe('requestAds', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should be able to request multiple ads', async () => {
    vi.stubGlobal('fetch', vi.fn(() => ({
      ok: true,
      json(): Promise<unknown> {
        return new Promise((resolve) => {
          resolve([{
            adType: 'foo',
            // eslint-disable-next-line ts/naming-convention
            slotID: 'bar',
            slotName: 'baz',
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

    const ads = await requestAds(
      {
        host: 'https:foo.bar' as UrlString,
        slots: [
          createSlot({
            format: 'foo',
            location: 'bar',
            slot: 'baz',
          }),
          createSlot({
            format: 'foo2',
            location: 'bar2',
            slot: 'baz2',
          }),
        ],
      },
    );

    expect(ads.length).toBe(2);
  });

  it('should be able to request ads with the GET method', async () => {
    vi.stubGlobal('fetch', vi.fn(() => ({
      ok: true,
      json(): Promise<unknown> {
        return new Promise((resolve) => {
          resolve([{
            adType: 'foo',
            // eslint-disable-next-line ts/naming-convention
            slotID: 'bar',
            slotName: 'baz',
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

    const ads = await requestAds(
      {
        host: 'https:foo.bar' as UrlString,
        slots: [
          createSlot({
            format: 'foo',
            location: 'bar',
            slot: 'baz',
          }),
          createSlot({
            format: 'foo2',
            location: 'bar2',
            slot: 'baz2',
          }),
        ],
        method: 'GET',
      },
    );

    expect(ads.length).toBe(2);
  });

  it('should throw an error when requestAds fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => ({
      ok: false,
    })));

    try {
      await requestAds(
        {
          host: 'https:foo.bar' as UrlString,
          slots: [
            createSlot({
              format: 'foo',
              location: 'bar',
              slot: 'baz',
            }),
          ],
        },
      );
    }
    catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});

describe('requestAd', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should be able to fetch a single ad', async () => {
    vi.stubGlobal('fetch', vi.fn(() => ({
      ok: true,
      json(): Promise<unknown> {
        return new Promise((resolve) => {
          resolve([{
            adType: 'foo',
            // eslint-disable-next-line ts/naming-convention
            slotID: 'bar',
            slotName: 'baz',
            tag: '<a>foo</a>',
          }] satisfies ReadonlyArray<AdResponse>);
        });
      },
    })));

    const ad = await requestAd({
      host: 'https://foo.com',
      slot: createSlot({
        location: 'foo',
        format: 'bar',
      }),
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
      additionalCreatives: [{
        adType: 'foo',
        // eslint-disable-next-line ts/naming-convention
        slotID: 'bar',
        slotName: 'baz',
        tag: '<a>foo</a>',
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
});
