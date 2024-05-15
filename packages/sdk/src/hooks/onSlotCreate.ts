import type { BaseSlot, BaseSlotOptionsWithSetup } from '../slot/slot.types';
import { createSyncHook } from './createHook';

const [runOnSlotCreate, onSlotCreate] = createSyncHook<BaseSlotOptionsWithSetup<BaseSlot>>('onSlotCreate');

export { runOnSlotCreate, onSlotCreate };
