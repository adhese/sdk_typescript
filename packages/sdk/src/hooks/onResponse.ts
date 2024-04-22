import type { Ad } from '@adhese/sdk';
import { createHook } from './createHook';

const [runOnResponse, onResponse] = createHook<ReadonlyArray<Ad>>('onResponse');

export { runOnResponse, onResponse };
