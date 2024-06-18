'use client';

import { type ReactElement, useCallback, useId, useRef } from 'react';
import type { AdheseSlotOptions, AdheseSlot as Slot } from '@adhese/sdk';
import { watch } from '@adhese/sdk-shared';
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
 *
 * @warning Make sure to wrap your `setup` function in a `useCallback` as it can trigger an infinite loop if it's not
 * memoized.
 */
// eslint-disable-next-line ts/naming-convention
export function AdheseSlot({
  onChange,
  ...options
}: AdheseSlotProps): ReactElement {
  const element = useRef<HTMLDivElement | null>(null);

  const slot = useAdheseSlot(element, {
    ...options,
    setup: useCallback(((context, hooks): void => {
      options.setup?.(context, hooks);

      watch(context, (newSlot) => {
        onChange?.(newSlot);
      }, { immediate: true, deep: true });
    }) satisfies AdheseSlotOptions['setup'], [options.setup, onChange]),
  });

  const id = useId();

  return (
    <div ref={element} id={`${id}${slot?.id}`} data-name={slot?.name} />
  );
}
