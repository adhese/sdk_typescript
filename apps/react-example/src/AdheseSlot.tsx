import type { Slot, SlotOptions } from '@core';
import { type ReactElement, type RefObject, useEffect, useRef, useState } from 'react';
import { useAdhese } from './adheseContext';

// eslint-disable-next-line ts/naming-convention
export function AdheseSlot({ options }: { options: Omit<SlotOptions, 'containingElement' | 'context'> }): ReactElement {
  const elementRef = useRef<HTMLDivElement>(null);
  useAdheseSlot(elementRef, options);

  return (
    <div ref={elementRef} />
  );
}

export function useAdheseSlot(elementRef: RefObject<HTMLElement>, options: Omit<SlotOptions, 'containingElement' | 'context'>): Slot | null {
  const [slot, setSlot] = useState<Slot | null>(null);
  const adhese = useAdhese();

  const slotPromise = useRef<Promise<Slot> | null>(null);
  const intermediateSlot = useRef<Slot | null>(null);

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
