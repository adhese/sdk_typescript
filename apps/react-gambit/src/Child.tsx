import { type ReactElement, useRef, useState } from 'react';
import { useAdheseSlot } from '@adhese/sdk-react';
import type { Ad } from '@adhese/sdk';
import { renderToStaticMarkup } from 'react-dom/server';

// eslint-disable-next-line ts/naming-convention
export function Child(): ReactElement {

  const html =
    (ad: Ad<{
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
        }
      }>;
      backgroundColor: string;
      color: string;
      navItem: {
        title: string;
        link: {
          href: string;
        },
        appLink: string;
      };
    }>): Ad<string> | void => {
      if (typeof ad.tag === 'string')
        return ad as Ad<string>;

      const heading = ad.tag.text?.title;
      const image = ad.tag.images?.[0];
      const backgroundColor = ad.tag.backgroundColor;
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

  const TopRight = useRef(null);
  useAdheseSlot(TopRight, {
    format: 'halfwidthsmallresponsive',
    slot: '_homepagetop_right',
    renderMode: 'inline',
    onBeforeRender: html
  });

  const TopLeft = useRef(null);
  useAdheseSlot(TopLeft, {
    format: 'halfwidthsmallresponsive',
    slot: '_homepagetop_left',
    renderMode: 'inline',
    onBeforeRender: html
  });

  const BottomRight = useRef(null);
  useAdheseSlot(BottomRight, {
    format: 'halfwidthsmallresponsive',
    slot: '_homepagebottom_right',
    renderMode: 'inline',
    onBeforeRender: html
  });

  const BottomLeft = useRef(null);
  useAdheseSlot(BottomLeft, {
    format: 'halfwidthsmallresponsive',
    slot: '_homepagebottom_left',
    renderMode: 'inline',
    onBeforeRender: html
  });

  return (
    <>
      <div id="top" className="ads">
        <div ref={TopRight} />
        <div ref={TopLeft} />
      </div>
      <div id="spacer"></div>
      <div id="bottom" className="ads">
        <div ref={BottomRight} />
        <div ref={BottomLeft} />
      </div>
    </>
  );
}
