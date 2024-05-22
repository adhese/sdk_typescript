import type { AdheseAd } from '@adhese/sdk';
import type { AdheseStackSchema } from './stackSlots.schema';

export { stackSlotsPlugin } from './stackSlots';
export type { AdheseStackSchema } from './stackSlots.schema';
export type AdheseStackAd = AdheseAd<AdheseStackSchema['ads']>;
