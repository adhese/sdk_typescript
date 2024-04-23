import type { Ad } from '@adhese/sdk';
import { createAsyncHook } from './createHook';

const [runOnResponse, onResponse] = createAsyncHook<ReadonlyArray<Ad>>('onResponse');

export { runOnResponse, onResponse };
