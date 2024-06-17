import type { ReactElement } from 'react';
import { AdheseSlot } from '@adhese/sdk-react';
import type { AdheseAd, AdheseSlotOptions } from '@adhese/sdk';
import { renderToStaticMarkup } from 'react-dom/server';

function html(data: AdheseAd): AdheseAd<string> | void {
  const ad = data as AdheseAd<{
    type: string;
    text: {
      title: string;
    };
    images?: Array<{
      type: string;
      title: string;
      width: number;
      height: number;
      link: {
        href: string;
      };
    }>;
    backgroundColor: string;
    color: string;
    navItem: {
      title: string;
      link: {
        href: string;
      };
      appLink: string;
    };
  }>;

  if (typeof ad.tag === 'string')
    return ad as AdheseAd<string>;

  const heading = ad.tag.text?.title;
  const image = ad.tag.images?.[0];
  const { backgroundColor } = ad.tag;
  const link = ad.tag.navItem?.link?.href;
  const linkText = ad.tag.images?.[0].title;

  return {
    ...ad,
    tag: renderToStaticMarkup((
      <a
        href={link}
        style={{
          backgroundImage: `url(${image?.link.href})`,
          height: `${image?.height}px`,
          backgroundSize: 'contain',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: `${backgroundColor}`,
          padding: '20px',
          maxWidth: `${image?.width}px`,
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
}

const setupHalfwidthsmallresponsive: AdheseSlotOptions['setup'] = (_, { onBeforeRender }): void => {
  onBeforeRender(html);
};

// eslint-disable-next-line ts/naming-convention
export function Child(): ReactElement {
  return (
    <>
      <div id="top" className="ads">
        <AdheseSlot format="halfwidthsmallresponsive" slot="_homepagetop_left" renderMode="inline" setup={setupHalfwidthsmallresponsive} />
        <AdheseSlot format="halfwidthsmallresponsive" slot="_homepagetop_right" renderMode="inline" setup={setupHalfwidthsmallresponsive} />
      </div>
      <div id="spacer"></div>
      <div id="bottom" className="ads">
        <AdheseSlot format="halfwidthsmallresponsive" slot="_homepagebottom_left" renderMode="inline" setup={setupHalfwidthsmallresponsive} />
        <AdheseSlot format="halfwidthsmallresponsive" slot="_homepagebottom_right" renderMode="inline" setup={setupHalfwidthsmallresponsive} />
      </div>
    </>
  );
}
