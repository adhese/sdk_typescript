import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createAdhese } from '@adhese/sdk';
import { vastUrlPlugin } from './vastUrl';

describe('vastUrlPlugin', () => {
  let adhese: ReturnType<typeof createAdhese<[typeof vastUrlPlugin]>> | undefined;

  beforeEach(() => {
    adhese = createAdhese({
      account: 'demo',
      plugins: [vastUrlPlugin],
    });
  });

  afterEach(() => {
    adhese?.dispose();
  });

  it('should create a URL', () => {
    const url = adhese?.plugins.vastUrl.createUrl({
      format: 'leaderboard',
    });

    expect(url).toBeInstanceOf(URL);
    expect(url?.href).toMatch(/https:\/\/ads-demo\.adhese\.com\/ad\/slhomepage-leaderboard\/re\/uraHR0cDovL2xvY2FsaG9zdDozMDAwLw==\/rn\d+\/dtunknown\/brunknown\/tlnone/gu);
  });

  it('should create a URL with parameters', () => {
    const url = adhese?.plugins.vastUrl.createUrl({
      format: 'leaderboard',
      parameters: {
        fo: 'bar',
      },
    });

    expect(url).toBeInstanceOf(URL);
    expect(url?.href).toMatch(/https:\/\/ads-demo\.adhese\.com\/ad\/slhomepage-leaderboard\/re\/uraHR0cDovL2xvY2FsaG9zdDozMDAwLw==\/rn\d+\/dtunknown\/brunknown\/tlnone\/fobar/gu);
  });

  it('should create a URL with a custom host', () => {
    const url = adhese?.plugins.vastUrl.createUrl({
      format: 'leaderboard',
      host: 'https://example.com',
    });

    expect(url).toBeInstanceOf(URL);
    expect(url?.href).toMatch(/https:\/\/example\.com\/ad\/slhomepage-leaderboard\/re\/uraHR0cDovL2xvY2FsaG9zdDozMDAwLw==\/rn\d+\/dtunknown\/brunknown\/tlnone/gu);
  });
});
