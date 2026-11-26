/**
 * True in the AEM Sites editor (`/editor.html/...`) and with `wcmmode=edit`: the author's own sessions are not visitor
 * traffic, and no ads should be requested there. Other author modes (preview, the Universal Editor) are not detected.
 */
export function isAuthoring(win: Window = window): boolean {
  const { pathname, search } = win.location;

  return pathname.startsWith('/editor.html') || /[?&]wcmmode=edit(?:&|$)/.test(search);
}
