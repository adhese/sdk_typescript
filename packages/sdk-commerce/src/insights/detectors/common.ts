import type { CommerceConfig } from '../../shared/config';
import type { Insights } from '../events';

export type Detector = (config: CommerceConfig, insights: Insights, win: Window) => () => void;

/**
 * Pathname of a link or request URL, or '' when it does not parse.
 */
export function pathOf(href: string | null | undefined, win: Window): string {
  try {
    return new URL(href ?? '', win.location.href).pathname;
  }
  catch {
    return '';
  }
}

export function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string')
    return input;

  return input instanceof URL ? input.href : input.url;
}

/**
 * Tell `onResponse` about every successful `fetch` of the page (the response is passed on untouched). Returns the undo.
 */
export function watchFetch(win: Window, onResponse: (url: string, init: RequestInit | undefined, response: Response) => void): () => void {
  const original = win.fetch;
  const patched: typeof fetch = (input, init) => {
    const promise = original.call(win, input, init);
    promise.then((response) => {
      try {
        if (response.ok)
          onResponse(requestUrl(input), init, response);
      }
      catch {
        // A detector must never break the page's own request.
      }
    }, () => {});

    return promise;
  };
  win.fetch = patched;

  return () => {
    win.fetch = original;
  };
}

/**
 * Listen on the document, and return the undo.
 */
export function listen<K extends 'click' | 'submit'>(win: Window, type: K, handler: (event: DocumentEventMap[K]) => void, capture = false): () => void {
  win.document.addEventListener(type, handler, capture);

  return () => {
    win.document.removeEventListener(type, handler, capture);
  };
}

/**
 * The element a click landed on, or its closest ancestor matching `selector`.
 */
export function closest(event: Event, selector: string): Element | null {
  const { target } = event;

  return target instanceof Element ? target.closest(selector) : null;
}
