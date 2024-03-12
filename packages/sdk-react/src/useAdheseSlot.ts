import { type RefObject, useEffect, useRef, useState } from 'react';
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

  const slotPromise = useRef<Promise<AdheseSlot> | null>(null);
  const intermediateSlot = useRef<AdheseSlot | null>(null);

  useEffect(() => {
    if (elementRef.current && adhese && !slotPromise.current) {
      slotPromise.current = adhese.addSlot({
        ...options,
        containingElement: elementRef.current,
      }).then((fetchedSlot) => {
        intermediateSlot.current = fetchedSlot;

        slotPromise.current = null;

        setSlot(fetchedSlot);

        return fetchedSlot;
      }).catch((error) => {
        throw error;
      });
    }

    return () => {
      intermediateSlot.current?.dispose();
    };
  }, [adhese, options]);

  return slot;
}
