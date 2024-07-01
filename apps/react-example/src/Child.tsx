import { type ReactElement, useCallback, useRef, useState } from 'react';
import { AdheseSlot, useAdheseSlot } from '@adhese/sdk-react';
import type { AdheseAd, AdheseSlotOptions } from '@adhese/sdk';

type CustomAdTag = {
  type: string;
  native: {
    ver: string;
    assets: ReadonlyArray<{
      id: number;
      title?: {
        text: string;
      };
      data?: {
        type: number;
        value: string;
      };
      img?: {
        url: string;
        w: string;
        h: string;
      };
    }>;
    link: {
      url: string;
      fallback: string;
    };
  };
};

// eslint-disable-next-line ts/naming-convention
export function Child(): ReactElement {
  const [isSlotShown, setIsSlotShown] = useState(true);

  const halfwidthsmallresponsiveRef = useRef(null);
  useAdheseSlot(halfwidthsmallresponsiveRef, {
    format: 'halfwidthsmallresponsive',
    renderMode: 'inline',
    setup: useCallback(((_, { onBeforeRender }): void => {
      onBeforeRender((data) => {
        const ad = data as AdheseAd<CustomAdTag>;

        if (typeof ad.tag === 'string')
          return ad as AdheseAd<string>;

        const heading = ad.tag.native.assets.find(asset => asset.id === 1)?.title?.text;
        const image = ad.tag.native.assets.find(asset => asset.id === 3)?.img;
        const backgroundColor = ad.tag.native.assets.find(asset => asset.id === 6)?.data?.value;
        const link = ad.tag.native.link.url;
        const linkText = ad.tag.native.assets.find(asset => asset.id === 2)?.data?.value;

        return {
          ...ad,
          tag: `
            <a href="${link}" style="
              background-image: url(${image?.url});
              height: ${image?.h}px;
              background-size: contain;
              background-position: right center;
              background-repeat: no-repeat;
              background-color: ${backgroundColor};
              padding: 20px;
              max-width: ${image?.w}px;
              display: block">
              <div style="
                max-width: 40%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height: 100%;">
                <h2 style="font-weight: bold; font-size: 24px;">${heading}</h2>
                <p>${linkText}</p>
              </div>
            </a>`,
        };
      });
    }) satisfies AdheseSlotOptions['setup'], []),
  });

  return (
    <>
      <button onClick={() => { setIsSlotShown(value => !value); }}>Toggle slot</button>
      {
        isSlotShown && (
          <AdheseSlot format="skyscraper" width="100%" />
        )
      }
      <div ref={halfwidthsmallresponsiveRef} />
      <AdheseSlot format="leaderboard" renderMode="inline" />
      <AdheseSlot format="imu" lazyLoading />
      <AdheseSlot
        format="newstack"
        type="stack"
        pluginOptions={{
          stackSlots: {
            maxAds: 3,
          },
        }}
        setup={useCallback(((_, { onBeforeRender }): void => {
          onBeforeRender((data) => {
            const ad = data as AdheseAd<ReadonlyArray<CustomAdTag>>;

            if (typeof ad.tag === 'string')
              return ad as AdheseAd<string>;

            return {
              ...ad,
              tag: ad.tag.map(renderAd).join(''),
            };
          });
        }) satisfies AdheseSlotOptions['setup'], [])}
      />
    </>
  );
}

function renderAd(ad: CustomAdTag): string {
  const heading = ad.native.assets.find(asset => asset.id === 1)?.title?.text;
  const image = ad.native.assets.find(asset => asset.id === 3)?.img;
  const backgroundColor = ad.native.assets.find(asset => asset.id === 6)?.data?.value;
  const link = ad.native.link.url;
  const linkText = ad.native.assets.find(asset => asset.id === 2)?.data?.value;

  return `
    <a href="${link}" style="
      background-image: url(${image?.url});
      height: ${image?.h}px;
      background-size: contain;
      background-position: right center;
      background-repeat: no-repeat;
      background-color: ${backgroundColor};
      padding: 20px;
      max-width: ${image?.w}px;
      display: block">
      <div style="
        max-width: 40%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;">
        <h2 style="font-weight: bold; font-size: 24px;">${heading}</h2>
        <p>${linkText}</p>
      </div>
    </a>`;
}
