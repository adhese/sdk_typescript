import { type RefObject, useEffect, useRef } from 'react';
import type { AdheseSlot, AdheseSlotOptions } from '@adhese/sdk';
import { useAdhese } from './adheseContext';

/**
 * Hook to create an Adhese slot. The slot will be disposed when the component is unmounted. The slot will be created
 * when the containing element is available and the Adhese instance is available.
 * @param elementRef The ref to the containing element
 * @param options The options to create the slot
 */
export function useAdheseSlot(elementRef: RefObject<HTMLElement>, options: Omit<AdheseSlotOptions, 'containingElement' | 'context'>): RefObject<AdheseSlot | null> {
  const slot = useRef<AdheseSlot | null>(null);
  const adhese = useAdhese();

  useEffect(() => {
    if (!adhese || !elementRef.current)
      return;

    slot.current = adhese?.addSlot({
      ...options,
      containingElement: elementRef.current,
    });
    return (): void => {
      slot.current?.dispose();
    };
  }, [adhese?.addSlot, options, elementRef.current]);

  return slot;
}
