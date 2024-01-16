import { describe, expect, it } from 'vitest';
import { logger } from './logger';

describe('logger', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have a name of Adhese SDK', () => {
    expect(logger.bindings().name).toBe('Adhese SDK');
  });
});
