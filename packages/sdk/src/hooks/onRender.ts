import type { Ad } from '@adhese/sdk';
import { createHook } from './createHook';

const [runOnRender, onRender] = createHook<Ad>('onRender');

export { runOnRender, onRender };
