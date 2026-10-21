# @adhese/sdk-lite

## 1.3.0

### Minor Changes

- d2f7304: Move the default Adhese hosts to the new `adhese.eu` domains.
  
  - `host`: `https://ads-<account>.adhese.com` → `https://<account>.ads.adhese.eu`
  - `poolHost`: `https://pool-<account>.adhese.com` → `https://<account>.pool.adhese.eu`
  - `previewHost`: `https://<account>-preview.adhese.org` → `https://<account>.preview.adhese.eu`
  
  This applies to the SDK, the server-side ad request helpers, SDK Lite and the user sync plugin. The devtools campaign, booking and creative links now point to `https://<account>.classic.adhese.eu`.
  
  Setups that pass `host`, `poolHost` or `previewHost` explicitly are not affected. If your site restricts outgoing requests (for example with a Content-Security-Policy `connect-src` or `frame-src`), add the new `*.adhese.eu` hosts.

## 1.2.0

### Minor Changes

- 112e224: Add `width` and `height` option to overwrite slot sizing

  **NOTE**: Only applies when `renderMode` is `iframe` or `undefined`

### Patch Changes

- Updated dependencies [112e224]
  - @adhese/sdk-shared@1.1.0

## 1.1.1

### Patch Changes

- d29a909: Remove logger to optmize output js file

## 1.1.0

### Minor Changes

- 431b736: When not passing an element to a lite slot the parent element of the script where it's called is selected

### Patch Changes

- 431b736: Improve documentation

## 1.0.0

### Major Changes

- ff93b63: 🎉🎉🎉 – Release 1.0.0 – 🎉🎉🎉

  This release marks the first stable release of the Adhese SDK packages. From here on out we will follow semantic
  versioning, meaning that all patch and minor updates will be backwards compatible. Major updates will introduce
  breaking changes.

### Patch Changes

- Updated dependencies [ff93b63]
- Updated dependencies [21aad18]
  - @adhese/sdk-shared@1.0.0
