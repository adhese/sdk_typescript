import { type ReactElement, useRef } from 'react';
import type { AdheseSlotContext, AdheseSlotHooks, AdheseSlotOptions, AdheseSlot as Slot } from '@adhese/sdk';
import { type Ref, watch } from '@adhese/sdk-shared';
import { useAdheseSlot } from './useAdheseSlot';

export type AdheseSlotProps = {
  /**
   * Callback to be called when the slot is created or disposed
   */
  onChange?(slot: Slot | null): void;
} & Omit<AdheseSlotOptions, 'containingElement' | 'context'>;

/**
 * Component to create an Adhese slot. The slot will be disposed when the component is unmounted. The slot will be
 * created when the containing element is available and the Adhese instance is available.
 */
// eslint-disable-next-line ts/naming-convention
export function AdheseSlot({
  onChange,
  ...options
}: AdheseSlotProps): ReactElement {
  const element = useRef<HTMLDivElement | null>(null);

  useAdheseSlot(element, {
    ...options,
    setup(context: Ref<AdheseSlotContext | null>, hooks: AdheseSlotHooks) {
      options.setup?.(context, hooks);

      watch(context, (newSlot) => {
        onChange?.(newSlot);
      }, { immediate: true, deep: true });
    },
  });

  return (
    <div ref={element} />
  );
}
