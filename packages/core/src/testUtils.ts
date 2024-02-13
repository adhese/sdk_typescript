import { vi } from 'vitest';
import type { AdheseContext } from './main';

export const testContext = {
  location: 'foo',
  consent: false,
  get: vi.fn(() => undefined),
  options: {
    account: 'test',
    host: 'https://ads.example.com',
    poolHost: 'https://pool.example.com',
    location: '/foo',
    initialSlots: [],
    logUrl: false,
    logReferrer: false,
    consent: false,
    requestType: 'POST',
    debug: true,
    findDomSlotsOnLoad: false,
    eagerRendering: false,
  },
} satisfies AdheseContext;
