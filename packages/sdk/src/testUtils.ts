import { vi } from 'vitest';
import { logger } from './logger/logger';
import type { AdheseContext } from './main.types';

export const testContext: AdheseContext = {
  location: 'foo',
  consent: false,
  get: vi.fn(() => undefined),
  debug: true,
  isDisposed: false,
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
