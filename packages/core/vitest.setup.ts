import { afterAll, afterEach, beforeAll } from 'vitest';
import { mockServer } from 'server-mocking';

beforeAll(() => {
  mockServer.listen();
});
afterEach(() => {
  mockServer.resetHandlers();
});
afterAll(() => {
  mockServer.close();
});
