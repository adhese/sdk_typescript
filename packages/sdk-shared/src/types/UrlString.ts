/**
 * Type that represents a URL string that starts with `http://` or `https://`.
 *
 * @deprecated use a regular string instead or use the native `URL` object.
 */
export type UrlString = `https://${string}.${string}` | `http://${string}.${string}`;
