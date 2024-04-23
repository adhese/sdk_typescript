import type { Ad } from '@adhese/sdk';
import { createAsyncHook } from './createHook';

const [runOnRender, onRender] = createAsyncHook<Ad>('onRender');

export { runOnRender, onRender };
