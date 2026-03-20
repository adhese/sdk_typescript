import type { AdheseSlot, AdheseSlotOptions } from '@adhese/sdk/core';
import { generateSlotSignature } from '@adhese/sdk-shared/core';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAdhese } from './AdheseProvider';

/**
 * Hook to create an Adhese slot in React Native. The slot will be disposed when the
 * component is unmounted. The slot will be created when the Adhese instance is available.
 *
 * Unlike the web version, there is no `elementRef` parameter since React Native
 * has no DOM elements. The slot always uses `renderMode: 'none'` — actual rendering
 * is handled by the React Native component.
 *
 * @param options The options to create the slot
 */
export function useAdheseSlot(options: Omit<AdheseSlotOptions, 'containingElement' | 'context'>): AdheseSlot | null {
  const adhese = useAdhese();

  // Store latest options in a ref to avoid re-creating the slot when callbacks change.
  // Only the slot identity (format, slot name, parameters, location) should trigger re-creation.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const slotSignature = useMemo(() => (adhese?.location) && generateSlotSignature({
    location: adhese.location,
    format: options.format,
    parameters: options.parameters,
    slot: options.slot,
  }), [adhese?.location, options.format, options.slot]);

  const [slot, setSlot] = useState<AdheseSlot | null>(null);

  useEffect(() => {
    let createdSlot: AdheseSlot | null = null;

    if (adhese) {
      createdSlot = adhese.addSlot({
        ...optionsRef.current,
        renderMode: 'none',
      });
      setSlot(createdSlot);
    }

    return (): void => {
      if (createdSlot && !createdSlot.isDisposed) {
        createdSlot.dispose();
      }
      setSlot(null);
    };
  }, [adhese, slotSignature]);

  return slot;
}
