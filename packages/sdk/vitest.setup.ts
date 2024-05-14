import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { mockServer } from 'server-mocking';
// eslint-disable-next-line ts/naming-convention
import MatchMediaMock from 'vitest-matchmedia-mock';

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

  const resizeObserverMock = vi.fn(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    takeRecords: vi.fn(),
    unobserve: vi.fn(),
  }));

  vi.stubGlobal('ResizeObserver', resizeObserverMock);
});
afterEach(() => {
  mockServer.resetHandlers();
});
afterAll(() => {
  mockServer.close();
});

const mediaQueryMock = new MatchMediaMock();

beforeEach(() => {
  mediaQueryMock.useMediaQuery('(max-width: 1025px)');
});

afterEach(() => {
  mediaQueryMock.clear();
});

afterAll(() => {
  mediaQueryMock.destroy();
});
