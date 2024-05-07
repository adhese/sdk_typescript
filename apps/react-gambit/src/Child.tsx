import { type ReactElement, useRef } from 'react';
import { useAdheseSlot } from '@adhese/sdk-react';
import type { AdheseAd } from '@adhese/sdk';
import { renderToStaticMarkup } from 'react-dom/server';

// eslint-disable-next-line ts/naming-convention
export function Child(): ReactElement {
  const html
    = (ad: AdheseAd<{
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
    }>): AdheseAd<string> | void => {
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
    };

  const topRight = useRef(null);
  useAdheseSlot(topRight, {
    format: 'halfwidthsmallresponsive',
    slot: '_homepagetop_right',
    renderMode: 'inline',
    onBeforeRender: html,
  });

  const topLeft = useRef(null);
  useAdheseSlot(topLeft, {
    format: 'halfwidthsmallresponsive',
    slot: '_homepagetop_left',
    renderMode: 'inline',
    onBeforeRender: html,
  });

  const bottomRight = useRef(null);
  useAdheseSlot(bottomRight, {
    format: 'halfwidthsmallresponsive',
    slot: '_homepagebottom_right',
    renderMode: 'inline',
    onBeforeRender: html,
  });

  const bottomLeft = useRef(null);
  useAdheseSlot(bottomLeft, {
    format: 'halfwidthsmallresponsive',
    slot: '_homepagebottom_left',
    renderMode: 'inline',
    onBeforeRender: html,
  });

  return (
    <>
      <div id="top" className="ads">
        <div ref={topRight} />
        <div ref={topLeft} />
      </div>
      <div id="spacer"></div>
      <div id="bottom" className="ads">
        <div ref={bottomRight} />
        <div ref={bottomLeft} />
      </div>
    </>
  );
}
