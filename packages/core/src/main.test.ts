import { expect, it } from 'vitest';
import { createAdhese, defaultAdheseOptions } from './main';

it('should create an adhese instance', () => {
  const adhese = createAdhese({
    account: 'test',
  });

  expect(adhese).not.toBeUndefined();
});

it('should create an adhese instance with default options', () => {
  const adhese = createAdhese({
    account: 'test',
  });

  expect(adhese).toMatchObject({
    ...defaultAdheseOptions,
    account: 'test',
  });
});

it('should create an adhese instance with custom options', () => {
  const adhese = createAdhese({
    account: 'test',
    hostUrl: 'https://example.com',
    pageLocation: new URL('https://example.com'),
  });

  expect(adhese).toMatchObject({
    account: 'test',
    hostUrl: 'https://example.com',
    pageLocation: new URL('https://example.com'),
  });
});
