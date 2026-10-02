import type { AdheseContext } from './main.types';
import { createEventManager } from '@adhese/sdk-shared';
import { createGlobalHooks } from './hooks';

import { logger } from './logger/logger';

export const testContext: AdheseContext = {
  location: 'foo',
  consent: false,
  debug: true,
  isDisposed: false,
  slots: new Map(),
  hooks: createGlobalHooks(),
  options: {
    account: 'test',
    host: 'https://test.ads.adhese.eu',
    poolHost: 'https://test.ads.adhese.eu',
    previewHost: 'https://test.preview.adhese.eu',
    location: 'foo',
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
