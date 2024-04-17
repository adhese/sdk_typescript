import type { AdheseSlotOptions } from '@core';
import { type ReactElement, useRef } from 'react';
import { useAdheseSlot } from '@adhese/sdk-react';

// eslint-disable-next-line ts/naming-convention
export function AdheseSlot({ options }: { options: Omit<AdheseSlotOptions, 'containingElement' | 'context'> }): ReactElement {
  const elementRef = useRef<HTMLDivElement>(null);
  useAdheseSlot(elementRef, options);

  return (
    <div ref={elementRef} />
  );
}
