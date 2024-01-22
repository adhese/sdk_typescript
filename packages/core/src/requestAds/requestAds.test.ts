import { afterEach, describe, expect, it, vi } from 'vitest';
import type { UrlString } from '@utils';
import { createSlot } from '@core';
import { requestAd, requestAds } from './requestAds';

describe('requestAds', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should be able to requestAds an ad', async () => {
    vi.stubGlobal('fetch', vi.fn(() => ({
      ok: true,
      json(): Promise<unknown> {
        return new Promise((resolve) => {
          resolve([{
            tag: '<a>foo</a>',
          }]);
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
        ],
      },
    );

    expect(ads.length).toBe(1);
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
            tag: '<a>foo</a>',
          }]);
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
