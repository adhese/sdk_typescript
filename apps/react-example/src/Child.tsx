import { type ReactElement, useMemo, useState } from 'react';
import type { Ad } from '@core';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdheseSlot } from './AdheseSlot';

// eslint-disable-next-line ts/naming-convention
export function Child(): ReactElement {
  const [isSlotShown, setIsSlotShown] = useState(true);
  return (
    <>
      <button onClick={() => { setIsSlotShown(value => !value); }}>Toggle slot</button>
      {
        isSlotShown && (
          <AdheseSlot options={{
            format: 'skyscraper',
          }}
          />
        )
      }
      <AdheseSlot options={useMemo(() => ({
        format: 'halfwidthsmallresponsive',
        renderMode: 'inline',
        onBeforeRender(ad: Ad<{
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

        }>): Ad<string> | void {
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
      }), [])}
      />
      <div
        style={{
          height: `calc(100vh + 400px)`,
          border: '4px solid red',
        }}
      >
        spacer
      </div>
      <AdheseSlot options={useMemo(() => ({
        format: 'leaderboard',
      }), [])}
      />
      <AdheseSlot options={useMemo(() => ({
        format: 'imu',
        lazyLoading: true,
      }), [])}
      />
    </>
  );
}
