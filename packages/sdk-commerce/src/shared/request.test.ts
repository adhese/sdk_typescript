import { describe, expect, it } from 'vitest';
import { buildAdRequestUrl, deviceParams } from './request';

describe('buildAdRequestUrl', () => {
  it('builds the slot and parameter path', () => {
    expect(buildAdRequestUrl({
      account: 'demo',
      location: 'shop',
      slots: [{ format: 'insights' }],
      parameters: { ct: ['Men', 'Shoes'], kw: 'Red Shoes' },
    })).toBe('https://ads-demo.adhese.com/json/slshop-insights/ctmen;shoes/kwred_shoes');
  });

  it('drops keys that are not 2 characters', () => {
    expect(buildAdRequestUrl({ account: 'demo', location: 'a', slots: [{ format: 'f' }], parameters: { abc: 'x' } }))
      .toBe('https://ads-demo.adhese.com/json/sla-f');
  });

  it('uses a custom host', () => {
    expect(buildAdRequestUrl({ account: 'demo', host: 'https://x.test/', location: 'a', slots: [{ format: 'f' }] }))
      .toBe('https://x.test/json/sla-f');
  });
});

describe('deviceParams', () => {
  it('returns dt and br', () => {
    const win = { matchMedia: (q: string) => ({ matches: q.includes('768') }) } as unknown as Window;
    expect(deviceParams(win)).toEqual({ dt: 'phone', br: 'phone' });
  });
});
