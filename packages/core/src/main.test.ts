import { expect, it } from 'vitest';
import { createAdhese } from './main';

it('should create an adhese instance', () => {
  const adhese = createAdhese();
  expect(adhese.test).toBe('test');
});
