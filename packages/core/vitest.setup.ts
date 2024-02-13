import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { mockServer } from 'server-mocking';

beforeAll(() => {
  mockServer.listen();
});
beforeEach(() => {
  const intersectionObserverMock = vi.fn(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    takeRecords: vi.fn(),
    unobserve: vi.fn(),
  }));

  vi.stubGlobal('IntersectionObserver', intersectionObserverMock);
});
afterEach(() => {
  mockServer.resetHandlers();
});
afterAll(() => {
  mockServer.close();
});
