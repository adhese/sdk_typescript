import type { AdheseAd } from '@adhese/sdk';

export function renderIframe(ad: AdheseAd, element: HTMLElement): void {
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
          ${String(ad.tag)}
        </body>
      `.replaceAll(/\s+/g, ' ').trim();

  iframe.style.border = 'none';
  iframe.style.width = ad.width ? `${ad.width}px` : 'auto';
  iframe.style.height = ad.height ? `${ad.height}px` : 'auto';
  element.replaceChildren(iframe);
}

export function renderInline(ad: AdheseAd, element: HTMLElement): void {
  element.innerHTML = String(ad.tag);
}
