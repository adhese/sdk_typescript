import { describe, expect, it } from 'vitest';
import { awaitTimeout } from './awaitTimeout';

describe('awaitTimeout', () => {
  it('should resolve after timeout', async () => {
    const timeout = 100;
    const start = performance.now();
    await awaitTimeout(timeout);
    const end = performance.now();
    const fudge = 5;
    expect(end - start).toBeGreaterThanOrEqual(timeout - fudge);
  });
});
