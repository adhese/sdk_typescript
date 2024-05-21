import type { AdheseSlotOptions } from '@adhese/sdk';
import { createSyncHook } from './createHook';

const [runOnSlotCreate, onSlotCreate] = createSyncHook<AdheseSlotOptions>('onSlotCreate');

export { runOnSlotCreate, onSlotCreate };
