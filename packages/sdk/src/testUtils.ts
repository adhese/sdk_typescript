import { createEventManager } from '@adhese/sdk-shared';
import type { AdheseContext } from './main.types';
import { logger } from './logger/logger';

export const testContext: AdheseContext = {
  location: 'foo',
  consent: false,
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
  events: createEventManager(),
  parameters: new Map(),
};
