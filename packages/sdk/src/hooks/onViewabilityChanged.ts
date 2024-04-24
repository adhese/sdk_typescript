import { createPassiveHook } from './createHook';

const [runOnViewabilityChanged, onViewabilityChanged] = createPassiveHook<{
  name: string;
  isInViewport: boolean;
}>('onViewabilityChanged');

export { runOnViewabilityChanged, onViewabilityChanged };
