import type { AdheseSlot, AdheseSlotOptions } from '@adhese/sdk';
import { generateSlotSignature, watch } from '@adhese/sdk-shared';
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAdhese } from './adheseContext';

/**
 * Hook to create an Adhese slot. The slot will be disposed when the component is unmounted. The slot will be created
 * when the containing element is available and the Adhese instance is available.
 * @param elementRef The ref to the containing element
 * @param options The options to create the slot
 *
 * @warning Make sure to wrap your `setup` function in a `useCallback` as it can trigger an infinite loop if it's not
 * memoized.
 */
export function useAdheseSlot(elementRef: RefObject<HTMLElement> | string, options: Omit<AdheseSlotOptions, 'containingElement' | 'context'>): AdheseSlot | null {
  const adhese = useAdhese();

  const slotSignature = useMemo(() => (adhese?.location) && generateSlotSignature({
    location: adhese.location,
    format: options.format,
    parameters: options.parameters,
    slot: options.slot,
  }), [adhese?.location, options.format, options.slot]);

  const [slot, setSlot] = useState<AdheseSlot | null>(null);

  const setup = useCallback(((context, hooks): void => {
    options.setup?.(context, hooks);

    watch(context, (newSlot) => {
      setSlot(newSlot && { ...newSlot });
    }, { deep: true, immediate: true });
  }) satisfies AdheseSlotOptions['setup'], [options.setup]);

  useEffect(() => {
    const element = typeof elementRef === 'string' ? elementRef : elementRef.current;

    if (adhese && element) {
      adhese?.addSlot({
        ...options,
        containingElement: element,
        setup,
      });
    }

    return (): void => {
      setSlot(null);
    };
  }, [adhese, ...Object.values(options), slotSignature]);

  return slot;
}
