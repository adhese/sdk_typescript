/* eslint-disable ts/naming-convention, style/max-statements-per-line */
import { describe, expect, it } from 'vitest';
import { readAemPage } from './data-layer';

const page = { 'page-1': { 'xdm:template': '/conf/site/settings/wcm/templates/article-page', 'xdm:tags': ['marketing:interest/sport', 42, ''], 'dc:title': 'T' } };

function withLayer(layer: unknown, name = 'adobeDataLayer'): Window {
  return { [name]: layer } as unknown as Window;
}

describe('readAemPage', () => {
  it('reads the page from the ACDL computed state', () => {
    expect(readAemPage(withLayer(Object.assign([], { getState: () => ({ page }) }))))
      .toEqual({ template: 'article-page', tags: ['marketing:interest/sport'] });
  });

  it('falls back to the plain array the Core Components fill without the ACDL library', () => {
    expect(readAemPage(withLayer([{ event: 'x' }, { page }]))).toEqual({ template: 'article-page', tags: ['marketing:interest/sport'] });
  });

  it('supports a renamed data layer', () => {
    expect(readAemPage(withLayer([{ page }], 'dataLayer'), 'dataLayer')?.template).toBe('article-page');
  });

  it('caps the tags at ten', () => {
    const tags = Array.from({ length: 15 }, (_, index) => `t:${index}`);
    expect(readAemPage(withLayer([{ page: { p: { 'xdm:tags': tags } } }]))?.tags).toHaveLength(10);
  });

  it('is null when the data layer is disabled, empty or throws', () => {
    expect(readAemPage(withLayer(undefined))).toBeNull();
    expect(readAemPage(withLayer([]))).toBeNull();
    expect(readAemPage(withLayer(Object.assign([], { getState: () => { throw new Error('boom'); } })))).toBeNull();
  });
});
