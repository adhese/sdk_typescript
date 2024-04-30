/**
 * Type that represents a URL string that starts with `http://` or `https://`.
 */
export type UrlString = `https://${string}.${string}` | `http://${string}.${string}`;
