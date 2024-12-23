# @adhese/sdk-shared

## 1.4.0

### Minor Changes

- f1a07cf: Deprecate very limited UrlString

## 1.3.1

### Patch Changes

- 52d0f0c: Async hooks that do not have an argument should settle promises concurrently

## 1.3.0

### Minor Changes

- 59e397c: Expose extra helpful types from the @vue/runtime-core package

## 1.2.0

### Minor Changes

- 97e282d: Add generateSlotSignature function to generate a unique signature based on the options of a slot and it's location

## 1.1.0

### Minor Changes

- 112e224: Add `width` and `height` option to overwrite slot sizing

  **NOTE**: Only applies when `renderMode` is `iframe` or `undefined`

## 1.0.0

### Major Changes

- ff93b63: 🎉🎉🎉 – Release 1.0.0 – 🎉🎉🎉

  This release marks the first stable release of the Adhese SDK packages. From here on out we will follow semantic
  versioning, meaning that all patch and minor updates will be backwards compatible. Major updates will introduce
  breaking changes.

### Minor Changes

- 21aad18: Move render functions to @adhese/sdk-shared

### Patch Changes

- Updated dependencies [ff93b63]
- Updated dependencies [21aad18]
  - @adhese/sdk@1.0.0

## 0.10.0

### Minor Changes

- de15eab: Update Remeda to 2.0.1

### Patch Changes

- 10a2c67: Update entry file(s)

## 0.9.2

### Patch Changes

- 1654711: Expand peer dependency range of @adhese/sdk to include version 0.17

## 0.9.1

### Patch Changes

- 2dda12f: Update peerDependencies to match nearest compatible version

## 0.9.0

### Minor Changes

- aa0ef98: Move zod exports to @adhese/sdk-shared
- d8b7f2e: Move remeda exports to @adhese/sdk-shared

## 0.8.0

### Minor Changes

- 34268cf: Move generateName function @adhese/sdk-shared

## 0.7.0

### Minor Changes

- a4b013d: Move addTrackingPixel to @adhese/sdk-shared
- 696b4ea: Replace @vue/runtime-core with @vue/reactivity and @vue-reactivity/watch

## 0.6.0

### Minor Changes

- 2c01e34: Replace nanoid with own code
- ef68972: Move hook create functions to @adhese/sdk-shared

### Patch Changes

- ad9b38f: Fix types not being declared for other exports

## 0.5.1

### Patch Changes

- 1164c2b: Move Zod validators to seperate exports

## 0.5.0

### Minor Changes

- 4cb01f8: Reexport extra useful types from @vue/runtime-core

## 0.4.0

### Minor Changes

- eca8056: Move all vue-runtime-core exports to @adhese/sdk-shared

## 0.3.1

### Patch Changes

- 2619416: Fix externals being inclued in output js

## 0.3.0

### Minor Changes

- 242cfa3: Replace uniqueId functionality with the nanoid package

## 0.2.0

### Minor Changes

- 44130f4: Move createLogger to @adhese/sdk-shared

## 0.1.1

### Patch Changes

- dbc1db3: Fix NPM files not pointing to dist folder

## 0.1.0

### Minor Changes

- eebcd88: Release @adhese/sdk-shared
