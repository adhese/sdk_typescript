import { describe, expect, it } from 'vitest';
import { logger } from '@core';

describe('logger', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have a scope of Adhese SDK', () => {
    expect(logger.scope).toBe('Adhese SDK');
  });
});
