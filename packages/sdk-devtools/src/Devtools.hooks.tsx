import { type RefObject, useEffect, useState } from 'react';

export function useSpacing(isOpen: boolean, appRef: RefObject<HTMLDivElement | null>): number {
  const [spacing, setSpacing] = useState(0);
  useEffect(() => {
    let resizeObserver: ResizeObserver | undefined;

    if (isOpen) {
      resizeObserver = new ResizeObserver(([entry]) => {
        setSpacing(entry.target.getBoundingClientRect().height);
      },
      );

      if (appRef.current)
        resizeObserver.observe(appRef.current);
    }

    return (): void => {
      resizeObserver?.disconnect();
    };
  }, [isOpen]);
  return spacing;
}
