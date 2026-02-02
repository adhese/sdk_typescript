'use client';

import { useEffect, useRef } from 'react';
import type { AdheseAd } from '@adhese/sdk';
import { addTrackingPixel } from '@adhese/sdk-shared';

type AdSlotProps = {
  ad: AdheseAd;
};

export function AdSlot({ ad }: AdSlotProps): React.ReactNode {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) {
      return;
    }
    trackedRef.current = true;

    if (ad.impressionCounter) {
      addTrackingPixel(ad.impressionCounter);
    }

    if (ad.viewableImpressionCounter) {
      addTrackingPixel(ad.viewableImpressionCounter);
    }

    if (ad.tracker) {
      addTrackingPixel(ad.tracker);
    }
  }, [ad]);

  const width = ad.width;
  const height = ad.height;
  const isFlexible = !width || width <= 1 || !height || height <= 1;

  return (
    <div
      className="ad-slot"
      style={{
        width: isFlexible ? '100%' : `${width}px`,
        minHeight: isFlexible ? 'auto' : `${height}px`,
      }}
    >
      <div className="ad-slot-header">
        {ad.slotName} {isFlexible ? '(flexible)' : `(${width}x${height})`}
      </div>

      {typeof ad.tag === 'string'
        ? (
            <div
              dangerouslySetInnerHTML={{ __html: ad.tag }}
              style={{ width: '100%', height: '100%' }}
              suppressHydrationWarning
            />
          )
        : (
            <div className="ad-slot-empty">
              No creative content
            </div>
          )}
    </div>
  );
}
