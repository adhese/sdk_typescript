import type { Ad } from '@core';

export function renderIframe(ad: Ad, element: HTMLElement): void {
  const iframe = document.createElement('iframe');
  iframe.srcdoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          ${ad.tag}
        </body>
      `.replaceAll(/\s+/g, ' ').trim();

  iframe.style.border = 'none';
  iframe.style.width = ad.width ? `${ad.width}px` : '100%';
  iframe.style.height = ad.height ? `${ad.height}px` : '100%';
  element.replaceChildren(iframe);
}

export function renderInline(ad: Ad, element: HTMLElement): void {
  element.style.width = ad.width ? `${ad.width}px` : '100%';
  element.style.height = ad.height ? `${ad.height}px` : '100%';

  element.innerHTML = ad.tag;
}
