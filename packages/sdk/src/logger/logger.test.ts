import { describe, expect, it } from 'vitest';
import { name, version } from '../../package.json';
import { logger } from './logger';

describe('logger', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it(`should have a scope of ${name}@${version}`, () => {
    expect(logger.scope).toBe(`${name}@${version}`);
  });
});
