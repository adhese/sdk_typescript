import { lazy } from 'react';

// eslint-disable-next-line ts/naming-convention
export const AdheseSlot = lazy(() => import('./AdheseSlot').then(module => ({ default: module.AdheseSlot })));
