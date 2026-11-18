import { describe, expect, it } from 'vitest';
import { escapeHtml, httpsUrl, parseNative, renderNativeTile } from './native';

const valid = { ver: '1', title: 'Summer sale', url: 'https://shop.test/sale', body: 'Up to 50%', image: 'https://cdn.test/a.jpg', cta: 'Shop now', advertiser: 'Acme' };

describe('parseNative', () => {
  it('accepts a valid payload as object or JSON string', () => {
    const expected = { title: valid.title, url: valid.url, body: valid.body, image: valid.image, cta: valid.cta, advertiser: valid.advertiser };

    expect(parseNative(valid)).toEqual(expected);
    expect(parseNative(JSON.stringify(valid))).toEqual(expected);
  });

  it('drops unknown fields', () => {
    expect(parseNative({ ...valid, onclick: 'x()', html: '<b>' })).not.toHaveProperty('onclick');
  });

  it.each([
    ['wrong version', { ...valid, ver: '2' }],
    ['missing title', { ...valid, title: ' ' }],
    ['http landing url', { ...valid, url: 'http://shop.test' }],
    ['non-https scheme', { ...valid, url: 'data:text/html,x' }],
    ['missing url', { ver: '1', title: 'x' }],
  ])('treats %s as empty', (_name, payload) => {
    expect(parseNative(payload)).toBeNull();
  });

  it('treats non-objects and bad JSON as empty', () => {
    expect(parseNative('nope')).toBeNull();
    expect(parseNative(null)).toBeNull();
    expect(parseNative([valid])).toBeNull();
    expect(parseNative(42)).toBeNull();
  });

  it('drops a non-https image but keeps the ad', () => {
    expect(parseNative({ ...valid, image: 'http://cdn.test/a.jpg' })?.image).toBeUndefined();
  });

  it('limits text length', () => {
    expect(parseNative({ ...valid, title: 'x'.repeat(500) })?.title).toHaveLength(120);
  });
});

describe('renderNativeTile', () => {
  it('escapes text and uses the click tracker as link', () => {
    const html = renderNativeTile({ title: '<img src=x onerror=1>', url: 'https://shop.test', advertiser: '"A"&' }, 'https://click.adhese.test/c/1');

    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x onerror=1&gt;');
    expect(html).toContain('href="https://click.adhese.test/c/1"');
    expect(html).toContain('Sponsored · &quot;A&quot;&amp;');
  });

  it('falls back to the landing url when the click url is not https', () => {
    expect(renderNativeTile({ title: 't', url: 'https://shop.test/x' }, 'data:text/html,x')).toContain('href="https://shop.test/x"');
  });

  it('renders as real DOM without injected elements', () => {
    const host = document.createElement('div');
    host.innerHTML = renderNativeTile({ title: '<script>x</script>', url: 'https://a.test' });

    expect(host.querySelector('script')).toBeNull();
  });
});

describe('helpers', () => {
  it('escapes html and filters urls', () => {
    expect(escapeHtml('<a href=\'x\'>&</a>')).toBe('&lt;a href=&#39;x&#39;&gt;&amp;&lt;/a&gt;');
    expect(httpsUrl('ftp://a')).toBeUndefined();
    expect(httpsUrl(undefined)).toBeUndefined();
  });
});
