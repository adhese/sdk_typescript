import { type RefObject, useEffect, useState } from 'react';
import type { AdheseSlot, AdheseSlotOptions } from '@adhese/sdk';
import { useAdhese } from './adheseContext';

/**
 * Hook to create an Adhese slot. The slot will be disposed when the component is unmounted. The slot will be created
 * when the containing element is available and the Adhese instance is available.
 * @param elementRef The ref to the containing element
 * @param options The options to create the slot
 */
export function useAdheseSlot(elementRef: RefObject<HTMLElement>, options: Omit<AdheseSlotOptions, 'containingElement' | 'context'>): AdheseSlot | null {
  const [slot, setSlot] = useState<AdheseSlot | null>(null);
  const adhese = useAdhese();

  useEffect(() => {
    let intermediate: AdheseSlot | undefined;

    if (adhese && elementRef.current) {
      intermediate = adhese.add(
        {
          ...options,
          containingElement: elementRef.current,
        },
      );

      setSlot(intermediate);
    }
    return () => {
      intermediate?.dispose();
    };
  }, [adhese, options, elementRef.current]);

  return slot;
}
