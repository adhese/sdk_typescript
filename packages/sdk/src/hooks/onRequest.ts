import type { AdRequestOptions } from '@adhese/sdk';
import { createHook } from './createHook';

const [runOnRequest, onRequest] = createHook<AdRequestOptions>('onRequest');

export { runOnRequest, onRequest };
