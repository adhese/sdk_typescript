import type { AdRequestOptions } from '@adhese/sdk';
import { createAsyncHook } from './createHook';

const [runOnRequest, onRequest] = createAsyncHook<AdRequestOptions>('onRequest');

export { runOnRequest, onRequest };
