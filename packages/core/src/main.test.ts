import { expect, it } from 'vitest';
import { createAdhese } from './main';

it('should create an adhese instance', () => {
  const adhese = createAdhese({
    account: 'demo',
  });

  expect(adhese).not.toBeUndefined();
});

it('should create an adhese instance with default options', () => {
  const adhese = createAdhese({
    account: 'demo',
  });

  expect(adhese.account).toBe('demo');
  expect(adhese.host).toBe('https://ads-demo.adhese.com');
  expect(adhese.poolHost).toBe('https://pool-demo.adhese.com');
  expect(adhese.pageLocation).toMatchObject(new URL(location.toString()));
  expect(adhese.requestType).toBe('POST');
});

it('should create an adhese instance with custom options', () => {
  const adhese = createAdhese({
    account: 'demo',
    host: 'https://ads.example.com',
    poolHost: 'https://pool.example.com',
    pageLocation: new URL('https://example.com'),
    requestType: 'GET',
  });

  expect(adhese.account).toBe('demo');
  expect(adhese.host).toBe('https://ads.example.com');
  expect(adhese.poolHost).toBe('https://pool.example.com');
  expect(adhese.pageLocation).toMatchObject(new URL('https://example.com'));
  expect(adhese.requestType).toBe('GET');
});
