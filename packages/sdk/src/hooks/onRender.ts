import type { AdheseAd } from '@adhese/sdk';
import { createAsyncHook } from './createHook';

const [runOnRender, onRender] = createAsyncHook<AdheseAd>('onRender');

export { runOnRender, onRender };
