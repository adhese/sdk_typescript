import type { AdheseAd, AdheseSlotOptions } from '@adhese/sdk';
import type { ReactElement } from 'react';
import { AdheseSlot } from '@adhese/sdk-react';
import { renderToStaticMarkup } from 'react-dom/server';

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

function html(data: AdheseAd): AdheseAd<string> | void {
  const ad = data as AdheseAd<Data>;

  if (typeof ad.tag === 'string')
    return ad as AdheseAd<string>;

  return {
    ...ad,
    tag: renderToStaticMarkup((
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
            {ad.tag.title}
          </h2>
        </div>
      </a>
    )),
  };
}

const setupHalfwidthsmallresponsive: AdheseSlotOptions['setup'] = (_, { onBeforeRender }): void => {
  onBeforeRender(html);
};

// eslint-disable-next-line ts/naming-convention
export function Child(): ReactElement {
  return (
    <>
      <div className="ads">
        <AdheseSlot format="flex" slot="_home_1_1" renderMode="inline" setup={setupHalfwidthsmallresponsive} />
        <AdheseSlot format="flex" slot="_home_1_2" renderMode="inline" setup={setupHalfwidthsmallresponsive} />
      </div>

      <div className="ads">
        <AdheseSlot format="flex" slot="_home_2_1" renderMode="inline" setup={setupHalfwidthsmallresponsive} />
        <AdheseSlot format="flex" slot="_home_2_2" renderMode="inline" setup={setupHalfwidthsmallresponsive} />
      </div>
      <div className="ads">
        <AdheseSlot format="flex" slot="_home_3_1" renderMode="inline" setup={setupHalfwidthsmallresponsive} />
        <AdheseSlot format="flex" slot="_home_3_2" renderMode="inline" setup={setupHalfwidthsmallresponsive} />
      </div>
      <div className="ads">
        <AdheseSlot format="flex" slot="_home_4_1" renderMode="inline" setup={setupHalfwidthsmallresponsive} />
        <AdheseSlot format="flex" slot="_home_4_2" renderMode="inline" setup={setupHalfwidthsmallresponsive} />
      </div>
      <div className="ads">
        <AdheseSlot format="flex" slot="_home_5_1" renderMode="inline" setup={setupHalfwidthsmallresponsive} />
        <AdheseSlot format="flex" slot="_home_5_2" renderMode="inline" setup={setupHalfwidthsmallresponsive} />
      </div>
    </>
  );
}
