/**
 * @vitest-environment node
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchAds } from './server';

describe('fetchAds in node runtime', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('parses HTML ads without DOMParser in server runtimes', async () => {
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify([
        {
          origin: 'JERLICIA',
          // eslint-disable-next-line ts/naming-convention
          slotID: '1',
          slotName: 'homepage_leaderboard',
          adType: 'html',
          tag: '<script src="https://cdn.example.com/ad.js"></script>',
        },
      ]),
      {
        status: 200,
      },
    ));

    vi.stubGlobal('fetch', fetchMock);

    const ads = await fetchAds({
      account: 'demo',
      location: 'homepage',
      slots: [{ format: 'leaderboard' }],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(ads).toHaveLength(1);
    expect(ads[0].tag).toBe('<script src="https://cdn.example.com/ad.js"></script>');
  });

  it('returns an empty array when the request times out', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        });
      })),
    );

    const ads = await fetchAds({
      account: 'demo',
      location: 'homepage',
      slots: [{ format: 'leaderboard' }],
      timeout: 10,
    });

    expect(ads).toEqual([]);
  });
});
