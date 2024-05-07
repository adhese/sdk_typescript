import type { AdheseAd } from '@adhese/sdk';
import { createAsyncHook } from './createHook';

const [runOnResponse, onResponse] = createAsyncHook<ReadonlyArray<AdheseAd>>('onResponse');

export { runOnResponse, onResponse };
