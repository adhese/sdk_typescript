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

  expect(adhese).toMatchObject({
    account: 'demo',
    adUrl: `https://ads-${adhese.account}.adhese.com`,
    poolUrl: `https://pool-${adhese.account}.adhese.com`,
    pageLocation: new URL(location.toString()),
  });
});

it('should create an adhese instance with custom options', () => {
  const adhese = createAdhese({
    account: 'demo',
    adUrl: 'https://ads.example.com',
    poolUrl: 'https://pool.example.com',
    pageLocation: new URL('https://example.com'),
  });

  expect(adhese).toMatchObject({
    account: 'demo',
    adUrl: 'https://ads.example.com',
    poolUrl: 'https://pool.example.com',
    pageLocation: new URL('https://example.com'),
  });
});
