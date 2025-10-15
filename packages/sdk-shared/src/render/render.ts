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
      `
      .replaceAll(/\s+/g, ' ')
      .trim();
  }

  iframe.style.border = 'none';
  iframe.style.width
    = typeof ad.width === 'number' ? `${ad.width}px` : ad.width ?? 'auto';
  iframe.style.height
    = typeof ad.height === 'number' ? `${ad.height}px` : ad.height ?? 'auto';
  element.replaceChildren(iframe);
}

function insertHtmlWithScripts(
  targetElement: HTMLElement,
  htmlString: string,
): void {
  const decodeHtml = (html: string): string => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  // Decode the HTML string
  const decodedHtmlString = decodeHtml(htmlString);
  // Create the complete HTML string with doctype
  const htmlStringWithDoctype = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Ad</title></head><body>${decodedHtmlString}</body></html>`;
  // Parse the HTML string
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlStringWithDoctype, 'text/html');

  // Append all style tags to the head
  const styleTags = doc.querySelectorAll('style');
  styleTags.forEach((styleTag) => {
    const style = document.createElement('style');
    style.id = styleTag?.id && '';
    style.textContent = styleTag.textContent;
    document.head.appendChild(style);
  });

  // Append all nodes except <script> and <style> to the target element
  while (doc.body.firstChild !== null) {
    const node = doc.body.firstChild as HTMLScriptElement;
    if (node.tagName === 'STYLE') {
      // Remove the script node from the parsed content
      doc.body.removeChild(node);
      // Skip the rest of this logic - styles already added
      continue;
    }

    if (node.tagName === 'SCRIPT') {
      // For script nodes, create a new script tag so that they get executed
      const script = document.createElement('script');

      if (node.src === '') {
        // Inline script
        script.textContent = node.textContent;
      }
      else {
        // External script
        script.src = node.src;
      }

      // Add any additional attributes (e.g., async, defer, etc.)
      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes.item(i);
        if (!attr) {
          continue;
        }
        script.setAttribute(attr.name, attr.value);
      }

      // Append to document
      document.body.appendChild(script);

      // Clean up after appending to avoid memory leaks
      document.body.removeChild(script);

      // Remove the script node from the parsed content
      doc.body.removeChild(node);
    }
    else {
      targetElement.appendChild(node);
    }
  }
}

export function renderInline(ad: RenderOptions, element: HTMLElement): void {
  insertHtmlWithScripts(element, String(ad.tag));
}
