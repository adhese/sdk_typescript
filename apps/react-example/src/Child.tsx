import { type ReactElement, useRef, useState } from 'react';
import { AdheseSlot, useAdheseSlot } from '@adhese/sdk-react';
import type { AdheseAd } from '@adhese/sdk';
import { renderToStaticMarkup } from 'react-dom/server';

// eslint-disable-next-line ts/naming-convention
export function Child(): ReactElement {
  const [isSlotShown, setIsSlotShown] = useState(true);

  const halfwidthsmallresponsiveRef = useRef(null);
  useAdheseSlot(halfwidthsmallresponsiveRef, {
    format: 'halfwidthsmallresponsive',
    renderMode: 'inline',
    onBeforeRender: (ad: AdheseAd<{
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

    }>): AdheseAd<string> | void => {
      if (typeof ad.tag === 'string')
        return ad as AdheseAd<string>;

      const heading = ad.tag.native.assets.find(asset => asset.id === 1)?.title?.text;
      const image = ad.tag.native.assets.find(asset => asset.id === 3)?.img;
      const backgroundColor = ad.tag.native.assets.find(asset => asset.id === 6)?.data?.value;
      const link = ad.tag.native.link.url;
      const linkText = ad.tag.native.assets.find(asset => asset.id === 2)?.data?.value;

      return {
        ...ad,
        tag: renderToStaticMarkup((
          <a
            href={link}
            style={{
              backgroundImage: `url(${image?.url})`,
              height: `${image?.h}px`,
              backgroundSize: 'contain',
              backgroundPosition: 'right center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: `${backgroundColor}`,
              padding: '20px',
              maxWidth: `${image?.w}px`,
              display: 'block',
            }}
          >
            <div style={{
              maxWidth: '40%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
            }}
            >
              <h2 style={{
                fontWeight: 'bold',
                fontSize: '24px',
              }}
              >
                {heading}
              </h2>
              <p>{linkText}</p>
            </div>
          </a>
        )),
      };
    },
  });

  return (
    <>
      <button onClick={() => { setIsSlotShown(value => !value); }}>Toggle slot</button>
      {
        isSlotShown && (
          <AdheseSlot format="skyscraper" />
        )
      }
      <div ref={halfwidthsmallresponsiveRef} />
      <AdheseSlot format="leaderboard" renderMode="inline" />
      <AdheseSlot format="imu" lazyLoading />
    </>
  );
}
