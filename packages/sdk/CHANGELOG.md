# @adhese/sdk

## 0.8.1

### Patch Changes

- ed346cb: Remove hooks from general export and add pass them as an argument when calling a plugin so they are properly scoped to the Adhese instance
- e8578f2: Add information about the current version in the package.json to plugins
- bef61c2: Remove logs from onInit and onDispose

## 0.8.0

### Minor Changes

- 1cc8bff: Create hooks to write plugins
- 10a18fd: Simplify exposed functions from sdk
- 10a18fd: Make addSlot function syncronous and remove add function

### Patch Changes

- ee019fd: Update README files to match package specific instructions
- 76566dc: Add jsdoc to AdheseOptions.safeframe

## 0.7.0

### Minor Changes

- 3e0b574: Create plugin system for @adhese/sdk and move @adhese/sdk-devtools to it

### Patch Changes

- c8c37d9: Replace special characters in parameters values with underscores
- 80d943b: Update dependencies
- fa24130: Replace lodash with remeda to offer a more modern solution to common utilities

## 0.6.4

### Patch Changes

- 53683c6: Filter out all external dependencies from bundle
- Updated dependencies [53683c6]
  - @adhese/sdk-devtools@0.6.4

## 0.6.3

### Patch Changes

- 99f728f: Replace lodash-es with lodash to prevent breaking CJS builds
- 85ee707: Remove dynamicImportInCjs option
- Updated dependencies [99f728f]
- Updated dependencies [85ee707]
  - @adhese/sdk-devtools@0.6.3

## 0.6.2

### Patch Changes

- e9fb6f3: Update build outputs to allow installation in CommonJS env
- Updated dependencies [e9fb6f3]
  - @adhese/sdk-devtools@0.6.2

## 0.6.1

### Patch Changes

- c435430: Remove unused safeframe package

## 0.6.0

### Minor Changes

- 41b0dd8: Add support for IAB Safeframe

### Patch Changes

- 9c80d57: Update dependencies
- Updated dependencies [9c80d57]
  - @adhese/sdk-devtools@0.6.0

## 0.5.2

### Patch Changes

- @adhese/sdk-devtools@0.5.2

## 0.5.1

### Patch Changes

- a211689: Fix issue where the transformed ad was sent again to the onBeforeRender callback making subsequent transforms not possible
- 7fc299d: Fix issue where onInit was executed multiple times
  - @adhese/sdk-devtools@0.5.1

## 0.5.0

### Minor Changes

- a666b90: Add onBeforeRender callback to intercept the to be rendered ad
- eac9754: Add Vue based reactivity to offer more flexible control flow
- eac9754: Make createAdhese and createSlot syncronous to simplify implementation
- a666b90: Add ability to receive JSON strings in the response tag/body

### Patch Changes

- Updated dependencies [d7f6111]
- Updated dependencies [eac9754]
- Updated dependencies [eac9754]
  - @adhese/sdk-devtools@0.5.0

## 0.4.0

### Minor Changes

- 52862a1: Add support for DALE gateway responses

### Patch Changes

- a4da136: Fix GET request not working with some slots properly
- Updated dependencies [52862a1]
- Updated dependencies [7bbe1ff]
  - @adhese/sdk-devtools@0.4.0

## 0.3.0

### Patch Changes

- 63cd49f: Add missing documentation for debugChange event
- Updated dependencies [22c81ff]
- Updated dependencies [e88cce4]
  - @adhese/sdk-devtools@0.3.0

## 0.2.0

### Minor Changes

- 82d823f: Create separate @adhese/sdk-devtool package to simplify dependencies in the @adhese/sdk package

### Patch Changes

- Updated dependencies [82d823f]
  - @adhese/sdk-devtools@0.2.0

## 0.1.5

### Patch Changes

- 6725b17: Add repository field to package.json

## 0.1.4

## 0.1.3

## 0.1.2

### Patch Changes

- 6c3b93e: Add license file
- 6c3b93e: Add license field to package.json files

## 0.1.1

### Patch Changes

- d481a4e: Add license file

## 0.1.0

### Minor Changes

- 9df9809: Add comitizen
- 9df9809: Initial release

### Patch Changes

- 9df9809: Update dependencies
- 9df9809: Fix eslint-config version number
