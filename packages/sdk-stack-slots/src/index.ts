import type { AdheseAd } from '@adhese/sdk';
import type { AdheseStackSchema } from './stackSchema';

export { stackSlotsPlugin } from './main';
export type { AdheseStackSchema } from './stackSchema';
export type AdheseStackAd = AdheseAd<AdheseStackSchema['ads']>;
