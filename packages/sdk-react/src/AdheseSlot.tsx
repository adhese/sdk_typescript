'use client';

import type { AdheseSlotOptions, AdheseSlot as Slot } from '@adhese/sdk';
import { watch } from '@adhese/sdk-shared';
import { type HTMLAttributes, type ReactElement, useCallback, useId, useRef } from 'react';
import { useAdheseSlot } from './useAdheseSlot';

export type AdheseSlotProps = {
  /**
   * Callback to be called when the slot is created or disposed
   */
  onChange?(slot: Slot | null): void;
} & Omit<AdheseSlotOptions, 'containingElement' | 'context'> & HTMLAttributes<HTMLDivElement>;

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
  width,
  height,
  lazyLoading,
  lazyLoadingOptions,
  slot,
  pluginOptions,
  renderMode,
  type,
  setup,
  parameters,
  format,
  style,
  id,
  ...props
}: AdheseSlotProps): ReactElement {
  const element = useRef<HTMLDivElement | null>(null);

  const slotState = useAdheseSlot(element, {
    width,
    height,
    lazyLoading,
    lazyLoadingOptions,
    slot,
    pluginOptions,
    renderMode,
    type,
    parameters,
    format,
    setup: useCallback(((context, hooks): void => {
      setup?.(context, hooks);

      watch(context, (newSlot) => {
        onChange?.(newSlot);
      }, { immediate: true, deep: true });
    }) satisfies AdheseSlotOptions['setup'], [setup, onChange]),
  });

  const componentId = useId();

  return (
    <div
      ref={element}
      id={id && `${componentId}${slotState?.id}`}
      data-name={slotState?.name}
      style={{
        width: slotState?.options.width,
        height: slotState?.options.height,
        ...style,
      }}
      {...props}
    />
  );
}
