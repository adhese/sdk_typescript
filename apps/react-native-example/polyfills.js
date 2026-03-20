// Polyfill globalThis.crypto for React Native (Hermes).
// The Adhese SDK uses crypto.getRandomValues() for unique ID generation (non-cryptographic).
// This must be imported before any SDK code runs.

if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = /** @type {Crypto} */ ({});
}

if (typeof globalThis.crypto.getRandomValues !== 'function') {
  globalThis.crypto.getRandomValues = function getRandomValues(array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}
