'use client';

import type { AdheseSlotOptions, AdheseSlot as Slot } from '@adhese/sdk';
import { watch } from '@adhese/sdk-shared';
import { type HTMLAttributes, type ReactNode, useCallback, useId } from 'react';
import { useAdheseSlot } from './useAdheseSlot';

export type AdheseSlotProps = {
  /**
   * Placeholder to be shown when the slot is not rendered yet.
   */
  placeholder?: ReactNode;
  /**
   * Callback to be called when the slot is created or disposed
   */
  onChange?(slot: Slot | null): void;
  /**
   * Inject custom React elements into the slot when it's rendered.
   */
  render?(slot: Slot): ReactNode;
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
  id,
  render,
  placeholder,
  ...props
}: AdheseSlotProps): ReactNode {
  const reactId = useId().replaceAll(':', '');
  const componentId = id ?? `slot-${reactId}`;

  const slotState = useAdheseSlot(componentId, {
    width,
    height,
    lazyLoading,
    lazyLoadingOptions,
    slot,
    pluginOptions,
    renderMode: render ? 'none' : renderMode,
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

  const { status, name, format: slotFormat } = slotState ?? {};

  if (!slotState || (status === 'error' || status === 'empty')) {
    return null;
  }

  return (
    <div
      data-name={name}
      data-status={status}
      data-format={slotFormat}
      data-slot={slot}
      id={componentId}
      {...props}
    >
      {(status === 'loading' || status === 'initialized' || status === 'initializing') && placeholder}

      {status === 'rendered' && render?.(slotState)}
    </div>
  );
}
