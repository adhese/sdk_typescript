import { type RefObject, useState } from 'react';
import type { AdheseSlot, AdheseSlotOptions } from '@adhese/sdk';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { omit } from 'remeda';
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

  useDeepCompareEffect(() => {
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
  }, [adhese, omit(options, Object.entries(options).filter(([, value]) => typeof value === 'function').map(([key]) => key as keyof typeof options)), elementRef.current]);

  return slot;
}
