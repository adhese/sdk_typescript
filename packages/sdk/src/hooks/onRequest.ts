import type { AdMultiRequestOptions } from '../requestAds/requestAds';
import { createAsyncHook } from './createHook';

const [runOnRequest, onRequest] = createAsyncHook<AdMultiRequestOptions>('onRequest');

export { runOnRequest, onRequest };
