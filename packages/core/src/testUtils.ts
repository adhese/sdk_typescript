import { vi } from 'vitest';
import type { AdheseContext } from './main';
import { logger } from './logger/logger';

export const testContext: AdheseContext = {
  location: 'foo',
  consent: false,
  get: vi.fn(() => undefined),
  options: {
    account: 'test',
    host: 'https://ads-test.adhese.com',
    poolHost: 'https://ads-test.adhese.com',
    location: '/foo',
    initialSlots: [],
    logUrl: false,
    logReferrer: false,
    consent: false,
    requestType: 'POST',
    debug: true,
    findDomSlotsOnLoad: false,
    eagerRendering: false,
    viewabilityTracking: true,
    viewabilityTrackingOptions: {
      duration: 50,
    },
  },
  logger,
};
