export type RenderOptions = {
  tag: string;
  width?: number | string;
  height?: number | string;
};

export function renderIframe(ad: RenderOptions, element: HTMLElement): void {
  const iframe = document.createElement('iframe');

  if (/^<!DOCTYPE\s+/i.test(ad.tag)) {
    iframe.srcdoc = ad.tag.replaceAll(/\s+/g, ' ').trim();
  }
  else {
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
  }

  iframe.style.border = 'none';
  iframe.style.width = typeof ad.width === 'number' ? `${ad.width}px` : (ad.width ?? 'auto');
  iframe.style.height = typeof ad.height === 'number' ? `${ad.height}px` : (ad.height ?? 'auto');
  element.replaceChildren(iframe);
}

export function renderInline(ad: RenderOptions, element: HTMLElement): void {
  element.innerHTML = String(ad.tag);
}
