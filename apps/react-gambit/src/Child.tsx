import type { AdheseAd, AdheseSlot as AdheseSlotInstance } from '@adhese/sdk';
import type { ReactElement } from 'react';
import { AdheseSlot } from '@adhese/sdk-react';

export type Data = {
  type: string;
  // eslint-disable-next-line ts/naming-convention
  documentUUID: string;
  title: string;
  subtitle: string;
  link: Link;
  isExternalLink: boolean;
  isExternalMobileLink: boolean;
  visual: Visual;
  sticker: Asset;
};

export type Link = {
  color: string;
  theme: string;
  href: string;
  target: string;
  title: string;
  mobileLink: string;
  isExternalMobileLink: boolean;
  isExternalLink: boolean;
};

export type Asset = {
  variants: Array<Variant>;
  description: string;
};

export type Variant = {
  url: string;
  width: number;
  height: number;
  variant: string;
};

export type Visual = {
  renderType: string;
  image: Asset;
  shortImage: Asset;
  longImage: Asset;
  theme: string;
};

// eslint-disable-next-line ts/naming-convention
export function Child(): ReactElement {
  return (
    <>
      <div className="ads">
        <AdheseSlot format="flex" slot="_home_1_1" placeholder={<div>loading</div>} render={slot => <FlexAdvar {...slot} />} />
        <AdheseSlot format="flex" slot="_home_1_2" placeholder={<div>loading</div>} render={slot => <FlexAdvar {...slot} />} />

        <AdheseSlot format="flex" slot="_home_2_1" placeholder={<div>loading</div>} render={slot => <FlexAdvar {...slot} />} />
        <AdheseSlot format="flex" slot="_home_2_2" placeholder={<div>loading</div>} render={slot => <FlexAdvar {...slot} />} />

        <AdheseSlot format="flex" slot="_home_3_1" placeholder={<div>loading</div>} render={slot => <FlexAdvar {...slot} />} />
        <AdheseSlot format="flex" slot="_home_3_2" placeholder={<div>loading</div>} render={slot => <FlexAdvar {...slot} />} />

        <AdheseSlot format="flex" slot="_home_4_1" placeholder={<div>loading</div>} render={slot => <FlexAdvar {...slot} />} />
        <AdheseSlot format="flex" slot="_home_4_2" placeholder={<div>loading</div>} render={slot => <FlexAdvar {...slot} />} />

        <AdheseSlot format="flex" slot="_home_5_1" placeholder={<div>loading</div>} render={slot => <FlexAdvar {...slot} />} />
        <AdheseSlot format="flex" slot="_home_5_2" placeholder={<div>loading</div>} render={slot => <FlexAdvar {...slot} />} />
      </div>
    </>
  );
}

// eslint-disable-next-line ts/naming-convention
function FlexAdvar(slot: AdheseSlotInstance): ReactElement {
  const ad = slot.data as AdheseAd<Data>;

  if (typeof ad.tag === 'string') {
    return (
      <div dangerouslySetInnerHTML={{
        // eslint-disable-next-line ts/naming-convention
        __html: ad.tag,
      }}
      >
      </div>
    );
  }

  return (
    <a
      href={ad.tag.link.href}
      style={{
        backgroundImage: `url(${ad.tag.visual.longImage.variants[0].url})`,
        height: `${100}px`,
        backgroundSize: 'contain',
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'lightgray',
        padding: '20px',
        display: 'block',
      }}
    >
      <div style={{
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
          {ad.tag.title}
        </h2>
      </div>
    </a>
  );
}
