import { type ReactElement, useEffect, useRef } from 'react';
import type { AdheseSlotOptions, AdheseSlot as Slot } from '@adhese/sdk';
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

  const slot = useAdheseSlot(element, options);

  useEffect(() => {
    onChange?.(slot);
  }, [onChange, slot]);

  return (
    <div ref={element} />
  );
}
