import type { AdheseAd, AdheseSlot as AdheseSlotInstance } from '@adhese/sdk';
import { AdheseSlot } from '@adhese/sdk-react';

import { type ReactElement, useState } from 'react';

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
  const [isSlotShown, setIsSlotShown] = useState(false);

  return (
    <>
      <button onClick={() => { setIsSlotShown(value => !value); }}>Toggle slot</button>
      {
        isSlotShown && (
          <AdheseSlot format="skyscraper" width="100%" />
        )
      }
      <AdheseSlot
        format="halfwidthsmallresponsive"
        render={slot => <AdvarTemplate {...slot} />}

      />
      <AdheseSlot format="leaderboard" renderMode="inline" />
      <div style={{
        height: '150dvh',
        backgroundColor: 'lightgrey',
        display: 'grid',
        alignContent: 'center',
        textAlign: 'center',
      }}
      >
        spacer
      </div>
      <AdheseSlot format="imu" lazyLoading />
    </>
  );
}
// eslint-disable-next-line ts/naming-convention
function AdvarTemplate(slot: AdheseSlotInstance): ReactElement {
  const ad = slot.data as AdheseAd<CustomAdTag>;

  if (typeof ad.tag === 'string')
    // eslint-disable-next-line ts/naming-convention
    return <div dangerouslySetInnerHTML={{ __html: ad.tag }} />;

  const heading = ad.tag.native.assets.find(asset => asset.id === 1)?.title?.text;
  const image = ad.tag.native.assets.find(asset => asset.id === 3)?.img;
  const backgroundColor = ad.tag.native.assets.find(asset => asset.id === 6)?.data?.value;
  const link = ad.tag.native.link.url;
  const linkText = ad.tag.native.assets.find(asset => asset.id === 2)?.data?.value;

  return (
    <a
      href={link}
      style={{
        backgroundImage: `url(${image?.url})`,
        height: `${image?.h}px`,
        backgroundSize: 'contain',
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat',
        backgroundColor,
        padding: '20px',
        maxWidth: `${image?.w}px`,
        display: 'block',
      }}
    >
      <div style={
        {
          maxWidth: '40%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
        }
      }
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
  );
}
