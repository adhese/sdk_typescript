import type { CommerceConfig } from './config';
import { describe, expect, it } from 'vitest';
import { getTargets } from './context';

const base: CommerceConfig = { mode: 'insights', account: 'demo', pageType: 'home' };

describe('context', () => {
  it('sends only the page type on home', () => {
    expect(getTargets({ ...base, sku: 'X' })).toEqual({ pt: 'home' });
  });

  it('sends sku and category on product pages', () => {
    expect(getTargets({ ...base, pageType: 'product', sku: 'S1', category: ['a', 'b'] }))
      .toEqual({ pt: 'product', sk: 'S1', ct: ['a', 'b'] });
  });

  it('sends the search term on search pages and respects custom codes', () => {
    expect(getTargets({ ...base, pageType: 'search', searchTerm: 'x', targetCodes: { searchTerm: 'zz' } }))
      .toEqual({ pt: 'search', zz: 'x' });
  });
});
