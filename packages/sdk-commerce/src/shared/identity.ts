/**
 * Customer identity (`mi`): a SHA-256 or HMAC hex hash, or a numeric customer ID. Nothing else is ever sent.
 */
const identityPattern = /^(?:[a-f0-9]{64}|\d{1,20})$/;

export function isIdentity(value: unknown): value is string {
  return typeof value === 'string' && identityPattern.test(value);
}

/**
 * A storefront whose consent banner asks for identity separately from measurement (Shopify: analytics vs marketing)
 * sets `window.adheseIdentityConsent = false` when only measurement was agreed. Without the flag, identity follows
 * the consent that allows the request.
 */
export function identityAllowed(win: Window): boolean {
  return (win as unknown as { adheseIdentityConsent?: boolean }).adheseIdentityConsent !== false;
}
